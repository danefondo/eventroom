const { redisClient, hdelAsync, hsetAsync, hscanAsync } = require("../config/redisClient");
const {
  parseToMatched,
  parseToUnmatched,
  parseToMatchedValue,
  unparseMatchedValue
} = require("../config/KeyValueParsers");

async function runMultiCommand(multiCommandArray) {
  return new Promise((resolve, reject) => {
    const multi = redisClient.multi(multiCommandArray);
    multi.exec((err, replies) => {
      if (err) reject(err);
      resolve(replies);
    })
  });
}

/**
 * There are 3 allowed write operations on matchpools
 * If in future figure out how to run Lua scripts, those are preferred 
 * since ths version contains some unhandled race conditions 
 * 
 * removeUserFromMatchPools -- removes a user and their matches from both match pools
 * setMatchNX -- sets one user to match with another in matched pool, does not overwrite
 * setUnmatched -- sets user as unmatched
 * 
 */


async function setUnmatched(key, userID) {
  return hsetAsync(key, userID, 0);
}

/**
 * After this operation a user is not in match pools for specified dates. 
 * @param {Number/String} dateTime 
 * @param {String} userID 
 * @return {Object} Contains two parameters: success and userToRematch
 * success:
 * true -- if match was valid and removed OR no match
 * false -- if there was invalid match, so userID needs to be rematched
 * userToRematch object the same form as returned by parseMatchedValue
 * userToRematch = 
 *  ID: userID -- if success === false
 *  ID: user's previous partner -- if there was a match
 *  null -- if nobody needs to be rematched
 */
async function removeUserFromMatchPools(dateTime, userID, userRematchAllowed = true) {
  const matchedKey = parseToMatched(dateTime);
  const unmatchedKey = parseToUnmatched(dateTime);
  /* removing user */
  const userMultiCommands = [
    ["hget", matchedKey, userID],
    ["hdel", matchedKey, userID],
    ["hdel", unmatchedKey, userID]
  ];
  const userMultiReplies = await runMultiCommand(userMultiCommands);
  console.log("@removeuserfrommatchpools ", userID);
  console.log("@removeuserfrommatchpools replies: ", userMultiReplies);
  const partner = unparseMatchedValue(userMultiReplies[0]); // get partner
  console.log("@removeuserfrommatchpools partner: ", partner);
  if (partner.ID) {
    console.log("HERE")
    /* if user had a partner, remove partner */ 
    const partnerMultiCommands = [
      ["hget", matchedKey, partner.ID],
      ["hdel", matchedKey, partner.ID],
      ["hdel", unmatchedKey, partner.ID]
    ];

    const partnerMultiReplies = await runMultiCommand(partnerMultiCommands);
    console.log("@removeuserfrommatchpools partnerReplies: ", partnerMultiReplies);
    const secondPartner = unparseMatchedValue(partnerMultiReplies[0]);
    /* 
      if second user's partner was not the original user,
      roll back and set the original user as the user to be rematched 
    */ 
    console.log("@removeuserfrommatchpools secondpartner: ", secondPartner);
    if (secondPartner.ID && secondPartner.ID !== userID) {
      console.log("@removeuserfrommatchpools revert!");
      hsetAsync(matchedKey, partner.ID, parseToMatchedValue(secondPartner.ID, secondPartner.norematch));
      if (partnerMultiReplies[2] !== "0") {
        // nb async
        setUnmatched(unmatchedKey, partner.ID);
      }
      return {success: false, userToRematch: parseToMatchedValue(userID, userRematchAllowed)};
    } 
    console.log("resolved to true")
    /* if partner's user was the original user, the partner needs to be rematched */ 
    return {success: true, userToRematch: partner};
  } 
  /* if didn't have partner, noone needs to be rematched */
  return {success: true, userToRematch: null};
}

/**
 * If someone has not overwritten their values, sets a new match between userID and matchedUserID
 * @param {Number/String} dateTime 
 * @param {String} userID 
 * @param {Boolean} userNoRematch -- whether userID accepts rematches
 * @param {String} matchedUserID 
 * @param {Boolean} matchedNoRematch -- whether matchedUserID accepts rematches
 * @return {Array} rematchArray -- the user ID-s who need to be rematched after this step.
 */
