const MatchPoolController = require("../database/REDIS/controllers/MatchPoolController");
const redisTests = require("../database/REDIS/config/redisTests");

const DATE_ACCURACY = 15;    // in minutes. 
const DATE_ACCURACY_MS = DATE_ACCURACY * 60000;
const CREATE_SESSION_MS = 10*60000; /* threshold for when to create a new session */ 

const USER_SCHEMA = { // eslint-disable-line no-unused-vars
  /* partner metadata */ 
  metadata: {
    ID: String,
    profileImageUrl: String, // i think?
    displayName: String
  },
  /* partner preferences */ 
  preferences: Object,
  /* partner data to compare against preferences */
  preferenceData: Object
};

/**
 * Ensures that date is not in past and that corresponds to a slot 
 * and checks whether session must be created/replaced or just added to the pool
 * @param {Number/String} date 
 */
function validateDate(date) {
  const dateMS = Number(date);
  if (dateMS < Date.now()) {
    return {
      success: false,
      reason: "past"
    }
  }
  if (dateMS % DATE_ACCURACY_MS !== 0) {
    return {
      success: false,
      reason: "not_slot"
    }
  }
  if (dateMS - Date.now() < CREATE_SESSION_MS) {
    return {
      success: true,
      createSession: true
    }
  }
  return {
    success: true, 
    createSession: false
  }
}

/**
 * Checks that users' preferences are not contradictory 
 * and some other sanity checks
 * @param {USER_SCHEMA} user1 
 * @param {USER_SCHEMA} user2 
 */
function validateUsers(user1, user2) {
  if (!user1.metadata.ID || !user2.metadata.ID) {
    return {
      success: false, 
      reason: "no user"
    }
  }
  if (user1.metadata.ID === user2.metadata.ID) {
    return {
      success: false,
      reason: "same user"
    }
  }
  // TODO add preference checking
  return {
    success: true
  }
}

async function handleRematch(userToRematch, dateTime) {
  console.log("@handlerematch: ", userToRematch);
  let returnObject = {
    success: true,
    createdMatches: [],
    removedFromPool: []
  }
  if (!userToRematch.rematchAllowed) {
    returnObject.removedFromPool.push(userToRematch.ID);
    return returnObject;
  }
  try {
    let cursor = "0";
    let iterations = 0;
    let matchFound = false;
    do {
      iterations++;
      const result = await MatchPoolController.scanUnmatchedPool(dateTime, cursor);
      console.log("@handlerematch scan result: ", result, iterations);
      cursor = result.cursor; 
      
      let breakValue = false;
      let foundUserID;
      const userIDArray = Array.from(result.userIDSet);
      for (let i=0; i<userIDArray.length; i++) {
        // TODO add preference comparison etc
        foundUserID = userIDArray[i];
        breakValue = true;
        break;
      }
      if (foundUserID) {
        const rematchResult = await MatchPoolController.replaceOneMatch(dateTime, userToRematch.ID, foundUserID, true, true);
        console.log("@handlerematch rematchresult: ", rematchResult);
        /* handle the people who got rematched now */ 
        for (let i=0; i<rematchResult.rematchArray.length; i++) {
          if (rematchResult.rematchArray[i].rematchAllowed) {
            await setToUnmatchedWithoutDeletion(dateTime, rematchResult.rematchArray[i].ID);
            returnObject.createdMatches.push([rematchResult.rematchArray[i].ID, ""]);
          } else {
            returnObject.removedFromPool.push(rematchResult.rematchArray[i].ID);
          }
        }
        matchFound = true;
        returnObject.createdMatches.push(rematchResult.createdMatches);
        break;
      }
      console.log("cursor == 0: ", cursor === 0, cursor == 0, cursor !== "0", cursor != "0");
    } while (cursor !== "0" && iterations < 10);
    if (!matchFound) {
      await MatchPoolController.setToUnmatchedWithoutDeletion(dateTime, userToRematch.ID);
      returnObject.createdMatches.push([userToRematch.ID, ""]);
    }
  } catch (error) {
    console.log("@handlerematch error: ", error);
  }
  return returnObject;
}

