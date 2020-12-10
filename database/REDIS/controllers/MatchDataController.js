const { promisify } = require('util');

const IDENTIFIER = "cal:";
const IDENTIFIER_LENGTH = IDENTIFIER.length;

const DATE_ACCURACY = 120;    // in minutes. 

// TODO: change parseDate to handle millisecond string

/**
 * Accepts Javascript date object as string and returns date up to accuracy of DATE_ACCURACY minute. 
 * Maybe in future set it to accuracy of 1 minute or more idk idc
 * @param {Date} dateString -- seconds from Unix epoch
 * @return {String} -- parsed date, with identifier added in front
 */
const parseDate = dateString => IDENTIFIER + String(Math.floor(Number(dateString)/(60000*DATE_ACCURACY)));


/**
 * reverse of parseDate
 * @param {String} dbDate
 * @return {Date} -- Javascript Date object 
 */
const unparseDate = dbDate =>  new Date(Number(dbDate.slice(IDENTIFIER_LENGTH))*60000*DATE_ACCURACY);

/**
 * This module contains all the logic related to the matching data within the calendar.
 * TODO: some crawler, that periodically removes old keys (i.e. every night or smth)
 * @param {Redis client} redisClient 
 */
module.exports = function(redisClient) {
  let module = {};
  const hgetAsync = promisify(redisClient.hget).bind(redisClient);
  const hdelAsync = promisify(redisClient.hdel).bind(redisClient); 
  const hgetallAsync = promisify(redisClient.hgetall).bind(redisClient);
  const hsetAsync = promisify(redisClient.hset).bind(redisClient);


  module.setOneBooking = function(userID, datetime, matchedStatus) {
    return hsetAsync(parseDate(datetime, userID, matchedStatus));
  }
  /**
   * @param {String} userID -- user who booked for this Date
   * @param {[Date]} datetimeArray -- an array of JS Date objects. Slot time when then booking must happen
   * @param {Number} matchedStatus -- 1 if matched, 0 if unmatched
   * @return {Promise.allSettled} promise which waits for all insertions to complete (whether successfully or not)
   */
  module.setManyBookings = function(userID, datetimeArray, matchedStatus) {
    const requestArray = [];
    for (let i=0; i<datetimeArray.length; i++) {
      requestArray.push(hsetAsync(parseDate(datetimeArray[i]), userID, matchedStatus))
    }
    return Promise.allSettled(requestArray);
  }

  /**
   * @param {String} userID -- user who deleted these sessions
   * @param {[Date]} datetimeArray -- an array of JS Date objects. Slot time when then bookings got cancelled
   */
  module.delManySlots = function(userID, datetimeArray) {
    const requestArray = [];
    for (let i=0; i<datetimeArray.length; i++) {
      requestArray.push(hdelAsync(parseDate(datetimeArray[i]), userID));
    }
    return Promise.all(requestArray);
  }

  module.delAtSlot = async function(userID, datetime) {
    const key = parseDate(datetime);
    const result = await hgetAsync(key, userID);
    // console.log("key: ", key, "datetime:", datetime, "user_ID", userID, "result: ", result);
    if (result !== null) {
      const deletionResult = await hdelAsync(key, userID);
      // console.log("and deletion result", deletionResult);
      if (deletionResult) {
        return {
          success: true,
          ID: userID,
          result: result
        }
      }
    }
    return { success: false }
  }

  /**
   * Gets all bookings for the range 
   * @param {Date} datetime1 -- Range start (inclusive)
   * @param {Date} datetime2 -- Range end (exclusive)
   * i.e. when DATE_ACCURACY is 15min, datetime1 = 00:00, datetime2 = 00:20, only one slot is queried 
   * (corresponding to 00:00. The slot corresponding to 00:15 is excluded)
   * @return {
    *  SLOT_1_TIME_IN_MS: {
      *    user1_ID: user1_Value, 
      *    user2_ID: user2_Value
      *    ... 
      *  },
      *  SLOT_2_TIME_IN_MS: {
      *    user3_ID: user3_Value,
      *    ...
      *  }
      * } All bookings for respective day. 
      * Keys: Slot times in MS -- only slots for which Redis contains some elements
      * Values: Objects, with userIDs as keys and userValues as values. Values can be set at @setBooking 
      * currently values contain no information 
      */
  module.getBookingsRange = async function(datetime1, datetime2) {
    /* datetime1 included, datetime2 excluded */
    const firstTime = Math.floor(datetime1.valueOf()/(60000*DATE_ACCURACY))*60000*DATE_ACCURACY;
    const lastTime = Math.floor(datetime2.valueOf()/(60000*DATE_ACCURACY))*60000*DATE_ACCURACY;
    const getKey = timeInMS => IDENTIFIER+String(timeInMS/(60000*DATE_ACCURACY));
    const nrIterations = (lastTime-firstTime)/(DATE_ACCURACY*60000); // how many slots in a day

    console.log("nrIterations: ", nrIterations);
    
    try {
      let requestArray = [];
      
      for (let i=0; i<nrIterations; i++) {
        let key = getKey(firstTime + 60000*DATE_ACCURACY*i);
        requestArray.push(hgetallAsync(key));
      }
      // console.log("requestarray before: ", requestArray);
      const resultArray = await Promise.all(requestArray);
      // console.log("resultArray after: ", resultArray);
      const returnObject = {};

      for (let i=0; i<nrIterations; i++) {
        // console.log("resultarray: ", i, ":", typeof(resultArray[i]), resultArray[i] == null)
        if (resultArray[i] && resultArray[i].length != 0) {
          returnObject[String(firstTime+60000*DATE_ACCURACY*i)] = resultArray[i];          
        }
      }
      // console.log("RETURN OBJECT: ", returnObject);
      Object.keys(returnObject).forEach(key => {
        console.log("key: ", key, " date: ", new Date(Number(key)), " value: ", returnObject[key])
      })
      return returnObject;

    } catch (error) {
      console.log("error at getAllBookingsForDay", error);
      return null;
    }
  }
  return module;
}