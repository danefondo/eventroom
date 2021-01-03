const BookingDataController = require("../../../database/booking/controllers/BookingDataController");
const MatchPoolController = require("../../../database/REDIS/controllers/MatchPoolController");
const UserDataController = require("../../../database/user/controllers/UserDataController");

const { processPostRequest } = require("../../../utilities/CRUDAutomation");

const controller = "BookingDataController";

const debug_ = true;
function debug() {
  const {format} = require("util");
  if (debug_) {
    process.stdout.write('@BookingController:'+format.apply(this, arguments) + '\n');
  }
}

const SLOT_INTERVAL = 15*60*1000; // 15 min
const MAX_RANGE = 7*24*60*60*1000; // 7 days
const MAX_PAST = 70*60*1000; // should be at least 65 min

function validateUpcomingRangeRequest(start, end) {
  start = Number(start);
  debug("@validate original start: ", new Date(start));
  start -= start%SLOT_INTERVAL; // lower end
  end = Number(end);
  debug("@validate original end: ", new Date(end));
  end += SLOT_INTERVAL-(end%SLOT_INTERVAL); // upper end
  debug("@validate start: ", new Date(start));
  debug("@validate end: ", new Date(end));
  if (!start || !end) return {success: false};
  if (end < start) return {success:false};
  debug("end >= start")
  if (start < Date.now()-MAX_PAST) return {success: false};
  debug("start in future");
  if (end-start > MAX_RANGE) return {success:false};
  debug("range allowed");
  return {
    success: true,
    start,
    end 
  };
} 

/**
 * Gets matchable people in given range
 * @param {Number} start - ms 
 * @param {Number} end  - ms
 * @param {String} userID -- userID who requested the data
 * @return {
 *  allMatchablePeople -- {Object} key: userID, value {userData, dateTimes}
 *  matched -- {Object} key: dateTime, value: matched partner
 *  unmatched -- {Array} dateTimes 
 * }
 */
async function compileMatchData(start, end, userID) { 
  try {
    /* get data from Redis -- all matched and unmatched people for all datetimes within range */
    const [matchedResult, unmatchedResult] = await Promise.all([
      MatchPoolController.getMatchedPeopleInRange(start, end, userID),
      MatchPoolController.getUnmatchedPeople(start, end, userID)
    ]);
    debug("@compilematchdata matchedresult: ", matchedResult);
    debug("@compilematchdata unmatchedResult: ", unmatchedResult);
    /* allMatchablePeople contains as keys userID, and has two values:
     userData object and array dateTimes when the user is available for matching */
    let allMatchablePeople = matchedResult.allMatchablePeople;
    debug("@compilematchdata, allMatchablePeople before merge: ", allMatchablePeople);
    Object.keys(unmatchedResult.allMatchablePeople).forEach(user => { // TODO
      if (allMatchablePeople.hasOwnProperty(user)) {
        debug("@compilematchdata: ", user);
        allMatchablePeople[user].dateTimes = allMatchablePeople[user].dateTimes.concat(unmatchedResult.allMatchablePeople[user].dateTimes);
      } else {
        allMatchablePeople[user] = {dateTimes: unmatchedResult.allMatchablePeople[user].dateTimes};
      }
    });
    debug("@compileMatchdata allMatchable people after: ", allMatchablePeople);
    /* get user data from Redis or Mongo */
    const [usersData, matchedUsersData] = await Promise.all([
      UserDataController.getManyUserData(Object.keys(allMatchablePeople)),
      UserDataController.getManyUserData(Object.keys(matchedResult.userMatched))
    ]);
    debug("@compileMatchdata usersdata: ", usersData);
    debug("@compileMatchdata matchedUsersData: ", matchedUsersData);
    for (let i=0; i<usersData.length; i++) {
      allMatchablePeople[usersData[i].metadata.ID].userData = usersData[i];
    }
    for (let i=0; i<matchedUsersData.length; i++) {
      matchedResult.userMatched[matchedUsersData[i].metadata.ID].userData = matchedUsersData[i];
    }

    return {
      success: true,
      allMatchablePeople, 
      matched: matchedResult.userMatched,
      unmatched: unmatchedResult.userUnmatched
    };
  } catch (error) {
    console.log("@compilematchdata error: ", error);
  }
}