async function setAsUnmatched(userID, dateTime) {
  const result = await MatchPoolController.setToUnmatched(dateTime, userID);
  let rematchResult = {createdMatches:[]};
  if (result.userToRematch) {
    rematchResult = await handleRematch(userToRematch, dateTime);
    console.log("@setasunmatched rematchresult: ", rematchResult);
  }

  return {
    success: result.success,
    createdMatches: [[userID, ""], ...rematchResult.createdMatches],
    removedFromPool: rematchResult.removedFromPool,
  }
}
async function setAsMatched(user1_ID, user2_ID, dateTime) {
  // allowRematch atm set to true to both at creation
  console.log("@setasmatched: ", user1_ID, user2_ID, dateTime);
  const result = await MatchPoolController.replaceOneMatch(
    dateTime, user1_ID, user2_ID, true, true
  ); 
  let rematchResultPromises = [];
  for (let i=0; i<result.rematchArray.length; i++) {
    rematchResultPromises.push(handleRematch(result.rematchArray[i], dateTime));
  }
  let rematchResults = await Promise.all(rematchResultPromises);

  console.log("@setasmatched creationresult:", result);
  console.log("@setasmatched rematchResult:", rematchResults);
  let createdMatches = [result.createdMatches]
  let removedFromPool = [];
  for (let i=0; i<rematchResults.length; i++) {
    createdMatches.push(...rematchResults[i].createdMatches);
    removedFromPool.push(...rematchResults[i].removedFromPool);
  }
  console.log("@setasmatched createdmatches:", createdMatches);
  console.log("@setasmatched removedFromPool", removedFromPool);
  return {
    success: result.success,
    createdMatches,
    removedFromPool
  }
}

/**
 * Handles the creation of one match. That includes rematching etc
 * @param {USER_SCHEMA} user1 -- the user who requested the match
 * @param {USER_SCHEMA} user2 -- the other user if exists
 * @param {String/Number} dateTime 
 */
async function createOneMatch(user1, user2, dateTime) {
  // console.log("@createonematch: ", user1, user2, dateTime);
  if (!user2 && user1 && user1.metadata && user1.metadata.ID) {
    /* the other user not requested so set as unmatched, no session necessary */
    console.log("@createonematch, setting unmatched");
    return setAsUnmatched(user1.metadata.ID, dateTime);
  } 
  const userValidationResult = validateUsers(user1, user2);
  const dateValidationResult = validateDate(dateTime);
  console.log("@craeteonematch uservalidationresult: ", userValidationResult);
  console.log("@createonematch datevalidationresult: ", dateValidationResult);
  if (userValidationResult.success && dateValidationResult.success) {
    console.log("@createonematch validation successful");
    const matchingResult = await setAsMatched(user1.metadata.ID, user2.metadata.ID, dateTime);
    console.log("@createonematch matchingresult: ", matchingResult);
    if (dateValidationResult.createSession) {

      // TODO call mongo
    }
  }
  console.log("@createonematch DONE");
  /* validation unsuccessful */ 

}

/* 
  All dates in this file are milliseconds from Unix epoch of type String.
  That is, all requests from the front end must convert their date object to milliseconds before sending.
  Maybe that's the default behaviour anyway, idk.
*/
CalendarSocketController = function(CALENDAR_NAMESPACE, socket) {

  socket.on("disconnect", (reason) => {
    console.log("a user disconnected from calendar match: ", reason);
  });

  socket.on("connect", () => {
    console.log("a user connected to calendar match: ", socket.id);
  })
  /**
   * @param {
   *  userData: USER_SCHEMA -- user who requested a match
   *  matchedUserData: USER_SCHEMA -- user to match with
   *  dateTime: in ms
   * } data -- data sent by user
   * @param {function} callback -- send acknowledgement to client
   */
  socket.on("BOOK_ONE_SLOT", async (data, callback) => {
    
  });

  socket.on("BOOK_MANY_SLOTS", async (data, callback) => {

  });

  socket.on("CANCEL_MATCH", async (data, callback) => {

  });

  socket.on("PRINT_REDIS", () => {
    printRedis("cal:", true);
  });

  socket.on("DELETE_REDIS", () => {
    console.log("REDIS DELETED");
    deleteRedis();
  });

  
};

function generateUser(ID, name="haha") {
  return {
    metadata: {
      ID: String(ID),
      displayName: name,
    },
    preferences: {
      test: "blah",
    },
    preferenceData: {
      random: ID
    }
  }
}

