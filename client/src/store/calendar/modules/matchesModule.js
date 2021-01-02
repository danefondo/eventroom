const state = {
  /* 
    key: dateTime -- ms
    value if matched: {isMatched: true, matchedUserData: USER_SCHEMA/EXTENDED_USER_SCHEMA}
    value if unmatched: {isMatched: false}
  */
  allUserMatches: {},   
  /* array of sorted datetimes. Datetimes are Numbers of milliseconds from Unix epoch */
  allUserMatchDateTimes: [], 
};

const getters = {
  /**
   * @return true if is booked (either matched or unmatched) and false otherwise
   */
  isBookedForDateTime: (state) => (dateTimeMS) => {
    return state.allUserMatches[dateTimeMS] ? true : false;
  },
  /**
   * @return true if is booked AND matched, otherwise false
   */
  isMatchedForDateTime: (state) => (dateTimeMS) => {
    return state.allUserMatches[dateTimeMS] ? state.allUserMatches[dateTimeMS].isMatched : false;
  },
  /**
   * @return undefined if does not exist, otherwise USER_SCHEMA or EXTENDED_USER_SCHEMA
   */
  getMatchedUserForDateTime: (state) => (dateTimeMS) => {
    return state.allUserMatches[dateTimeMS] ? state.allUserMatches[dateTimeMS].matchedUserData : undefined;
  },
  /**
   * @return null, if no available user, otherwise displayName if it exists, otherwise username
   */
  getMatchedUserName: (state) => (dateTimeMS) => {
    const match = state.allUserMatches[dateTimeMS];
    if (match && match.isMatched) {
      if (match.matchedUserData.metadata.displayName) {
        return match.matchedUserData.metadata.displayName
      }
      return match.matchedUserData.metadata.username;
    }
    return null;
  }
};

const mutations = {
  SET_ALL_USER_MATCHES(state, newMatches) {
    state.allUserMatches = newMatches;
  },
  SET_ALL_MATCH_DATETIMES(state, newDateTimes) {
    state.allUserMatchDateTimes = newDateTimes;
  },

  /**
   * Sets a match in allUserMatches object for the specific date
   * Validity check elsewhere
   * @param {
   *  dateTimeMS: Number/String  
   *  matchedUserData: USER_SCHEMA or EXTENDED_USER_SCHEMA or null if unmatched,
   * } payload 
   */
  SET_MATCH_FOR_DATETIME(state, payload) {
    const {dateTimeMS, matchedUserData} = payload;
    if (matchedUserData) {
      // is matched
      Vue.set(state.allUserMatches, dateTimeMS, { isMatched: true, matchedUserData });
    } else {
      Vue.set(state.allUserMatches, dateTimeMS, { isMatched: false });
    }
  },

  /**
   * Deletes match from users sessions object
   * @param {String} dateTimeMS -- slot datetime from which to remove match in MS
   */
  REMOVE_MATCH_FROM_DATETIME(state, dateTimeMS) {
    // console.log("@removeMatchFromDatetime keys before: ", Object.keys(state.allUserMatches));
    Vue.delete(state.allUserMatches, dateTimeMS);
    // console.log("@removeMatchFromDatetime keys after: ", Object.keys(state.allUserMatches));
  },

  /**
   * Adds to its proper position in allUserMatchDateTimes, such that the array remains sorted. 
   * @param {Number} dateTimeMS -- in MS 
   */
  ADD_ONE_MATCH_DATETIME(state, dateTimeMS) {
    console.log("adding to datetime: ", dateTimeMS);

    if (!state.allUserMatches[dateTimeMS]) {
      /* if datetime does not exist already, add to correct place */
      console.log("here!")
      let array = state.allUserMatchDateTimes
      let right = array.length;
      let left = 0;
      let idx;
      // binary search
      while (left < right) {
        idx = Math.floor((right+left)/2);
        if (array[idx] < dateTimeMS) {
          left = idx+1;
        } else {
          right = idx;
        }
      }
      console.log("here2,left: ", left);
      state.allUserMatchDateTimes.splice(left, 0, dateTimeMS);
    }
    console.log("added to datetime,", new Date(dateTimeMS));
  },

  /**
   * removes one datetime from state.allUserMatchDateTimes array
   * @param {Number} index -- index to remove  
   */
  REMOVE_ONE_MATCH_DATETIME(state, index) {
    state.allUserMatchDateTimes.splice(index, 1);
  }
    
};

