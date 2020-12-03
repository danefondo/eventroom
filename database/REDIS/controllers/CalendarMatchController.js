const { promisify } = require('util');

const IDENTIFIER = "cal:";
const IDENTIFIER_LENGTH = IDENTIFIER.length;

const DATE_ACCURACY = 180;    // in minutes. 

/**
 * Accepts Javascript date object as string and returns date up to accuracy of DATE_ACCURACY minute. 
 * Maybe in future set it to accuracy of 1 minute or more idk idc
 * @param {Date} date -- Javascript Date object
 * @return {String} -- parsed date, with identifier added in front
 */
const parseDate = date => IDENTIFIER + String(Math.floor(date.valueOf()/(60000*DATE_ACCURACY)));


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
  
  /**
   * @param {Date} datetime -- must be a JS Date object. Slot time when then booking must happen
   * @param {String} userID -- user who booked for this Date
   * @param {String/Number} userValue -- optionally, if user has some precalculated value (future stuff probs)
   */
  module.setBooking = function(datetime, userID, userValue="1") {
    const key = parseDate(datetime);
    return redisClient.hset(key, userID, userValue, (error, result) => {
      if (error) {
        throw new Error("@redis setBooking", error);
      } 
      if (result == 1) {
        // console.log("set key ", key, " with field ", userID, " to value ", userValue, ". got result: ", result);
        return true;
      } else {
        console.log("@redis setbooking not 1", result);
        return true;
      }
    });
  }

  /**
   * 
   * @param {Date} datetime -- JS Date object which must be during 
   *                            (including beginning, excluding ending) the session slot time
   * @param {*} userID 
   */
  module.getAllBookingsForUser = function(datetime, userID) {
    const key = parseDate(datetime);
    return redisClient.hget(key, userID, (error, reply) => {
      if (error) {
        throw new Error("@redis getAllBookingsForUser", error);
      }
      return reply;
    });
  }
  /**
   * Gets all bookings for one day
   * @param {Date} datetime -- JS Date object which must be at any time during the day for which the bookings are asked
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
  module.getAllBookingsForDay = async function(datetime) {
    /* According to https://stackoverflow.com/questions/4970727/node-js-hiredis-and-the-multi-command
       no need for multi
    */
    
    const dayMS = 24*60*60*1000;
    // 00:00 the day of datetime in MS
    const dayStart = Math.floor(datetime.valueOf()/dayMS)*dayMS;
    const nrIterations = 24*60/DATE_ACCURACY; // how many slots in a day
    const getKey = timeInMS => IDENTIFIER+String(timeInMS/(60000*DATE_ACCURACY));

    // console.log("nr iterations: ", nrIterations);
    const hgetallAsync = promisify(redisClient.hgetall).bind(redisClient);
    try {
      let requestArray = [];
      
      for (let i=0; i<nrIterations; i++) {
        let key = getKey(dayStart + 60000*DATE_ACCURACY*i);
        requestArray.push(hgetallAsync(key));
      }
      // console.log("requestarray before: ", requestArray);
      const resultArray = await Promise.all(requestArray);
      // console.log("resultArray after: ", resultArray);
      const returnObject = {};

      for (let i=0; i<nrIterations; i++) {
        // console.log("resultarray: ", i, ":", typeof(resultArray[i]), resultArray[i] == null)
        if (resultArray[i] && resultArray[i].length != 0) {
          returnObject[String(dayStart+60000*DATE_ACCURACY*i)] = resultArray[i];          
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

  module.getBookingsRange = async function(datetime1, datetime2) {
    /* datetime1 included, datetime2 excluded */
    const firstTime = Math.floor(datetime1.valueOf()/(60000*DATE_ACCURACY))*60000*DATE_ACCURACY;
    const lastTime = Math.floor(datetime2.valueOf()/(60000*DATE_ACCURACY))*60000*DATE_ACCURACY;
    const getKey = timeInMS => IDENTIFIER+String(timeInMS/(60000*DATE_ACCURACY));
    const nrIterations = (lastTime-firstTime)/(DATE_ACCURACY*60000); // how many slots in a day

    console.log("nrIterations: ", nrIterations);
    const hgetallAsync = promisify(redisClient.hgetall).bind(redisClient);
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