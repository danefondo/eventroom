const { MatchDataController } = require("../../REDIS/redis");
const { UserDataController } = require("../../REDIS/redis");

// const BookingUtilities = require("../utilities/BookingUtilities");

let UpcomingSessions = null;

const printError = function(message, error) {
  console.log("Error at UpcomingSessionsController: ", message, error);
}

const SESSION_INTERVAL = 15; // minutes
const RANGE_QUERY_MAX_SESSIONS = 7*24*60/SESSION_INTERVAL;
const SESSION_LENGTH = 50*60*1000;

const dateToRedis = JSdate => String(JSdate.valueOf());

/*
  THERE HAS TO BE SEPARATION BETWEEN INSTANT SESSION AND CALENDAR SESSION 
  when creating a session
  because instant session will not be pushed to Redis
  calendar sessions are
*/
/**
 * @param {String} userID 
 * @param {Date} startDatetime 
 * @param {Date} endDatetime 
 * @return true if exists, false otherwise. 
 */
const checkExistenceInRange = async function(userID, startDatetime, endDatetime) {
  try {
    const result = await UpcomingSessions.findOne({
      datetime: {$gte: startDatetime, $lt: endDatetime},
      $or: [{user1_ID: userID}, {user2_ID: userID}]
    });
    if (!result) {
      return false;
    }
  } catch (error) {
    printError("@checkexistenceinrange: ", error);
  }
  return true;
}

/**
 * @param {
 *  datetime -- in ms as String or Number
 *  user1_ID 
 *  user2_ID  
 * } sessionData 
 */
const checkSessionValidity = async function(sessionData) {
  const sessionDatetime = sessionData.datetime.valueOf();

  /* Allows lag of up to 1 minute -- important in e.g. instant sessions */
  if (sessionDatetime <= Date.now().valueOf() - 1*60*1000) {
    return {
      error: "past",
      success: false,
    }
  }

  if (sessionData.user1_ID == sessionData.user2_ID) {
    return {
      error: "same person",
      success: false
    };
  }

  const forbiddenStart = new Date(sessionDatetime-SESSION_LENGTH);
  const forbiddenEnd = new Date(sessionDatetime+SESSION_LENGTH);


  try {
    const result = await Promise.all([
      checkExistenceInRange(sessionData.user1_ID, forbiddenStart, forbiddenEnd),
      checkExistenceInRange(sessionData.user2_ID, forbiddenStart, forbiddenEnd),
    ]);
    console.log("validation overlap result: ", result);
    if (result[0] || result[1]) {
      return {
        error: "overlap",
        success: false,
      }
    }
    return {
      success: true
    }
  } catch (error) {
    printError("@checksessionValidity", error);
    return {
      error: "error",
      success: false
    }
  }
}

