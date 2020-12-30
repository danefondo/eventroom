let Sessions = null;

const SESSION_INTERVAL = 15; // minutes
const RANGE_QUERY_MAX_SESSIONS = 7*24*60/SESSION_INTERVAL;


const debug_ = true;
function debug() {
  const {format} = require("util");
  if (debug_) {
    process.stdout.write("@SessionsController:" + format.apply(this, arguments) + '\n');
  }
}


/**
 * Creates one match in atomic fashion, if the match does not already exist. If exists, ignores. 
 * @param {Date} dateTime -- JS Date object
 * @param {String} user1_ID 
 * @param {String} user2_ID 
 */
async function createOneMatch(dateTime, user1_ID, user2_ID) {
  try {
    const result = await Sessions.findOneAndModify(
      {
        dateTime,
        $or: [
          {$and: [{user1_ID: user1_ID}, {user2_ID: user2_ID}]}, 
          {$and: [{user1_ID: user2_ID}, {user2_ID: user1_ID}]}
        ],
      },
      {$setOnInsert: { dateTime, user1_ID, user2_ID }},
      {upsert: true, returnOriginal: false}
    );
    debug("@createOneMatch result: ", result);
    const document = result.value;
    debug("@createOneMatch document: ", document);
    return document;
  } catch (error) {
    console.log("@SessionsController createonematch error: ", error);
  }
}

/**
 * Deletes one match in atomic fashion.
 * @param {Date} dateTime -- JS Date object 
 * @param {*} user1_ID 
 * @param {*} user2_ID 
 */
async function deleteOneMatch(dateTime, user1_ID, user2_ID) {
  try {
    const result = await Sessions.findOneAndDelete(
      {
        dateTime,
        $or: [
          {$and: [{user1_ID: user1_ID}, {user2_ID: user2_ID}]}, 
          {$and: [{user1_ID: user2_ID}, {user2_ID: user1_ID}]}
        ],
      },
    );
    debug("@deleteOneMatch result: ", result);
    const document = result.value;
    debug("@deleteOneMatch document: ", document);
    return document;
  } catch (error) {
    console.log("@SessionsController deleteOneMatch error: ", error);
  }
}

async function getSessionsRange(userID, startDatetime, endDatetime) {
  try {

    const projectionData = {
      _id: 1,
      dateTime: 1,
      user1_ID: 1,
      user2_ID: 1,
    }
    const cursor = await Sessions.find(
      {
        dateTime: {$gte: startDateTime, $lt: endDateTime},
        $or: [{user1_ID: userID}, {user2_ID: userID}]
      }, 
      {
        limit: RANGE_QUERY_MAX_SESSIONS,
        projection: projectionData
      }
    );

    return cursor.toArray();
  } catch (error) {
    printError("at getSessionsRange: ", error);
  }
}



const SessionsController = {
  createOneMatch,
  deleteOneMatch,
  getSessionsRange,
}


module.exports = async function(collection) {
  Sessions = collection;
  return SessionsController;
}