async function tests() {
  try {
    const user1 = generateUser(1);
    const user2 = generateUser(2);
    const user3 = generateUser(3);
    const user4 = generateUser(4);
    const user5 = generateUser(5);
    const user6 = generateUser(6);
    const user11 = generateUser(11);
    const user12 = generateUser(12);
    const user13 = generateUser(13);
    const user14 = generateUser(14);
    const user15 = generateUser(15);
    const user16 = generateUser(16);
    const date1Date = new Date(2020, 11, 24, 12, 0, 0);
    const date2Date = new Date(2020, 11, 24, 13, 0, 0);
    const date1 = date1Date.valueOf();
    const date2 = date2Date.valueOf();
    const dateNOW = Date.now();
    console.log("user1: ", user1);
    console.log("date1: ", date1);
    console.log("date2: ", date2);
    console.log("Verifying redis status before....");
    await redisTests.deleteRedis();
    await redisTests.printMatchPool();
    console.log("Setting up initial matches....")
    await createOneMatch(user1, user2, date1);
    console.log("************************")
    await createOneMatch(user3, user4, date1);
    console.log("************************")
    await createOneMatch(user11, user12, date2);
    console.log("************************")
    await createOneMatch(user13, user14, date2);
    console.log("************************")
    console.log("Matches set up.");
    await redisTests.printMatchPool();
    console.log("Trying to set up illegal matches...");
    await createOneMatch(user5, user6, dateNOW);
    console.log("************************")
    await createOneMatch(user5, user5, date1);
    console.log("************************")
    await createOneMatch(user5, user5, dateNOW);
    console.log("************************")
    await redisTests.printMatchPool();
    console.log("setting up lonely people...");
    console.log("************************")
    await createOneMatch(user5, "", date1);
    console.log("************************")
    await createOneMatch(user6, "", date1);
    console.log("************************")
    await redisTests.printMatchPool();
    console.log("switching between people....");
    console.log("************************")
    await createOneMatch(user15, user1, date1);
    console.log("************************")
    await createOneMatch(user16, user1, date1);
    console.log("************************")
    await redisTests.printMatchPool();
    console.log("************************")
    console.log("Switching between already matched people");
    console.log("************************")
    await createOneMatch(user1, user2, date1);
    console.log("************************")
    await createOneMatch(user1, user2, date2);
    console.log("************************")
    await redisTests.printMatchPool();
    console.log("Cleaning up...")
    await redisTests.deleteRedis();
  } catch (error) {
    console.log("@tests error: ", error);
  }
}

module.exports = {
  CalendarSocketController,
  tests
}
// socket.on("BOOK_ONE_SLOT", async (data, callback) => {
//   // happens asynchronously atm
//   console.log("received BOOK_SLOTS, data: ", data);
//   let sessions = [];
//   let returnData = {};
//   try {
//     const result = await MatchDataController.setManyBookings(data.ID, data.datetimes, 0, false);
//     for (let i=0; i<result.length; i++) {
//       if (result == "1") {
//         sessions.push({
//           datetime: data.datetimes[i],
//           user1_ID: data.ID,
//         });
//       }
//     }
//     socket.emit("NEW_BOOKINGS", sessions);
//     returnData.success = true;
//   } catch (error) {
//     console.log("@BOOK_SLOTS error: ", error);
//     returnData.success = false;
//   }
//   returnData.sessions = sessions;

//   callback(returnData);
// });

// /**
//  * Cancels bookings (not matches!)
//  * @param {
//  *  ID -- user ID who cancelled 
//  *  [datetimes] -- array of datetimes for which to cancel the bookings 
//  * } data - 
//  */
// socket.on("CANCEL_BOOKINGS", async (data) => {
//   console.log("received CANCEL_BOOKINGS, data: ", data);
//   try {
//     await MatchDataController.delManyBookings(data.ID, data.datetimes, false);
//     socket.emit("BOOKINGS_CANCELLED", data);
//   } catch (error) {
//     // TODO handle to client
//     console.log("error at cancel_bookings", error);
//   }
// });

// /**
//  * 1. Deletes unmatched people from unmatched Redis
//  *    Then creates a session for all those unmatched people
//  *    Pushing the created sessions to matched Redis is happening when the session is created (handled in UpcomingSessionController)
//  * 2. For people who weren't unmatched, checks if they have a matched session 
//  *    If not, this session is not created (probs sb else matched faster)
//  *    If yes, changes the session (handled in UpcomingSessionController)
//  * @param {
//  *  ID -- user ID who requested the matches
//  *  [matchIDs] -- array of user IDs with whom to match 
//  *  [datetimes] -- array of corresponding datetimes
//  * } data  
//  * matchIDs.length === datetimes.length
//  */
// socket.on("REQUEST_MATCHES", async (data) => {
//   console.log("received REQUEST_MATCHES, data: ", data);
//   try {
//     let deletedArray = [];
//     /* Delete all from Redis so that others cannot match */
//     for (let i=data.matchIDs.length; i>=0; i--) {
//       /* cannot match with yourself */
//       if (data.matchIDs[i] == data.ID) {
//         // sry i did a bad thing
//         data.matchIDs.splice(i, 1);
//         data.datetimes.splice(i, 1);
//         continue;
//       }
//       console.log("removing from match pool: ", data.matchIDs[i], data.datetimes[i])
//       deletedArray.push(MatchDataController.delAtSlot(data.matchIDs[i], data.datetimes[i]));
//     }
//     console.log("REMOVING ITSELF")
//     deletedArray.push(MatchDataController.delManyBookings(data.ID, data.datetimes, true));

//     /* wait for deletion to complete */
//     const deletionResults = await Promise.all(deletedArray);
//     const original = deletionResults.splice(deletionResults.length-1, 1)[0];

