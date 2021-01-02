import { startOfISOWeek, startOfDay } from 'date-fns';

import api from "../../api/cofocusAPI";

import { addToMatchPoolArray, getPositionInMatchPoolArray } from "../utilities/compareUtilities";
import {SLOT_USER_LIMIT} from "../constants";


/* for easy reference only */
const USER_SCHEMA = { // eslint-disable-line no-unused-vars
  /* partner metadata */ 
  metadata: {
    ID: String,
    profileImageUrl: String, // i think?
    displayName: String
  },
  /* partner preferences */ 
  preferences: {

  },
  /* partner data to compare against preferences */
  preferenceData: {

  }
};
/* Extended user schema contains all the data as user schema but includes 
  session ID, i.e. session has been made in Mongo for this.*/
const EXTENDED_USER_SCHEMA = { // eslint-disable-line no-unused-vars
  ...USER_SCHEMA,
  sessionID: String, 
}

const state = {
  /*
    Contains all slot data, 
    key: dateTimeMS -- slot datetime as ms from unix epoch
    value: see generateCalendar.js -- slot info (matchPoolUsersForSlot, selectability, availability etc)
  */
  calendarData: {},

  weekDates: [],
  weekStartDay: null,
  
  week: true,

  currentDayStartMS: startOfDay(Date.now()).valueOf(),
  currentWeekStartMS: startOfISOWeek(Date.now()).valueOf(),

  weekEndDay: null, // TODO remove/getters
  rowNumberForWeekOrDay: 7, // TODO remove/getters
  currentUserData: {metadata: {}}, // TODO move to somewhere else
};

const getters = {
  /**
   * @return null, if no available user, otherwise displayName if it exists, otherwise username
   */
  getBestMatchName: (state) => (dateTimeMS) => {
    const bestMatch = state.calendarData[dateTimeMS].matchPoolUsersForSlot[0];
    if (bestMatch && bestMatch.metadata) {
      if (bestMatch.metadata.displayName) {
        return bestMatch.metadata.displayName
      }
      return bestMatch.metadata.username;
    }
    return null;
  },
  /**
   * @return null, if no available user, otherwise profileImageUrl
   */
  getBestMatchProfileImageUrl: (state) => (dateTimeMS) => {
    const bestMatch = state.calendarData[dateTimeMS].matchPoolUsersForSlot[0];
    if (bestMatch && bestMatch.metadata) {
      return bestMatch.metadata.profileImageUrl;
    }
    return null;
  },
  /**
   * @return false if no users in match pool for this datetime, otherwise true
   */
  matchableUsersExist: (state) => {
    return Boolean(state.calendarData[dateTimeMS].matchPoolUsersForSlot.length);
  }
};

/* All validation MUST HAPPEN outside mutations */