async function setToMatchPoolNX(dateTime, userID, matchedUserID, userRematchAllowed, matchedUserRematchAllowed) {
  return new Promise((resolve, reject) => {
    if (!redisClient) {
      reject("no redis client");
    }
    const matchedKey = parseToMatched(dateTime);
    const userValue = parseToMatchedValue(userID, userRematchAllowed);
    const matchedValue = parseToMatchedValue(matchedUserID, matchedUserRematchAllowed);
    const multi = redisClient.multi([
      ["hsetnx", matchedKey, userID, matchedValue],
      ["hsetnx", matchedKey, matchedUserID, userValue]
    ]);
    multi.exec(async (error, replies) => {
      if (error) {
        reject(error);
      }
      let deletionArray = [];
      let rematchArray = [];

      /* if could not set matchedUserID, they had a match and userID is matchless */
      if (replies[1] === "0") {
        deletionArray.push(hdelAsync(matchedKey, userID));
        rematchArray.push(useValue)
      }
      /* if could not set userID, they had a match and matchedUserID is matchless */ 
      if (replies[0] === "0") {
        deletionArray.push(hdelAsync(matchedKey, matchedUserID)); 
        rematchArray.push(matchedValue);
      } 
      try {
        await Promise.all(deletionArray);
      } catch (error) {
        reject(error);
      }
      /* returns rematchArray. Empty for the default case */
      resolve(rematchArray);
    })
  });
}


const MatchPoolController = {
  /**
   * UserID has requested a match with matchedUserID at dateTime. 
   * NOT REMATCH, i.e. handles request from client.
   * @param {Number/String} dateTime -- in MS the match datetime 
   * @param {String} userID -- the ID of user who requested this match 
   * @param {String} matchedUserID -- the ID of user with whom the match was requested 
   * @return {
   *  userIsMatched {Boolean} -- true, if userID matched with matchedUserID
   *  rematchArray {Array} -- array of userIDs that need to be rematched
   * }
   */
  async replaceOneMatch (dateTime, userID, matchedUserID, userRematchAllowed=true, matchedUserRematchAllowed=true) {
    try {
      let rematchArray = [];
      /* array of created matches in the form [partner1, partner2] */
      let createdMatches = []; 
      /* remove both users from match pool */ 
      const removeMatchResults = await Promise.all([
        removeUserFromMatchPools(dateTime, userID),
        removeUserFromMatchPools(dateTime, matchedUserID)
      ]);
      console.log("@matchpoolcontroller removematchresults: ", removeMatchResults);
      let success = removeMatchResults[0].success && removeMatchResults[1].success; 
      /* collect the people need to be rematched */
      const user1_toRematch = removeMatchResults[0].userToRematch;
      const user2_toRematch = removeMatchResults[1].userToRematch;
      if (user1_toRematch && user1_toRematch.ID != matchedUserID) {
        rematchArray.push(removeMatchResults[0].userToRematch);
      }
      if (user2_toRematch && user2_toRematch.ID != userID) {
        rematchArray.push(removeMatchResults[1].userToRematch);
      }
      
      if (success) {
        /* if previous steps were successful, set the new match */ 
        const result = await setToMatchPoolNX(dateTime, userID, matchedUserID, userRematchAllowed, matchedUserRematchAllowed);
        success = result.length === 0;
        for (let i=0; i<result.length; i++) {
          rematchArray.push(result[i]);
          /* the fact that these are unmatched is handled in rematch flow */
        }
        if (success) {
          createdMatches.push(userID, matchedUserID); 
        }

      }
      return {
        success,
        rematchArray, // should not contain duplications
        createdMatches,
      }
    } catch(error) {
      console.log("@redis setonematch error", error);
    }
  },

  /**
   * UserID has cancelled a match at dateTime.
   * @param {Number/String} dateTime -- in MS the datetime of match
   * @param {String} userID -- the ID of user who cancelled the match
   * @return 
   */
  async cancelOneMatch(dateTime, userID) {
    try {
      return removeUserFromMatchPools(dateTime, userID, false);
    } catch(error) {
      console.log("@redis cancelonematch error: ", error);
    }
  },

  /**
   * UserID has cancelled a match, but wants to remain in unmatch pool
   * @param {Number/String} dateTime 
   * @param {String} userID 
   * @return 
   */
  async setToUnmatched(dateTime, userID) {
    try {
      const removalResult = await removeUserFromMatchPools(dateTime, userID, false);
      await setUnmatched(parseToUnmatched(dateTime), userID);
      return removalResult;
      
    } catch(error) {
      console.log("@redis cancelonematch error: ", error);
    }
  },

  async setToUnmatchedWithoutDeletion(dateTime, userID) {
    return setUnmatched(parseToUnmatched(dateTime), userID);
  },
  /**
   * Get a range of keys for the unmatched people at datetime
   * Completes one iteration of hscan for datetime 
   * @param {Number/String} dateTime 
   * @param {Cursor} cursor -- if iteration starts, default value, otherwise the value from previous iteration 
   * @return {Set} keys -- the set of found keys
   */
  async scanUnmatchedPool(dateTime, cursor="0") {
    try {
      const replies = await hscanAsync(parseToUnmatched(dateTime), cursor);
      cursor = replies[0];
      const userIDSet = new Set();
      for (let i=0; i<replies[1].length; i++) {
        userIDSet.add(replies[1][i]);
      }
      return {
        cursor,
        userIDSet
      }
    } catch(error) {  
      console.log("@redis getunmatchedrange error: ", error);
    }
  }
}

module.exports = MatchPoolController;