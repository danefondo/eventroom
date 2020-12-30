const MatchPoolController = require("../../database/REDIS/controllers/MatchPoolController");
const { SessionsController } = require("../../database/mongo");

const DATE_ACCURACY = 15;    // in minutes. 
const DATE_ACCURACY_MS = DATE_ACCURACY * 60000;
const CREATE_SESSION_MS = 10*60000; /* threshold for when to create a new session */ 

const debug_ = true;
function debug() {
  const {format} = require("util");
  if (debug_) {
    process.stdout.write(format.apply(this, arguments) + '\n');
  }
}
/* ===================================================================================== */
/* Validators */

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

/* ===================================================================================== */
/* Mongo */

/**
 * Returns whether it is a full match and should be inserted into mongo 
 * @param {Array} match -- [User1_ID, User2_ID]
 * @return false if User2_ID is falsy
 */
function isFullMatch(match) {
  if (match[1]) return true;
  return false;
}

/**
 * Mirrors in Mongo the changes done in Redis.
 * @param {Object} matchingResults -- contains createdMatches and cancelledMatches arrays 
 */
async function addResultToMongo(matchingResults) {
  /* cancel all matches that got cancelled */
  let cancelledPromiseArray = [];
  for (let i=0; i<matchingResults.cancelledMatches.length; i++) {
    const currentMatch = matchingResult.cancelledMatches[i];
    if (isFullMatch(currentMatch)) {
      cancelledPromiseArray.push(SessionsController.deleteOneMatch(dateTime, currentMatch[0], currentMatch[1]));
    }
  }
  /* create all matches that got created */
  let createdPromiseArray = [];
  for (let i=0; i<matchingResults.createdMatches.length; i++) {
    const currentMatch = matchingResult.createdMatches[i];
    if (isFullMatch(currentMatch)) {
      createdPromiseArray.push(SessionsController.createOneMatch(dateTime, currentMatch[0], currentMatch[1]));
    }
  }
  
  return Promise.all(Promise.all(cancelledPromiseArray), Promise.all(createdPromiseArray));
}

/* ===================================================================================== */
/* Rematch */

