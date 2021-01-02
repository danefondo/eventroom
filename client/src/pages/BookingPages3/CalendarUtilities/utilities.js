const SLOT_INTERVAL = 15*60*1000; /* each slot takes 15 min */
const ONE_DAY = 24*60*60*1000; /* one day in ms */

/* for easy reference only */
const USER_SCHEMA = { // eslint-disable-line no-unused-vars
  /* partner metadata */ 
  metadata: {
    ID: String,
    imageUrl: String, // i think?
    displayName: String
  },
  /* partner preferences */ 
  preferences: {

  },
  /* partner data to compare against preferences */
  preferenceData: {

  }
};

/**
 * Returns the location of selected in
 * @param {Boolean} week -- whether week view or date view
 * @param {Date} currentDayStartMS -- current day start date if day view
 * @param {Number} currentWeekStartMS -- current week start date if week view
 * @param {Number} datetimeMS -- datetime for which to get the indices in ms 
 * @return {
  *  success -- whether the date was within calendar view boundaries
  *  calendarIndex -- which row in calendarData 
  *  daysFromStart -- which column in calendarData.hourRowDays 
  * } slot location in calendarData. Final location is 
  * calendarData[index].hourRowDays[daysFromStart]
  */
export const getLocationFromDatetime = function (week, currentDayStartMS, currentWeekStartMS, datetimeMS) {
  const currentWeekMS = currentWeekStartMS;
  console.log("@getlocationfromdatetime: ", week, currentDayStartMS, currentWeekStartMS, datetimeMS)
  if (datetimeMS < currentWeekMS) {
    return { success: false }
  }
  if (week) {
    
    const daysFromStart = Math.floor((datetimeMS-currentWeekMS)/ONE_DAY);  
    console.log("@week days from start: ", daysFromStart);
    if (daysFromStart > 6) {
      return { success: false };
    }
    const calendarIndex = Math.floor((datetimeMS-daysFromStart*ONE_DAY-currentWeekMS)/SLOT_INTERVAL);
    console.log("@calendarindex: ", calendarIndex)
    return { 
      calendarIndex, 
      daysFromStart,
      success: true,
    }
  } else {
    const currentDayMS = currentDayStartMS;
    if (datetimeMS < currentDayMS || datetimeMS > currentDayMS+ONE_DAY) {
      return { success: false }
    }
    const calendarIndex = Math.floor((datetimeMS-currentDayMS)/SLOT_INTERVAL);
    return {
      calendarIndex,
      daysFromStart: 0,
      success: true
    }
  }
}

/**
 * Compares the two partners and returns which of the two partners would be a better match 
 * @param {USER_SCHEMA} currentUser 
 * @param {USER_SCHEMA} oldPartner  
 * @param {USER_SCHEMA} newPartner 
 * @return {Number} 
 *  0 -- if oldPartner is better
 *  1 -- if newPartner is better
 */
export const comparePreferences = function(currentUser, oldPartner, newPartner) { // eslint-disable-line no-unused-vars
  return 0  // atm constant until something better is figured out
}

function validatePartner(matchPoolArray, currentUserID, partnerID) {
  for (let i=0; i<matchPoolArray.length; i++) {
    if (matchPoolArray[i].metadata && matchPoolArray[i].metadata.ID === partnerID) return false;
    if (matchPoolArray[i].metadata && matchPoolArray[i].metadata.ID === currentUserID) return false;
  }
  return true;
}

/**
 * Gets the position in the array based on preference comparison
 * @param {USER_SCHEMA} currentUser 
 * @param {Array} matchPoolArray -- array of users sorted from best to worst 
 * @param {USER_SCHEMA} newPartner 
 * @param {Number} SLOT_USER_LIMIT -- the max nr of users kept in array
 */
export const getPositionInMatchPoolArray = function(currentUser, matchPoolArray, newPartner, SLOT_USER_LIMIT) {
  // traverse from worst to best
  if (newPartner && newPartner.metadata && validatePartner(matchPoolArray, currentUser.metadata.ID,  newPartner.metadata.ID)) {
    for (let i=matchPoolArray.length-1; i>=0; i--) {
      let comparisonResult = comparePreferences(currentUser, matchPoolArray[i], newPartner);
      /* 0 if old user was better match */
      if (comparisonResult === 0) {
        // i-th partner was not good enough so should be after i-th partner
        return i+1;
      }
    }
    // if did not return in loop, it's the best possible match
    // also if matchPoolArray.length === 0
    return 0;
  }
  return SLOT_USER_LIMIT;
}

/**
 * Returns new matchPoolUsersForSlot array where the newPartner is either added or not
 * @param {USER_SCHEMA} currentUser 
 * @param {Array} matchPoolArray 
 * @param {USER_SCHEMA} newPartner 
 */
export const addToMatchPoolArray = function(currentUser, matchPoolArray, newPartner, SLOT_USER_LIMIT) {
  const position = getPositionInMatchPoolArray(currentUser, matchPoolArray, newPartner, SLOT_USER_LIMIT);
  if (position < SLOT_USER_LIMIT) {
    matchPoolArray.splice(position, 0, newPartner);
    if (matchPoolArray.length > SLOT_USER_LIMIT) {
      // if limit exceeded, remove last
      matchPoolArray.pop();
    }
  }
  return matchPoolArray;
}


/**
 * Returns the indices, where in calendarData the value must be set to false, elsewhere true
 * @param {Array} dateTimeArray -- *sorted* array of Numbers (i.e. datetimes in MS)
 * @param {Number} calendarStart -- in MS the date of the first calendar slot 
 * @param {Number} allowedDifference -- how much apart different dates must be at least (15 min currently) UNUSED
 * @return {Array} [[hourRowIndex, day]] -- sorted array where first sorted by day then by hourRowIndex
 */
export const getSelectabilityIndices = function(dateTimeArray, calendarStart) { 
  let returnArray = [];
  // 3 is the nr of slots in the past and future that a session overlaps
  const overlaps = 3;
  /* these variables guarantee that no value gets added several times */
  let lastSlot = 0;
  let lastDay = -1;
  for (let i=0; i<dateTimeArray.length; i++) {
    let day = Math.floor((dateTimeArray[i]-calendarStart)/ONE_DAY);
    let slot = Math.floor((dateTimeArray[i]-calendarStart-day*ONE_DAY)/SLOT_INTERVAL);
    if (day != lastDay) {
      // this date is the first selected slot of the day
      lastDay = day;
      lastSlot = 0;
    }
    const startIdx = Math.max(slot-overlaps, 0, lastSlot);
    const stopIdx = Math.min(slot+overlaps+1, Math.floor(ONE_DAY/SLOT_INTERVAL));
    for (let i=startIdx; i<stopIdx; i++) {
      returnArray.push([i, day]);
    }
    lastSlot = slot+4;
  }
  return returnArray;
}