const actions = {
  /**
   * Sets a match in allUserMatches array for the specific date
   * Does not allow setting to past
   * @param {
   *  dateTimeMS: String of ms since Unix epoch
   *  matchedUserData: USER_SCHEMA or EXTENDED_USER_SCHEMA or null if unmatched
   * } data session is the session data of the partner
   */
  setMatchForDatetime({ commit }, data) {
    console.log("@setmatchfordatetime, data: ", data);
    const dateTimeMS = Number(data.dateTimeMS);
    if (dateTimeMS >= Date.now()) {
      console.log("@setmatchfordatetime here!");
      commit("ADD_ONE_MATCH_DATETIME", dateTimeMS);
      commit("SET_MATCH_FOR_DATETIME", data);
    }
  },

  /**
   * Removes a match from allUserMatches array for the specific date
   * @param {Number/String} dateTimeMS session is the session data of the partner
   * @return {
   *  previous -- the dateTime preceding removed match if exists
   *  next -- the dateTime right after the removed match if exists
   * }
    */
   removeMatchFromDateTime({ state, commit }, dateTimeMS) {
    console.log("@removeMatchForDateTime, data: ", dateTimeMS);
    dateTimeMS = Number(dateTimeMS);
    console.log("removing datetime: ", dateTimeMS);
    console.log("allusermatchdatetimes length: ", state.allUserMatchDateTimes.length);
    // TODO binary search
    let index = 0;
    for (let i=0; i<state.allUserMatchDateTimes.length; i++) {
      console.log(i, state.allUserMatchDateTimes[i], dateTimeMS, state.allUserMatchDateTimes[i]===dateTimeMS);
      if (state.allUserMatchDateTimes[i] === dateTimeMS) {
        index = i;
        break
      }
    }
    const returnObject = {
      previous: index !== 0 ? state.allUserMatchDateTimes[index-1] : null,
      next: (index+1) !== state.allUserMatchDateTimes.length ? state.allUserMatchDateTimes[index+1] : null
    };

    commit("REMOVE_MATCH_FROM_DATETIME", dateTimeMS);
    commit("REMOVE_ONE_MATCH_DATETIME", index);
    console.log("@removeMatchFromDateTime: removeduser: ", matchedUser);
    return returnObject;
  },

  /**
   * Adds all user matches to state
   * @param {Object} data contains two values: 
   * matched:  
   *  key: ID (matched user's ID), 
   *  value: {userData: {}, dateTimes: []} (matched user's data and datetimes when matched with that user)
   * unmatched: [datetime1, datetime2, ...]
   */
  addAllMatches({commit}, data) {
    const {matched, unmatched} = data;

    /* build new objects and arrays */
    let newMatchDateTimes = [];
    let newUserMatches = {};

    /* add datetimes when matched with people */
    const matchedKeys = Object.keys(matched);
    for (let i=0; i<matchedKeys.length; i++) {
      const currentMatch = matched[matchedKeys[i]];
      for (let j=0; j<currentMatch.dateTimes.length; j++) {
        newMatchDateTimes.push(Number(currentMatch.dateTimes[j]));
        newUserMatches[currentMatch.dateTimes[j]] = {
          isMatched: true,
          matchedUserData: currentMatch.userData,
        };
      }
    }
    /* add datetimes when unmatched */ 
    for (let i=0; i<unmatched.length; i++) {
      newMatchDateTimes.push(Number(unmatched[i]));
      newUserMatches[unmatched[i]] = {
        isMatched: false,
      };
    }

    /* sort the datetime array */
    newMatchDateTimes.sort((a,b) => a-b);

    commit("SET_ALL_USER_MATCHES", newUserMatches);
    commit("SET_ALL_MATCH_DATETIMES", newMatchDateTimes);
  },
};

const matches = {
  namespaced: true,
  state,
  getters,
  mutations,
  actions,
};

export default matches;