const mutations = {
  /* ======== GENERAL SETTERS ======== */

  SET_CALENDAR_DATA(state, newData) {
    state.calendarData = newData;
  },
  SET_WEEK_DATES(state, newDates) {
    state.weekDates = newDates;
  },
  SET_WEEK_START_DAY(state, newStart) {
    state.weekStartDay = newStart;
  },
  SET_WEEK_END_DAY(state, newEnd) {
    state.weekEndDay = newEnd;
  },
  SET_WEEK(state, newWeek) {
    state.week = newWeek;
  },
  SET_ROW_NUMBER_FOR_WEEK_OR_DAY(state, newNr) {
    state.rowNumberForWeekOrDay = newNr;
  },
  SET_CURRENT_DAY_START_MS(state, newDayMS) {
    state.currentDayStart = newDayMS;
  },
  SET_CURRENT_WEEK_START_MS(state, newStartMS) {
    state.currentWeekStart = newStartMS;
  },
  SET_CURRENT_USER_DATA(state, newData) {
    state.currentUserData = newData;
  },

  /* ======== CALENDARDATA FIELD SETTERS ======== */

  SET_ONE_SLOT_FIELD_STATUS(state, payload) {
    const {dateTimeMS, field, value} = payload;
    state.calendarData[dateTimeMS][field] = value;
  },
  SET_SLOT_ARRAY_FIELD_STATUS(state, payload) {
    /* sets all in dateTimeMSArray to the *one* selectionValue value provided */
    const {dateTimeMSArray, field, value} = payload;
    for (let i=0; i<dateTimeMSArray.length; i++) {
      state.calendarData[dateTimeMSArray[i]][field] = value;
    }
  },


  /* ======== CALENDARDATA MATCHPOOL USERS HANDLER ======== */

  /**
   * Adds one user to matchpool
   * @param {
   *  dateTimeMS {String/Number} -- in ms datetime for slot 
   *  userData {USER_SCHEMA} -- user to add 
   *  position -- position where to add in matchPoolUsersForSlot Array
   * } payload 
   */
  ADD_ONE_TO_MATCH_POOL(state, payload) {
    const {dateTimeMS, userData, position} = payload;
    state.calendarData[dateTimeMS].matchPoolUsersForSlot.splice(position, 0, userData);
    if (state.calendarData[dateTimeMS].matchPoolUsersForSlot.length > SLOT_USER_LIMIT) {
      state.calendarData[dateTimeMS].matchPoolUsersForSlot.pop();
    }
  },
  /**
   * Removes one user from matchpool
   * @param {
   *  dateTimeMS {String/Number} -- in ms datetime for slot 
   *  position -- position from where to remove in matchPoolUsersForSlot Array
   * } payload 
   */
  REMOVE_ONE_FROM_MATCH_POOL(state, payload) {
    const {dateTimeMS, position} = payload;
    state.calendarData[dateTimeMS].matchPoolUsersForSlot.splice(position, 1);
  },
  /**
   * Used after loading data from database. For each calendarData slot replaces the MatchPoolUsersForSlot array 
   * with the array provided in newMatchPool, as it is 'more fresh' 
   * @param {
   *  dateTimeMS: [User1Data, User2Data, ...] (length < SLOT_USER_LIMIT)
   * } newMatchPool -- data
   */
  ADD_ALL_MATCHABLE_PEOPLE(state, newMatchPool) {
    Object.keys(state.calendarData).forEach(dateTimeMS => {
      if (newMatchPool[dateTimeMS] && newMatchPool[dateTimeMS].length) {
        state.calendarData[dateTimeMS].matchPoolUsersForSlot = newMatchPool[dateTimeMS];
      } else {
        state.calendarData[dateTimeMS] = [];
      }
    });  
  }

};