async function handleRematch(userToRematch, dateTime) {
  debug("@handlerematch: ", userToRematch);
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
      debug("@handlerematch scan result: ", result, iterations);
      cursor = result.cursor; 
      const userIDArray = result.userIDArray;
      debug("@handlerematch: ", userIDArray);
      let breakValue = false;
      let foundUserID;
      for (let i=0; i<userIDArray.length; i++) {
        // TODO add preference comparison etc
        foundUserID = userIDArray[i];
        debug("@handlerematch found: ", foundUserID);
        breakValue = true;
        break;
      }
      if (foundUserID) {
        const rematchResult = await MatchPoolController.replaceOneMatch(dateTime, userToRematch.ID, foundUserID, true, true);
        debug("@handlerematch rematchresult: ", rematchResult);
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
      debug("cursor == 0: ", cursor === 0, cursor == 0, cursor !== "0", cursor != "0");
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

/**
 * Preprocesses objects for rematches and then formats the results
 * @param {Array} toRematchArray -- array of USER_TO_REMATCH schema following objects  
 * @param {Number/String} dateTime -- in ms 
 */
async function preprocessManyRematches(toRematchArray, dateTime) {
  let rematchResultPromises = [];
  for (let i=0; i<toRematchArray.length; i++) {
    rematchResultPromises.push(handleRematch(toRematchArray[i], dateTime));
  }
  let rematchResults = await Promise.all(rematchResultPromises);
  debug("@preprocess rematchresults:", rematchResults);
  let createdMatches = [];
  let removedFromPool = [];
  for (let i=0; i<rematchResults.length; i++) {
    createdMatches.push(...rematchResults[i].createdMatches);
    removedFromPool.push(...rematchResults[i].removedFromPool);
  }
  return {
    createdMatches,
    removedFromPool
  }
}

/* ===================================================================================== */
/* Redis */

/**
 * Sets one user as unmatched. If for some reason there are users to rematch, rematches them
 * @param {String} userID 
 * @param {Number/String} dateTime 
 */
async function setAsUnmatched(userID, dateTime) {
  const result = await MatchPoolController.setToUnmatched(dateTime, userID);
  let createdMatches = [];
  let removedFromPool = [];
  if (result.rematchArray.length > 0) {
    const rematchResult = await preprocessManyRematches(result.rematchArray, dateTime);
    createdMatches = rematchResult.createdMatches;
    removedFromPool = rematchResult.removedFromPool;
    debug("@setasunmatched rematchresult: ", rematchResult);
  }
  createdMatches.unshift([userID, ""]);
  return {
    success: result.success,
    createdMatches,
    cancelledMatches: result.cancelledMatches,
    removedFromPool,
  }
}
/**
 * Requests to replace a match from Redis and then sends to rematch flow the users who need to be rematched
 * @param {String} user1_ID 
 * @param {String} user2_ID 
 * @param {Number/String} dateTime  
 */
async function setAsMatched(user1_ID, user2_ID, dateTime) {
  // allowRematch atm set to true to both at creation
  debug("@setasmatched: ", user1_ID, user2_ID, dateTime);
  const result = await MatchPoolController.replaceOneMatch(
    dateTime, user1_ID, user2_ID, true, true
  ); 
  let {createdMatches, removedFromPool} = await preprocessManyRematches(result.rematchArray, dateTime);
  createdMatches.unshift(result.createdMatches);
  debug("@setasmatched creationresult:", result);
  debug("@setasmatched createdmatches:", createdMatches);
  debug("@setasmatched removedFromPool", removedFromPool);
  return {
    success: result.success,
    createdMatches,
    cancelledMatches: result.cancelledMatches,
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
  // debug("@createonematch: ", user1, user2, dateTime);
  const user1_ID = user1 && user1.metadata && user1.metadata.ID ? user1.metadata.ID : null;
  const user2_ID = user2 && user2.metadata && user2.metadata.ID ? user2.metadata.ID : null;

  if (!user2 && user1_ID) {
    /* the other user not requested so set as unmatched, no session necessary */
    debug("@createonematch, setting unmatched");
    // const returnValue = await setAsUnmatched(user1.metadata.ID, dateTime);
    // debug("@createonematch unmatched: ", returnValue)
    return setAsUnmatched(user1_ID, dateTime);
  } 
  const userValidationResult = validateUsers(user1, user2);
  const dateValidationResult = validateDate(dateTime);
  debug("@craeteonematch uservalidationresult: ", userValidationResult);
  debug("@createonematch datevalidationresult: ", dateValidationResult);
  if (userValidationResult.success && dateValidationResult.success) {
    debug("@createonematch validation successful");
    const matchingResult = await setAsMatched(user1.metadata.ID, user2.metadata.ID, dateTime);
    debug("@createonematch matchingresult: ", matchingResult);
    if (dateValidationResult.createSession) {
      await addResultToMongo(matchingResult);
    }
    return matchingResult;
  }
  debug("@createonematch validation unsuccessful");
  /* validation unsuccessful */ 
  return {success: false, reason: "validation unsuccessful"}
}


async function cancelOneMatch(dateTime, userID) {
  const dateValidationResult = validateDate(dateTime);
  if (dateValidationResult.success) {
    const cancelResult = await MatchPoolController.cancelOneMatch(dateTime, userID);
    let returnValue =  {
      success: true,
      createdMatches: [],
      cancelledMatches: [],
      removedFromPool: [],
    }
    if (cancelResult.userToRematch && cancelResult.userToRematch.ID !== userID) {
      returnValue.cancelledMatches.push([userID, cancelResult.userToRematch.ID]);
      const rematchResult = await preprocessManyRematches([cancelResult.userToRematch], dateTime);
      returnValue.createdMatches = rematchResult.createdMatches;
      returnValue.removedFromPool = rematchResult.removedFromPool;
    } 
    returnValue.removedFromPool.unshift(userID);
    if (dateValidationResult.createSession) {
      await addResultToMongo(returnValue);
    }

    return returnValue;
  }
  debug("@cancelonematch validation unsuccessful");
  return {success: false, reason: "validation unsuccessful"}
}

module.exports = {
  createOneMatch,
  cancelOneMatch,
}