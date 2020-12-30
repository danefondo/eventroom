const MATCHED_ID = "matched:";
const MATCHED_ID_LENGTH = MATCHED_ID.length;

const UN_MATCHED_ID = "unmatched:";
const UN_MATCHED_ID_LENGTH = UN_MATCHED_ID.length;

const DATE_ACCURACY = 15;    // in minutes. 
const DATE_ACCURACY_MS = DATE_ACCURACY * 60000;

const NOREMATCH = "_nore_";
const NORE_LENGTH = NOREMATCH.length;

const USER_IDENTIFIER = "user:";
const USER_IDENTIFIER_LENGTH = USER_IDENTIFIER.length;

/* ================================================================================ */
/* MATCHING */

/**
 * Accepts Javascript date object as string and returns date up to accuracy of DATE_ACCURACY minute. 
 * Maybe in future set it to accuracy of 1 minute or more idk idc
 * @param {Number/String} date -- seconds from Unix epoch
 * @return {String} -- parsed date, with identifier added in front
 */
const parseToMatched = date => MATCHED_ID + String(Math.floor(Number(date)/(DATE_ACCURACY_MS)));

const parseToUnmatched = date => UN_MATCHED_ID + String(Math.floor(Number(date)/(DATE_ACCURACY_MS)));


/**
 * reverse of parse
 * @param {String} dbDate
 * @return {Number} -- Number in MS 
 */
const unparseMatched = key => Number(key.slice(MATCHED_ID_LENGTH))*DATE_ACCURACY_MS;

const unparseUnmatched = key => Number(key.slice(UN_MATCHED_ID_LENGTH))*DATE_ACCURACY_MS;

/**
 * Encodes norematch into string 
 * @param {String} userID -- not null 
 * @param {Boolean} norematch -- false, if rematch not allowed 
 */

const parseToMatchedValue = (userID, rematchAllowed) => rematchAllowed ? userID : NOREMATCH + userID;

const unparseMatchedValue = (value) => 
  (value && value.slice(0, NORE_LENGTH) === NOREMATCH) ? 
  {rematchAllowed: false, ID: value.slice(NORE_LENGTH)} :
  {rematchAllowed: true, ID: value};
  
/* ================================================================================ */
/* User data cache */

/* returns key from userID */
const parseToUserKey = userID => USER_IDENTIFIER+userID;

/* returns userID from key */
const unparseUserKey = key => key.slice(USER_IDENTIFIER_LENGTH);


module.exports = {
  parseToMatched,
  parseToUnmatched,
  unparseMatched,
  unparseUnmatched,
  parseToMatchedValue,
  unparseMatchedValue,
  parseToUserKey,
  unparseUserKey,
}