const actions = {
  /**
   * Set at one datetime one field to new value
   * @param {
   *  dateTimeMS {Number/String},
   *  field,
   *  value
   * } payload
   */
  setOneSlotFieldStatus({commit}, payload) {
    commit("SET_ONE_SLOT_FIELD_STATUS", payload);
  },
  /**
   * Set at all datetimes one field to *the same* new value
   * @param {
    *  dateTimeMSArray {Array},
    *  field {String}, -- field to change
    *  value -- new value
    * } payload
    */
  setSlotArrayFieldStatus({commit}, payload) {
    commit("SET_SLOT_ARRAY_FIELD_STATUS", payload);
  },
  /**
   * Adds one user to matchpool
   * @param {
   *  dateTimeMS {String/Number} -- in ms datetime for slot 
   *  userData {USER_SCHEMA} -- user to add 
   * } payload 
   */
  addOneMatchPoolUser({ state, commit }, payload) {
    const {dateTimeMS, userData} = payload;
    console.log("@ADDONEMATCHPOOL USER: !", userData);
    if (!index.success) {
      return { success: false };
    }
    let userArray = state.calendarData[dateTimeMS].matchPoolUsersForSlot;
    const position = getPositionInMatchPoolArray(state.currentUserData, userArray, userData, SLOT_USER_LIMIT);

    if (index.position >= SLOT_USER_LIMIT) {
      // if worse than all in array, don't add
      return null;
    }
    commit("ADD_ONE_TO_MATCH_POOL", {
      dateTimeMS,
      userData,
      position
    });
  },
  /**
   * Removes one user from matchpool
   * @param {
   *  dateTimeMS,
   *  removedUserID {String} -- ID of the user who was removed from match pool at this datetime
   * } payload
   */
  removeOneMatchPoolUserFromSlot({state, commit}, payload) {
    const {dateTimeMS, removedUserID} = payload
    let userArray = state.calendarData[dateTimeMS].matchPoolUsersForSlot;
    let position;
    for (let i=0; i<userArray.length; i++) {
      if (userArray[i].metadata.ID === removedUserID) {
        position = i;
        console.log("@removeOneMatchPoolUserFromSlot found index position: ", i);
        break;
      }
    }
    if (position === 0 || position) {
      commit("REMOVE_ONE_FROM_MATCH_POOL", {
        dateTimeMS, 
        position
      });
    }
    return null;
  },

  /**
   * Adds to calendarData allMatchable people got from backend. Collects all data that needs to be set to 
   * dataToMutation and then commits this change as a whole
   * @param {Object} allMatchablePeople {user1ID: {user1Data: {}, dateTimes: []}, user2ID: {}...}
   */
  addAllMatchablePeople({state, commit}, allMatchablePeople) {
    /* dataToMutation contains as keys dateTimes in MS and as values objects with 3 properties 
      calendarIndex and daysFromStart -- position in calendarData
      matchPoolArray -- Array to replace the old matchPoolArray with
    */
    let newMatchPool = {};
    Object.keys(allMatchablePeople).forEach(key => {
      const {userData, dateTimes} = allMatchablePeople[key];
      for (let i=0; i<dateTimes.length; i++) {
        if (Object.prototype.hasOwnProperty.call(newMatchPool, dateTimes[i])) { 
          newMatchPool[dateTimes[i]] = addToMatchPoolArray(
            state.currentUserData, newMatchPool[dateTimes[i]], userData, SLOT_USER_LIMIT
          );
        } else {
          // TODO add suitability check
          newMatchPool[dateTimes[i]] = [userData];
        }
      }
    });
    commit("ADD_ALL_MATCHABLE_PEOPLE", newMatchPool);
  },

  /* ======== RANDOM SETTERS ======== */
  /**
   * Gets userData (preferences etc) from Mongo
   */
  async setUserData({commit}) {
    try {
      const result = await api.REQUEST({
        method: "get",
        url: "/api/booking/getUserData",
        withCredentials: true
      })
      if (result && result.data && result.data.success) {
        commit("setUserData", result.data.userData);
      }
    } catch (error) {
      console.log("@setUserData calendar.js error: ", error);
    }
  },
  setCalendarData({commit}, calendarData) {
    commit("SET_CALENDAR_DATA", calendarData);
  },
  setCalendarWeekDates({commit}, dates) {
    commit("SET_WEEK_DATES", dates);
    commit("SET_WEEK_START_DAY", dates[0]);
    commit("SET_WEEK_END_DAY", dates[dates.length - 1]);
  },
  setCalendarDayDate({commit}, dates) {
    // TODO eliminate wtf
    commit("SET_WEEK_DATES", dates);
    commit("SET_WEEK_START_DAY", dates[0]);
    commit("SET_WEEK_END_DAY", dates[0]); // wtf
  },
  setRowNumberForWeekOrDay({commit}, number) {
    commit("SET_ROW_NUMBER_FOR_WEEK_OR_DAY", number);
  },
  // TODO cleanup
  setCurrentSelectedDay(state, date) {
    state.commit("setCurrentSelectedDay", date);
  },
  setCurrentSelectedDayAsToday(state) {
    state.commit("setCurrentSelectedDayAsToday");
  },
  setCurrentSelectedDayAsStartOfWeek(state) {
    state.commit("setCurrentSelectedDayAsStartOfWeek");
  },
  iterativeRefreshCalendarSessions(state, data) { // eslint-disable-line no-unused-vars
    /* ====== Collect data to update  ====== */
    return;
  },
};



const calendar = {
  namespaced: true,
  state,
  getters,
  mutations,
  actions,
};

export default calendar;