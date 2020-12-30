const { setAsync, runMultiCommand, runBatchCommand } = require("../config/redisClient");
const {parseToUserKey } = require("../config/KeyValueParsers");
const { getUserData } = require("../../user/controllers/UserDataController");

const debug_ = true;
function debug() {
  const {format} = require("util");
  if (debug_) {
    process.stdout.write('@UserCacheController: '+format.apply(this, arguments) + '\n');
  }
}

const EXPIRY = 60*60; /* 60 minutes */


/**
 * Gets user data from Mongo and adds user to cache
 * @param {String} userID 
 * @return {USER_SCHEMA} user data
 */
async function retrieveFromMongo(userID) {
  const userData = await getUserData(userID);

  debug("@retrievefrommongo: ", insertObject);
  try {
    // async 
    setAsync(parseToUserKey(userID), JSON.stringify(userData), "EX", EXPIRY);
  } catch (error) {
    console.log("@retrievefrommongo error inserting to redis: ", error);
  }
  return userData;
}

/**
 * Gets user data. Checks if in cache, otherwise retrieves from mongo and caches it
 * @param {String} userID 
 */
async function getCachedUserData(userID) {
  const key = parseToUserKey(userID);
  try {
    const result = await runMultiCommand([
      ["get", key],
      ["expire", key, EXPIRY]
    ]);
    const user = JSON.parse(result[0]);
    debug("@getuserdata result: ", result);
    debug("@getuserdata user: ", user);
    if (!user) {
      return retrieveFromMongo(userID);
    } 
    return user;
  } catch (error) {
    console.log("@adduserdata error: ", error);
  }
}

/**
 * Sets to cache the given values, if it does not exist in cache already,
 * otherwise just updates expiry
 * @param {String} userID 
 * @param {USER_SCHEMA} user 
 */
async function setUserDataCacheNX(userID, user) {
  const key = parseToUserKey(userID);
  try {
    // async
    runMultiCommand([
      ["setnx", key, JSON.stringify(user)],
      ["expire", key, EXPIRY]
    ]);
  } catch(error) {
    console.log("@setUserDataCache error: ", error);
  }
}

async function setBatchToCache(insertObject) {
  let batchCommandArray = [];
  Object.entries(insertObject).forEach(([ID, userDataObject]) => {
    if (userDataObject && userDataObject.userData) {
      const key = parseToUserKey(ID);
      batchCommandArray.push(["set", key, JSON.stringify(userDataObject.userData)]);
      batchCommandArray.push(["expide", key, EXPIRY]);
    }
  });
  try {
    runBatchCommand(batchCommandArray);
  } catch (error) {
    console.log("@setbatchtocache error:", error);
  }
}

// TODO actually batch it 
async function retreiveBatchFromMongo(userIDs) {
  if (!userIDs) return {};
  let results = {};
  let promiseArray = [];
  debug("@retrievebatchfrommongo: userIDs", userIDs);
  for (let i=0; i<userIDs.length; i++) {
    let promise = getUserData(userIDs[i])
      .then(result => {
        results[userIDs[i]] = {
          userData: result
        };
      })
      .catch(error => {
        console.log("@retrievebatchfrommongo error with one: ", userIDs[i], error);
      })
    promiseArray.push(promise);
  }

  try {
    await Promise.all(promiseArray);
    // async
    setBatchToCache(results);
  } catch(error) {
    console.log("@retrievebatchfrommongo error: ", error);
  }
  debug("@retrievebatchfrommongo results: ", results);
  return results;
}

/**
 * @param {Array} userIDs 
 * @param {Array} redisBatchResults -- Array of strings, even idx elements are parsed to userData, odd elements are trash 
 * @return {
 *  usersData -- {Object} key: ID, value: userData
 *  toRetrieveIDArray -- {Array} array of userIDs to ask data about from mongo
 * }
 */
async function processRedisBatchResults(userIDs, redisBatchResults) {
  debug("@processRedisBatchResults: ", userIDs, redisBatchResults);
  let usersData = {}
  let toRetrieveIDArray = [];
  if (userIDs && redisBatchResults) {
    debug("here1")
    for (let i=0; i<userIDs.length; i++) {
      debug("here2")
      if (redisBatchResults[2*i]) {
        usersData[userIDs[i]] = {
          userData: JSON.parse(redisBatchResults[2*i])
        };
      } else {
        toRetrieveIDArray.push(userIDs[i]);
      }
    }
  }
  debug("@processreidsbatchresults, results: ", usersData, toRetrieveIDArray);
  return {usersData, toRetrieveIDArray} 
}

async function getBatchedUserDataFromRedis(userIDs) {
  let batchCommandArray = [];
  for (let i=0; i<userIDs.length; i++) {
    const key = parseToUserKey(userIDs[i]);
    batchCommandArray.push(["get", key]);
    batchCommandArray.push(["expire", key, EXPIRY]);
  }
  try {
    return runBatchCommand(batchCommandArray);
  } catch (error) {
    console.log("@getbatchedUserData", error);
    return null;
  }
}

/**
 * Retrieves many users' data from Redis and Mongo
 * @param {Array} userIDs
 * @return {Object} key: userID, value: {userData: <user's data object>} 
 */
async function getManyUserData(userIDs) {
  try {
    const redisBatchResults = await getBatchedUserDataFromRedis(userIDs);
    debug("@getmanyuserdata redisbatchresults: ", redisBatchResults);
    const {usersData, toRetrieveIDArray} = await processRedisBatchResults(userIDs, redisBatchResults);
    // const usersData = processingResults.usersData;
    // const toRetrieveIDArray = processingResults.toRetrieveIDArray;
    debug("@getmanyuserdata usersData, retrievearray: ", usersData, toRetrieveIDArray);
    const mongoResults = await retreiveBatchFromMongo(toRetrieveIDArray);
    debug("@getmanyuserdata usersdata:", usersData);
    debug("@getmanyuserdata mongoResults:", mongoResults);
    return Object.assign(usersData, mongoResults);
  } catch (error) { 
    console.log("@getmanyuserdata: error: ", error);
  }
}

const UserCacheController = {
  
  getCachedUserData,

  getManyUserData,

  setUserDataCacheNX,

}

module.exports = UserCacheController;