//     console.log("deletionResults: ", deletionResults);
//     console.log("original: ", original);
//     let promiseArray = [];
//     for (let i=0; i<deletionResults.length; i++) {
//       console.log("datetime: ", data.datetimes[i], "matched id: ", data.matchIDs[i]);
//       let pushed = false;
//       const sessionData = {
//         user1_ID: data.ID,
//         user2_ID: data.matchIDs[i],
//         datetime: new Date(Number(data.datetimes[i])),
//         deletionResult: deletionResults[i].result,
//       }
//       if (deletionResults[i].success) {
//         if (deletionResults[i].result === "0") {
//           /* if partner was previously unmatched, just create a new session */
//           console.log("creating new session: ", sessionData);
//           promiseArray.push(UpcomingSessionsController.createOneCalendarSession(sessionData));
//           pushed = true;
//         } else if (deletionResults[i].result === "1") {
//           /* if partner was previously matched, replace their session with yours */
//           console.log("replacing a session session: ", sessionData);
//           promiseArray.push(UpcomingSessionsController.replaceOneCalendarSession(sessionData));
//           pushed = true;
//         }
//       } else {
//         /* if deletion was not successful, just add to match pool as unmatched */ 
//         MatchDataController.setOneBooking(data.ID, data.datetimes[i], 0);
//         console.log("somebody was faster");
//       }
//       if (!pushed) {
//         /* add to results for rollback */
//         promiseArray.push(new Promise((resolve, reject) => {
//           resolve(sessionData);
//         }));
//       }
//     }

//     const createdSessions = await Promise.all(promiseArray);
    
//     /* RESTORE REDIS IF DID NOT SUCCEED and have a massive fkn headache */ 

//     for (let i=createdSessions.length-1; i >= 0; i--) {
//       // if session with i-th person was not created restore Redis status and remove from return results
//       console.log("LENGTH: ", createdSessions.length, original.length);
//       if (!createdSessions[i]._id) {
//         console.log("restoring redis status: ",createdSessions[i]);
//         if (createdSessions[i].deletionResult) {
//           console.log("redis status before: ", createdSessions[i].deletionResult);
//           await MatchDataController.setOneBooking(
//             createdSessions[i].user2_ID, 
//             String(createdSessions[i].datetime.valueOf()),
//             createdSessions[i].deletionResult,
//             true,
//           );
//         }
//         if (original[i] !== null) {
//           console.log("redis restoring original:");
//           await MatchDataController.setOneBooking(
//             createdSessions[i].user1_ID,
//             String(createdSessions[i].datetime.valueOf()),
//             original[i],
//             true
//           );
//         }
        
        
//         createdSessions.splice(i, 1);
//       } 
//     }
    
//     CALENDAR_NAMESPACE.to(socket.id).emit("MATCH", {
//       sessions: createdSessions
//     });
    
//     // TODO: send data to connected matched users

//   } catch (error) {
//     console.log("error at REQUEST_MATCHES", error);
//   }
  
// });

// /**
//  * 1. Remove user from Redis match collection
//  * 2. Set all cancelled users as unmatched in Redis (even if they weren't in redis before)
//  * 3. Remove all the sessions from Mongo
//  * @param {
//  *  ID -- user ID
//  *  [datetimes] -- array of datetimes in String(date.valueOf()) form
//  * } data -- 
//  */
// socket.on("CANCEL_MATCHES", async (data) => {
//   console.log("received CANCEL_MATCHES, data: ", data);
//   try {
//     // asynchronous operations, since we don't really care when they'll finish
//     MatchDataController.delManyBookings(data.ID, data.datetimes, true);
//     let promiseArray = [];
//     for (let i=0; i<data.cancelledIDs.length; i++) {
//       promiseArray.push(UpcomingSessionsController.removeOneSession_datetime_userID(
//         new Date(Number(data.datetimes[i])), 
//         data.ID
//       ));
//     }

//     const deletionResults = await Promise.all(promiseArray);

//     console.log("deletion results: ", deletionResults);

//     for (let i=0; i<deletionResults.length; i++) {
//       if (deletionResults[i]) {
//         let cancelledUser;
//         if (deletionResults[i].user1_ID != data.ID) {
//           cancelledUser = deletionResults[i].user1_ID;
//         } else if (deletionResults[i].user2_ID != data.ID) {
//           cancelledUser = deletionResults[i].user2_ID;
//         } else {
//           console.log("get fucked");
//           continue;
//         }
//         MatchDataController.setOneBooking(cancelledUser, String(deletionResults[i].datetime.valueOf()), 0, true);
//       }
//     }
//     // TODO emit to others that ID at datetime is not currently matching 
//     // TODO emit to cancelled users that their match was cancelled
//     // TODO send acknowledgement back to the user

//   } catch (error) {
//     console.log("Error at CANCEL_MATCHES", error);
//   }
// });