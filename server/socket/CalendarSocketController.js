const MatchPoolController = require("../../database/REDIS/controllers/MatchPoolController");
const { createOneMatch, cancelOneMatch } = require("./calendarMatchHelpers");
const { emitMatchPoolChanges } = require("./calendarEmitHelpers");
const redisTests = require("../../database/REDIS/config/redisTests");



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

/* from KeyValueParsers.unarseMatchedValue */
const USER_TO_REMATCH = {
  rematchAllowed: Boolean,
  ID: String 
}

const debug_ = true;
function debug() {
  const {format} = require("util");
  if (debug_) {
    process.stdout.write(format.apply(this, arguments) + '\n');
  }
}




/* 
  All dates in this file are milliseconds from Unix epoch of type String.
  That is, all requests from the front end must convert their date object to milliseconds before sending.
  Maybe that's the default behaviour anyway, idk.
*/
CalendarSocketController = function(CALENDAR_NAMESPACE, socket) {

  socket.on("disconnect", (reason) => {
    debug("a user disconnected from calendar match: ", reason);
  });

  socket.on("connect", () => {
    debug("a user connected to calendar match: ", socket.id);
  })

  /**
   * @param {
   *  userData: USER_SCHEMA -- user who requested a match
   *  matchedUserData: USER_SCHEMA -- user to match with
   *  dateTime: in ms
   * } data -- data sent by user
   * @param {function} callback -- send acknowledgement to client -- success: true or false
   */
  socket.on("BOOK_ONE_SLOT", async (data, callback) => {
    const {userData, matchedUserData, dateTime} = data;
    debug("@bookoneslot: userdata", userData);
    debug("@bookoneslot: matchedUserData: ", matchedUserData);
    debug("@bookoneslot, dateTime: ", dateTime, new Date(dateTime));

    if (!userData || !userData.metadata || !userData.metadata.ID || !dateTime) {
      callback({success: false});
    } else {
      const matchingResult = await createOneMatch(userData, matchedUserData, dateTime);
      debug("@bookoneslot matchingResult: ", matchingResult);
      emitMatchPoolChanges(CALENDAR_NAMESPACE, dateTime, userData, matchedUserData, matchingResult);
      callback({success: matchingResult.success});
    }
  });

  /**
   * @param {
    *  userData: USER_SCHEMA -- user who requested a match
    *  matchedUserData: USER_SCHEMA -- user to match with
    *  dateTime: in ms
    * } data -- data sent by user
    * @param {function} callback -- send acknowledgement to client
    */
  socket.on("CANCEL_ONE_SLOT", async (data, callback) => {
    const {userData, matchedUserData, dateTime} = data;
    debug("@canceloneslot: userdata", userData);
    debug("@canceloneslot: matchedUserData: ", matchedUserData);
    debug("@canceloneslot, dateTime: ", dateTime, new Date(dateTime));
    if (!userData || !userData.metadata || !userData.metadata.ID || !dateTime) {
      callback({success: false});
    } else {
      const cancelResult = await cancelOneMatch(dateTime, userData.metadata.ID);
      emitMatchPoolChanges(CALENDAR_NAMESPACE, dateTime, userData, matchedUserData, cancelResult);
      debug("@canceloneslot cancelresult: ", cancelResult);
      callback({success: cancelResult.success});
    }
  });


  socket.on("BOOK_MANY_SLOTS", async (data, callback) => {

  });

  

  socket.on("PRINT_REDIS", () => {
    redisTests.printMatchPool();
  });

  socket.on("DELETE_REDIS", () => {
    debug("REDIS DELETED");
    deleteRedis();
  });

  
};

function generateUser(ID, name="name") {
  return {
    metadata: {
      ID: String(ID),
      displayName: name+String(ID),
      username: "user"+String(ID)
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
    debug("user1: ", user1);
    debug("date1: ", date1);
    debug("date2: ", date2);
    debug("Verifying redis status before....");
    await redisTests.deleteRedis();
    await redisTests.printMatchPool();
    debug("Setting up initial matches....")
    await createOneMatch(user1, user2, date1);
    debug("************************")
    await createOneMatch(user3, user4, date1);
    debug("************************")
    await createOneMatch(user11, user12, date2);
    debug("************************")
    await createOneMatch(user13, user14, date2);
    debug("************************")
    debug("Matches set up.");
    await redisTests.printMatchPool();
    debug("Trying to set up illegal matches...");
    await createOneMatch(user5, user6, dateNOW);
    debug("************************")
    await createOneMatch(user5, user5, date1);
    debug("************************")
    await createOneMatch(user5, user5, dateNOW);
    debug("************************")
    await redisTests.printMatchPool();
    debug("setting up lonely people...");
    debug("************************")
    await createOneMatch(user5, "", date1);
    debug("************************")
    await createOneMatch(user6, "", date1);
    debug("************************")
    await redisTests.printMatchPool();
    debug("switching between people....");
    debug("************************")
    await createOneMatch(user15, user1, date1);
    debug("************************")
    await createOneMatch(user16, user1, date1);
    debug("************************")
    await redisTests.printMatchPool();
    debug("************************")
    debug("Switching between already matched people");
    debug("************************")
    await createOneMatch(user1, user2, date1);
    debug("************************")
    await createOneMatch(user1, user2, date2);
    debug("************************")
    await createOneMatch(user4, null, date2);
    debug("************************")
    await redisTests.printMatchPool();
    debug("Cleaning up...")
    await redisTests.deleteRedis();
  } catch (error) {
    debug("@tests error: ", error);
  }
}
module.exports = {
  CalendarSocketController,
  // tests
}