const UpcomingSessionsController = {

  /**
   * Used to create a session. Creates entries to Mongo and Redis
   * @param {
   *  datetime -- JS Date object
   *  user1_ID 
   *  user2_ID  
   * } sessionData 
   */
  async createOneCalendarSession(sessionData) {
    console.log("@createOneCalendarSession", sessionData);
    // validate sessionData
    const validationResult = await checkSessionValidity(sessionData);
    console.log("@createOneCalendarSession validationresult: ", validationResult);
    if (validationResult.success) {
      console.log("@createOneCalendarSession validation successful");
      try {
        const result = await UpcomingSessions.insertOne({
          user1_ID: sessionData.user1_ID,
          user2_ID: sessionData.user2_ID,
          datetime: sessionData.datetime
        });
        // if insertion into Mongo successful, create entry to Redis
        if (result.insertedCount == 1) {
          sessionData._id = result.insertedId;
          const redisInsertionResult = await Promise.all([
            MatchDataController.setOneBooking(sessionData.user1_ID, dateToRedis(sessionData.datetime), 1),
            MatchDataController.setOneBooking(sessionData.user2_ID, dateToRedis(sessionData.datetime), 1),
            UserDataController.getUser(sessionData.user1_ID),
            UserDataController.getUser(sessionData.user2_ID)
          ]);
          console.log("createOneCalendarSession redis results", redisInsertionResult);
        } 
      } catch (error) {
        printError("@createOneCalendarSession: ", error);
      }
    }
    console.log("@createOneCalendarSession returning data: ", sessionData);
    return sessionData;
  },

  /**
   * Removes matchedUserID from Mongo and returns the created session if it got created
   * @param {
    *  datetime -- JS Date object
    *  user1_ID -- ID of the user who did not have a session at the time (the user who requested the match) 
    *  user2_ID -- ID of the user who *did* have a session at the datetime 
    * } sessionData 
    */
  async replaceOneCalendarSession(sessionData) {
    console.log("@replaceOnceCalendarSession: data: ", sessionData);
    let matchingSuccessful = false;
    try {
      const removedSession = await UpcomingSessionsController.removeOneSession_datetime_userID(
        sessionData.datetime, sessionData.user2_ID);
      console.log("@replaceOnceCalendarSession removed session: ", removedSession);
      if (removedSession) {
        let cancelledUserID;
        if (removedSession.user1_ID == sessionData.user2_ID) {
          cancelledUserID = removedSession.user2_ID;
        } else if (removedSession.user2_ID == sessionData.user2_ID) {
          cancelledUserID = removedSession.user1_ID;
        } else {
          // app broke
          console.log("BROKE");
          matchingSuccessful = false;
        }
        if (cancelledUserID) {
          console.log("@replaceOnceCalendarSession cancelled user id: ", cancelledUserID);
          // can be asynchronous
          MatchDataController.setOneBooking(cancelledUserID, dateToRedis(sessionData.datetime), 0, true);
          matchingSuccessful = true;
        }
      } else {
        // should never happen
        matchingSuccessful = false;
      }
    } catch (error) {
      printError("@replaceOnceCalendarSession: ", error);
      matchingSuccessful = false;
    }
    if (matchingSuccessful) {
      // create and return a new session
      console.log("@replaceOnceCalendarSession successful, going on to creation", sessionData);
      return UpcomingSessionsController.createOneCalendarSession(sessionData);
    } else {
      // just add to Redis as unmatched
      console.log("@replaceOnceCalendarSession unsuccessful");
      MatchDataController.setOneBooking(sessionData.user1_ID, dateToRedis(sessionData.datetime), 0, true);
      return sessionData;
    }
  },

  async removeOneSession_datetime_userID(datetime, userID) {
    try {
      // const res = await UpcomingSessions.find({
      //   datetime: datetime, 
      //   $or: [{user1_ID: userID}, {user2_ID: userID}]
      // }).toArray();
      // console.log("@removeOneSession: res: ", res);
      const { value } = await UpcomingSessions.findOneAndDelete({
        datetime: datetime, 
        $or: [{user1_ID: userID}, {user2_ID: userID}]
      });
      console.log("@removeOneSession: userID datetime ", userID, typeof userID, datetime);
      console.log("@removeOneSession: result: ", value);
      if (value) {
        return value;
      }
      console.log("nothing got deleted")
    } catch (error) {
      printError("at removeSession_datetime_userID", error);
    }
    return null;
  },

  async getSessionsRange(userID, startDatetime, endDatetime) {
    try {

      const projectionData = {
        "_id": 1,
        "datetime": 1,
        "user1_ID": 1,
        "user2_ID": 1,
      }
      const cursor = await UpcomingSessions.find({
        datetime: {$gte: startDatetime, $lt: endDatetime},
        $or: [{user1_ID: userID}, {user2_ID: userID}]
      }, {
        limit: RANGE_QUERY_MAX_SESSIONS,
        projection: projectionData
      });

      return cursor.toArray();
    } catch (error) {
      printError("at getSessionsRange: ", error);
    }
  }
}


module.exports = async function(collection) {
  UpcomingSessions = collection;
  return UpcomingSessionsController;
}