const BookingController = {
  
  /**
   * Returns upcoming bookable people in specified range. 
   * Range is specified by request params `start` and `end`, which must be ms from Unix epoch.
   * Range *cannot* be larger than MAX_RANGE.  
   * `start` is included, `end` is excluded
   * @return {
   *   allMatchablePeople,  -- {user1ID: {user1Data: {}, dateTimes: []}, user2ID: {}...}
   *   matched: {matchedUser1ID: {matchedUser1data: {}, dateTimes: []}, ...}
   *   unmatched: [dateTime1, dateTime2, ...]
   * };
   */
  async getUpcomingBookedSessionRange(req, res) {
    debug("@getupcoming: query: ", req.query);
    const {success, start, end} = validateUpcomingRangeRequest(req.query.start, req.query.end);
    if (!success) {
      return res.status(400).send({error: "bad range"});
    }
    debug("@getupcoming validation successful");
    return res.status(200).json(await compileMatchData(start, end, req.user._id));
    
  },

  async returnUserData(req, res) {
    if (!req.user) {
      return res.status(401).send({error: "unauthorized"});
    }
    try {
      const result = await UserDataController.getOneUserData(req.user._id);
      return res.status(200).json({
        success: true,
        userData: result
      });
    } catch (error) {
      console.log("@returnuserdata, error: ", error);
    }
  },


  async getUserBookedSessionsForThisWeek(req, res) {
    const options = {
      validate: ["userId"],
      funcToRun: "getUserBookedSessionsForThisWeek",
      dataToPass: req.body,
      selfComplete: true,
    };
    await processPostRequest(req, res, controller, options);
    return;
  },

  async getAllBookedUsersForSpecificWeek(req, res) {
    const options = {
      validate: ["userId", "startOfWeekDate", "endOfWeekDate"],
      funcToRun: "getAllBookedUsersForSpecificWeek",
      dataToPass: req.body,
      selfComplete: true,
    };
    await processPostRequest(req, res, controller, options);
    return;
  },

  async getBookedSessionsForOneDay(req, res) {
    const options = {
      validate: ["userId", "startOfDay", "endOfDay"],
      funcToRun: "getBookedSessionsForOneDay",
      dataToPass: req.body,
      selfComplete: true,
    };
    await processPostRequest(req, res, controller, options);
    return;
  },

  async bookSessionSlot(req, res) {
    const options = {
      validate: ["userId", "dateTime", "username"],
      funcToRun: "bookSessionSlot",
      dataToPass: req.body,
      selfComplete: true,
    };
    await processPostRequest(req, res, controller, options);
    return;
  },

  async bookManySessionSlots(req, res) {
    const options = {
      validate: ["userId", "username", "slotsToBookArray", "slotsToBookTimesArray"],
      funcToRun: "bookManySessionSlots",
      dataToPass: req.body,
      selfComplete: true,
    };
    await processPostRequest(req, res, controller, options);
    return;
  },

  async cancelCalendarSlot(req, res) {
    const options = {
      validate: ["eventroomName", "participant"],
      funcToRun: "addUserToRoomData",
      dataToPass: req.body,
      selfComplete: true,
    };
    await processPostRequest(req, res, controller, options);
    return;
  },

  async cancelSession(req, res) {
    const options = {
      validate: ["userId", "sessionId"],
      funcToRun: "cancelSession",
      dataToPass: req.body,
      selfComplete: true,
    };
    await processPostRequest(req, res, controller, options);
    return;
  },

  async getUserNextSession(req, res) {
    const options = {
      validate: ["endOfWeekPlusTwoHours", "userId"],
      funcToRun: "getUserNextSession",
      dataToPass: req.body,
      selfComplete: true,
    };
    await processPostRequest(req, res, controller, options);
    return;
  },
};
module.exports = BookingController;
