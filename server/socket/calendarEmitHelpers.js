const { getOneUserData } = require("../../database/user/controllers/UserDataController"); 
/**
 * Preprocesses the array and collects data about each user in the array
 * @param {Array} array -- array of userID pairs, second ID might be falsy 
 * @return {Array} the same array, but ID replaced with USER_SCHEMA either a<
 */
async function preprocessArray(array, originalID, matchedID, originalData, matchedData) {
  let promiseArray = [];
  for (let i=0; i<array.length; i++) {
    for (let j=0; j<2; j++) {
      if (!array[i][j]) continue;
      if (array[i][j] === originalID) {
        array[i][j] = originalData;
      } else if (array[i][j] === matchedID) {
        array[i][j] = matchedData;
      } else {
        let res = getOneUserData(array[i][j])
          .then((result) => array[i][j] = result)
          .catch((error) => {
            console.log("@preprocessArray: err ", i, j, array[i][j], array);
            console.log("@preprocessArray error: ", error);
          })
        promiseArray.push(res);
      }
    }
  }
  try {
    await Promise.all(promiseArray);
  } catch (error) {
    console.log("@preprocessarray final error: ", error);
    return [];
  }
  return array;
}

async function emitCreatedMatches(CALENDAR_NAMESPACE, dateTime, originalID, matchedID, originalUserData, matchedUserData, createdMatches) {
  createdMatches = await preprocessArray(createdMatches, originalID, matchedID, originalUserData, matchedUserData); 
  console.log("@emitcreatedmatches: ", createdMatches);
  for (let i=0; i<createdMatches.length; i++) {
    // TODO emit
    console.log("@emitcreatedmatches: ", i, ": ", createdMatches[i]);
    CALENDAR_NAMESPACE.emit("NEW_MATCH", {dateTime, createdMatch: createdMatches[i]});
  }
}

async function emitCancelledMatches(CALENDAR_NAMESPACE, dateTime, originalID, matchedID, originalUserData, matchedUserData, cancelledMatches) {
  cancelledMatches = await preprocessArray(cancelledMatches, originalID, matchedID, originalUserData, matchedUserData);
  console.log("@emticancelledMatches: ", cancelledMatches);
  for (let i=0; i<cancelledMatches.length; i++) {
    CALENDAR_NAMESPACE.emit("CANCELLED_MATCH", {dateTime, cancelledMatch: cancelledMatches[i]});
  }
}

async function emitRemovedFromPool(CALENDAR_NAMESPACE, dateTime, removedFromPool) {
  console.log("@emitremovedfromPool", removedFromPool);
  for (let i=0; i<removedFromPool.length; i++) {
    CALENDAR_NAMESPACE.emit("REMOVED_FROM_POOL", {dateTime, removedFromPool: removedFromPool[i]});
  }
}

/**
 * @param {Number/String} dateTime -- in ms
 * @param {USER_SCHEMA} originalUserData -- notification is already sent in @CalendarSocketController 
 * @param {USER_SCHEMA} matchedUserData 
 * @param {Object} changes result from @createOneMatch and contains 
 * createdMatches -- array of [ID1, ID2] pairs (ID2 may be empty string)
 * cancelledMatches -- array of [ID1, ID2] pairs (ID2 may be empty string)
 * removedFromPool -- list of user IDs to just notify (weren't in the pool anyway)
 */
async function emitMatchPoolChanges(CALENDAR_NAMESPACE, dateTime, originalUserData, matchedUserData, changes) {
  const originalID = originalUserData && originalUserData.metadata ? originalUserData.metadata.ID : null;
  const matchedID = matchedUserData && matchedUserData.metadata ? matchedUserData.metadata.ID : null;
  if (changes.cancelledMatches && changes.cancelledMatches.length) {
    emitCancelledMatches(CALENDAR_NAMESPACE, dateTime, originalID, matchedID, originalUserData, matchedUserData, changes.cancelledMatches);
  }
  if (changes.createdMatches && changes.createdMatches.length) {
    emitCreatedMatches(CALENDAR_NAMESPACE, dateTime, originalID, matchedID, originalUserData, matchedUserData, changes.createdMatches);
  }
  if (changes.removedFromPool && changes.removedFromPool.length) {
    emitRemovedFromPool(CALENDAR_NAMESPACE, dateTime, changes.removedFromPool)
  }
}

module.exports = {
  emitMatchPoolChanges,
}