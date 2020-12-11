const { MatchDataController } = require("../database/REDIS/redis");
const { UpcomingSessionsController } = require("../database/mongo");
const { printRedis, deleteRedis } = require("../tests/dbtest");

const parseDateInRequest = date => new Date(Number(date));

/* 
  All dates in this file are milliseconds from Unix epoch of type String.
  That is, all requests from the front end must convert their date object to milliseconds before sending.
  Maybe that's the default behaviour anyway, idk.
*/
module.exports = function(CALENDAR_NAMESPACE, socket) {

  socket.on("disconnect", (reason) => {
    console.log("a user disconnected from calendar match: ", reason);
  });

  socket.on("connect", () => {
    console.log("a user connected to calendar match: ", socket.id);
  })
  /**
   * @param {
   *  ID -- user ID who books books slots 
   *  [datetimes] -- array of datetimes for which to cancel these bookings. 
   *  data -- user data 
   *  preferences -- user preferences
   * }
   */
  socket.on("BOOK_SLOTS", async (data) => {
    // happens asynchronously atm
    console.log("received BOOK_SLOTS, data: ", data);
    MatchDataController.setManyBookings(data.ID, data.datetimes, 0, false);

    socket.emit("NEW_BOOKINGS", data);
  });

  /**
   * Cancels bookings (not matches!)
   * @param {
   *  ID -- user ID who cancelled 
   *  [datetimes] -- array of datetimes for which to cancel the bookings 
   * } data - 
   */
  socket.on("CANCEL_BOOKINGS", async (data) => {
    console.log("received CANCEL_BOOKINGS, data: ", data);
    try {
      await MatchDataController.delManyBookings(data.ID, data.datetimes, false);
      socket.emit("BOOKINGS_CANCELLED", data);
    } catch (error) {
      // TODO handle to client
      console.log("error at cancel_bookings", error);
    }
  });

  /**
   * 1. Deletes unmatched people from unmatched Redis
   *    Then creates a session for all those unmatched people
   *    Pushing the created sessions to matched Redis is happening when the session is created (handled in UpcomingSessionController)
   * 2. For people who weren't unmatched, checks if they have a matched session 
   *    If not, this session is not created (probs sb else matched faster)
   *    If yes, changes the session (handled in UpcomingSessionController)
   * @param {
   *  ID -- user ID who requested the matches
   *  [matchIDs] -- array of user IDs with whom to match 
   *  [datetimes] -- array of corresponding datetimes
   * } data  
   * matchIDs.length === datetimes.length
   */
  socket.on("REQUEST_MATCHES", async (data) => {
    console.log("received REQUEST_MATCHES, data: ", data);
    try {
      let deletedArray = [];
      for (let i=0; i<data.matchIDs.length; i++) {
        if (data.matchIDs[i] == data.ID) {
          // sry i did a bad thing
          data.matchIDs.splice(i, 1);
          data.datetimes.splice(i, 1);
          i--;
          continue;
        }
        console.log("removing from match pool: ", data.matchIDs[i], data.datetimes[i])
        deletedArray.push(MatchDataController.delAtSlot(data.matchIDs[i], data.datetimes[i]));
      }
      console.log("REMOVING ITSELF")
      deletedArray.push(MatchDataController.delManyBookings(data.ID, data.datetimes, true));

      const deletionResults = await Promise.all(deletedArray);
      const original = deletionResults.splice(deletionResults.length-1, 1)[0];

      console.log("deletionResults: ", deletionResults);
      console.log("original: ", original);
      let promiseArray = [];
      // console.log("upcoming sessions controller: ", UpcomingSessionsController);
      for (let i=0; i<deletionResults.length; i++) {
        console.log("datetime: ", data.datetimes[i], "matched id: ", data.matchIDs[i]);
        console.log("deletionResults: ")
        let pushed = false;
        const sessionData = {
          user1_ID: data.ID,
          user2_ID: data.matchIDs[i],
          datetime: new Date(Number(data.datetimes[i])),
          deletionResult: deletionResults[i].result,
        }
        if (deletionResults[i].success) {
          if (deletionResults[i].result === "0") {
            console.log("deletion was successful with result ", 0)
            // previously unmatched 
            console.log("creating new session: ", sessionData);
            promiseArray.push(UpcomingSessionsController.createOneCalendarSession(sessionData));
            pushed = true;
          } else if (deletionResults[i].result === "1") {
            console.log("deletion was successful with result", 1);
            // previously matched
            console.log("replacing a session session: ", sessionData);
            promiseArray.push(UpcomingSessionsController.replaceOneCalendarSession(sessionData));
            pushed = true;
          }
        } else {
          MatchDataController.setOneBooking(data.ID, data.datetimes[i], 0);
          console.log("somebody was faster");
        }
        if (!pushed) {
          promiseArray.push(new Promise((resolve, reject) => {
            resolve(sessionData);
          }));
        }
      }

      const createdSessions = await Promise.all(promiseArray);
      /* RESTORE REDIS IF DID NOT SUCCEED and have a massive fkn headache */ 

      for (let i=createdSessions.length-1; i >= 0; i--) {
        // if session with i-th person was not created restore Redis status and remove from return results
        console.log("LENGTH: ", createdSessions.length, original.length);
        if (!createdSessions[i]._id) {
          console.log("restoring redis status: ",createdSessions[i]);
          if (createdSessions[i].deletionResult) {
            console.log("redis status before: ", createdSessions[i].deletionResult);
            await MatchDataController.setOneBooking(
              createdSessions[i].user2_ID, 
              String(createdSessions[i].datetime.valueOf()),
              createdSessions[i].deletionResult,
              true,
            );
          }
          if (original[i] !== null) {
            console.log("redis restoring original:");
            await MatchDataController.setOneBooking(
              createdSessions[i].user1_ID,
              String(createdSessions[i].datetime.valueOf()),
              original[i],
              true
            );
          }
          
          
          createdSessions.splice(i, 1);
        } 
      }
      
      CALENDAR_NAMESPACE.to(socket.id).emit("MATCH", {
        sessions: createdSessions
      });
      
      // TODO: send data to connected matched users

    } catch (error) {
      console.log("error at REQUEST_MATCHES", error);
    }
    
  });

  /**
   * 1. Remove user from Redis match collection
   * 2. Set all cancelled users as unmatched in Redis (even if they weren't in redis before)
   * 3. Remove all the sessions from Mongo
   * @param {
   *  ID -- user ID
   *  [datetimes] -- array of datetimes in String(date.valueOf()) form
   * } data -- 
   */
  socket.on("CANCEL_MATCHES", async (data) => {
    console.log("received CANCEL_MATCHES, data: ", data);
    try {
      // asynchronous operations, since we don't really care when they'll finish
      MatchDataController.delManyBookings(data.ID, data.datetimes, true);
      let promiseArray = [];
      for (let i=0; i<data.cancelledIDs.length; i++) {
        promiseArray.push(UpcomingSessionsController.removeOneSession_datetime_userID(
          new Date(Number(data.datetimes[i])), 
          data.ID
        ));
      }

      const deletionResults = await Promise.all(promiseArray);

      console.log("deletion results: ", deletionResults);

      for (let i=0; i<deletionResults.length; i++) {
        if (deletionResults[i]) {
          let cancelledUser;
          if (deletionResults[i].user1_ID != data.ID) {
            cancelledUser = deletionResults[i].user1_ID;
          } else if (deletionResults[i].user2_ID != data.ID) {
            cancelledUser = deletionResults[i].user2_ID;
          } else {
            console.log("get fucked");
            continue;
          }
          MatchDataController.setOneBooking(cancelledUser, String(deletionResults[i].datetime.valueOf()), 0, true);
        }
      }
      // TODO emit to others that ID at datetime is not currently matching 
      // TODO emit to cancelled users that their match was cancelled
      // TODO send acknowledgement back to the user

    } catch (error) {
      console.log("Error at CANCEL_MATCHES", error);
    }
  });

  socket.on("PRINT_REDIS", () => {
    printRedis("cal:", true);
  });

  socket.on("DELETE_REDIS", () => {
    console.log("REDIS DELETED");
    deleteRedis();
  });
};