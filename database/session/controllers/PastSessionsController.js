
let PastSessions = null;

const printError = function(message, error) {
  console.log("Error at UpcomingSessionsController: ", message, error);
}

const SESSION_INTERVAL = 15; // minutes
const RANGE_QUERY_MAX_SESSIONS = 7*24*60/SESSION_INTERVAL;

const addSession = async function(session) {
  try {
    const result = await PastSessions.insertOne(session);
    if (result.insertedCount == 1) {
      session._id = result.insertedId;
      return inserted;
    }
    console.log("didnt insert?")
  } catch (error) {
    printError("at addSession: ", error);
    session.success = false;
  }
  return session;
}

const getSessionsRange = async function(userID, startDatetime, endDatetime) {
  try {

    const projectionData = {
      "_id": 1,
      "datetime": 1,
      "user1_ID": 1,
      "user2_ID": 1,
    }
    const cursor = await PastSessions.find({
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




module.exports = async function(collection) {
  PastSessions = collection;
  
  return {
    addSession,
    getSessionsRange,
  }
}
