
/**
 * Compares the two partners and returns which of the two partners would be a better match 
 * @param {USER_SCHEMA} currentUser 
 * @param {USER_SCHEMA} oldPartner  
 * @param {USER_SCHEMA} newPartner 
 * @return {Number} 
 *  0 -- if oldPartner is better
 *  1 -- if newPartner is better
 */
const comparePreferences = function(currentUser, oldPartner, newPartner) { // eslint-disable-line no-unused-vars
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
const getPositionInMatchPoolArray = function(currentUser, matchPoolArray, newPartner, SLOT_USER_LIMIT) {
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
function addToMatchPoolArray (currentUser, matchPoolArray, newPartner, SLOT_USER_LIMIT) {
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



export default {
  addToMatchPoolArray,
  getPositionInMatchPoolArray,
}