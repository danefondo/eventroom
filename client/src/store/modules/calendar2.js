import Vue from "vue";
import { startOfISOWeek } from "date-fns";
import api from "../../api/cofocusAPI";

import {
  getLocationFromDatetime,
  getPositionInMatchPoolArray,
  getSelectabilityIndices,
  addToMatchPoolArray
} from "../../pages/BookingPages2/CalendarUtilities/utilities";

const SLOT_INTERVAL_MINUTES = 15;
const SLOT_INTERVAL_MS = SLOT_INTERVAL_MINUTES*60*1000; /* each slot takes 15 min */ // eslint-disable-line no-unused-vars
const ONE_DAY = 24*60*60*1000; /* one day in ms */ // eslint-disable-line no-unused-vars
const SLOT_USER_LIMIT = 4; /* max nr of matchpool users per slot to hold in front end */

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
  calendarData: [],

  allUserSessions: [], // TODO TOREMOVE

  weekDates: [],
  weekStartDay: null,
  weekEndDay: null,

  week: true,

  rowNumberForWeekOrDay: 7,

  currentSelectedDay: new Date(),
  currentWeekStart: startOfISOWeek(new Date()),

  
  // maximumTime: "24:30",

  currentUserData: {metadata: {}}, 
  allUserMatches: {},   /* 'null' if unmatched, undefined otherwise */ 
  allUserMatchDateTimes: [], // TODO NEW array of sorted datetimes. Allows for faster stuff to happen

  // Shows when last full database sync occurred
  // but also serves as dummy data to update in mutations
  // when the state parameter is not used
  lastUpdated: null,

  // unreactive? unnecessary?
  // minimumTime: "00:00",
  // maximumTime: "23:59",
};

const getters = {
  /**
   * @param dateTimeMS -- 
   * @return null if does not exist, otherwise USER_SCHEMA or EXTENDED_USER_SCHEMA
   */
  getMatchedUserForDateTime: (state) => (dateTimeMS) => {
    return state.allUserMatches[dateTimeMS];
  },
  /**
   * @return {Boolean} if in view, hasCurrentOrNextSession value for the slot at dateTime
   * @return {null} if not in view 
   */
  getHasCurrentSessionForDateTime: (state) => (dateTime) => {
    const datetimeMS = dateTime.valueOf();

    const location = getLocationFromDatetime(
      state.week, 
      state.currentSelectedDay,
      state.currentWeekStart,
      datetimeMS  
    );
    if (location.success) {
      return state.calendarData[location.calendarIndex].hourRowDays[location.daysFromStart].hasCurrentOrNextSession;
    }
    else {
      return null
    }
  },
  /**
   * @return the first match in matchPoolUsersForSlot list if exists, null otherwise
   */
  getBestMatchForDatetime: (state) => (dateTime) => {
    const datetimeMS = dateTime.valueOf();
    const location = getLocationFromDatetime(
      state.week, 
      state.currentSelectedDay,
      state.currentWeekStart,
      datetimeMS  
    );
    console.log("@getbestmatchfordatetime: ", datetimeMS);

    if (location.success) {
      let matchPoolUsersForSlot = state.calendarData[location.calendarIndex].hourRowDays[location.daysFromStart].matchPoolUsersForSlot;
      console.log("@getbestmatchesfordatetime matchpoolusersforslot: ", matchPoolUsersForSlot);
      if (matchPoolUsersForSlot.length) return matchPoolUsersForSlot[0];
    }
    return null;
  }
};

const mutations = {
  /* ====== SET CALENDAR RENDERING DATA  ====== */
  setCalendarData(state, calendarData) {
    state.calendarData = calendarData;
  },

  setCalendarWeekDates(state, dates) {
    state.weekDates = dates;
    state.weekStartDay = dates[0];
    state.weekEndDay = dates[dates.length - 1];
  },

  setCalendarDayDate(state, dates) {
    state.weekDates = dates;
    state.weekStartDay = dates[0];
    state.weekEndDay = dates[0];
  },

  setCurrentWeekStartToThisWeekStart(state) {
    state.currentWeekStart = startOfISOWeek(new Date());
  },

  setCurrentWeekStart(state, date) {
    state.currentWeekStart = date;
  },

  setCurrentSelectedDay(state, date) {
    state.currentSelectedDay = date;
  },

  setUserData(state, userData) {
    state.currentUserData = userData;
  },

  setCurrentSelectedDayAsToday(state) {
    state.currentSelectedDay = new Date();
  },

  setCurrentSelectedDayAsStartOfWeek(state) {
    state.currentSelectedDay = state.currentWeekStart;
  },

  toggleWeekOrDay(state) {
    state.week = !state.week;
  },

  setRowNumberForWeekOrDay(state, number) {
    state.rowNumberForWeekOrDay = number;
  },

  /**
   * Updates slot.isAvailableForBooking or slot.isAvailableForSelecting fields 
   * for the whole calendar to their correct value
   * @param {
   *  indices -- sorted array of indices [slotIdx, day], where the slot must be false, elsewhere true
   *  field -- either isAvailableForBooking or isAvailableForSelecting
   * } data -- 
   * i.e. [[2,0], [90, 3]] is correctly sorted
   */
  updateCalendarSlotAvailability(state, data) {
    const nrDays = state.week ? 7 : 1;
    const nrSlots = 24*60/SLOT_INTERVAL_MINUTES;
    let currentIdx = 0;
    const indices = data.indices;
    /* either isAvailableForBooking or isAvailableForSelecting */
    const field = data.field;
    /* iterates over all calendarData */
    console.log("@ucsa: ", data);
    for (let day=0; day<nrDays; day++) {
      for (let slotIdx = 0; slotIdx < nrSlots; slotIdx++) {
        if (
          currentIdx < indices.length &&
          indices[currentIdx][0] === slotIdx && 
          indices[currentIdx][1] === day
        ) {
          // console.log("CHANGED TO FALSE", slotIdx, field);
          state.calendarData[slotIdx].hourRowDays[day][field] = false;
          currentIdx++;
        } else {
          state.calendarData[slotIdx].hourRowDays[day][field] = true;
        }
      }
    }
  },

  updateCalendarCurrentSessionSlot(state, session) {
    console.log("I AM HERE. AS I SHOULD BE. SO PROBLEM IS WITH ME.");
    let sessionStartInMS = new Date(session.dateTime).valueOf();
    let FIFTEEN_MINUTES = 900000; // milliseconds

    // TODO maybe remove the 7*96 loop

    state.calendarData.forEach((hourRow) => {
      hourRow.hourRowDays.forEach((slot) => {
        let slotStartInMS = new Date(slot.dateTime).valueOf();

        if (
          sessionStartInMS + 3*FIFTEEN_MINUTES <= slotStartInMS && 
          sessionStartInMS - FIFTEEN_MINUTES >= slotStartInMS  
        ) {
          slot.hasCurrentOrNextSession = true;
        } else {
          slot.hasCurrentOrNextSession = false;
        }
      });
    });
  },

  /**
   * Updates the slot value given by indices
   * @param {
   *  location -- location returned by getLocationFromDatetime() 
   *  field -- field name
   *  newValue -- new value for the field
   * } data -- updatedata
   */
  updateCalendarSlotField(state, data) {
    state.calendarData[data.location.calendarIndex].hourRowDays[data.location.daysFromStart][data.field] = data.newValue;
  },
  

  

  

/* ====== ======================================================================= ====== */
  /**
   * Adds match pool user to its proper slot. Removes the last if SLOT_USER_LIMIT is exceeded
   * NB! Comparison and exact position must be made earlier. 
   * @param {
   *  user: USER_SCHEMA,
   *  index: {
   *    calendarIndex, 
   *    daysFromStart,
   *    position 
   *  }
   * } data 
   * Here the slot position is 
   * state.calendarData[calendarIndex].hourRowDays[daysFromStart]
   * and position is the index in matchPoolUsersForSlot
   */
  addOneMatchPoolUserToSlot(state, data) {
    const calendarIndex = data.index.calendarIndex;
    const daysFromStart = data.index.daysFromStart;
    const position = data.index.position;
    // insert
    let userArray = state.calendarData[calendarIndex].hourRowDays[daysFromStart].matchPoolUsersForSlot;
    userArray.splice(position, 0, data.user);
    if (userArray.length > SLOT_USER_LIMIT) {
      // if limit exceeded, remove last
      userArray.pop();
    }
    // pray that it actually changed
  },
  /**
   * @param {
   *  calendarIndex, 
   *  daysFromStart,
   *  position 
   * } index
   * Here the slot position is 
   * state.calendarData[calendarIndex].hourRowDays[daysFromStart]
   */
  removeOneMatchPoolUserFromSlot(state, data) {
    const calendarIndex = data.calendarIndex;
    const daysFromStart = data.daysFromStart;
    const position = data.position;
    // remove
    // console.log("splicing at position, data: ", calendarIndex, daysFromStart, position);
    console.log("before splice: ", state.calendarData[calendarIndex].hourRowDays[daysFromStart].matchPoolUsersForSlot)
    state.calendarData[calendarIndex].hourRowDays[daysFromStart].matchPoolUsersForSlot.splice(position, 1);
    console.log("after splice: ", state.calendarData[calendarIndex].hourRowDays[daysFromStart].matchPoolUsersForSlot)
  },

  /**
   * @param {Object} data key: dateTimes, value: {calendarIndex, daysFromStart, matchPoolUsersForSlot}
   */
  addAllMatchablePeople(state, dataToMutation) {
    Object.values(dataToMutation).forEach(value => {
      state.calendarData[value.calendarIndex].hourRowDays[value.daysFromStart].matchPoolUsersForSlot = value.matchPoolUsersForSlot;
    });
  },

  /**
   * Sets a match in allUserMatches array for the specific date
   * Validity check in action
   * @param {
   *  user: USER_SCHEMA or EXTENDED_USER_SCHEMA
   *  datetime: String of ms since Unix epoch
   * } data session is the session data of the partner
   */
  setMatchForDatetime(state, data) {
    // console.log("@setmatchfordatetime mutation, data: ", data);
    Vue.set(state.allUserMatches, data.dateTime, data.user);
  },

  /**
   * Deletes match from users sessions object
   * @param {String} datetime -- slot datetime from which to remove match in MS
   */
  removeMatchFromDatetime(state, dateTime) {
    // console.log("@removeMatchFromDatetime keys before: ", Object.keys(state.allUserMatches));
    Vue.delete(state.allUserMatches, dateTime);
    // console.log("@removeMatchFromDatetime keys after: ", Object.keys(state.allUserMatches));
  },

  /**
   * Sets allUserMatches to new value (used after initial load)
   * @param {Object} data key: dateTime, value: user who is matched for that datetime or falsy value otherwise 
   */
  setAllUserMatches(state, data) {
    state.allUserMatches = data;
  },
  
  clearMatchDateTimes(state) {
    state.allUserMatchDateTimes = [];
  },
  /**
   * Adds to its proper position such that the array remains sorted. 
   * @param {Number} datetime -- in MS 
   */
  addMatchDatetime(state, dateTime) {
    console.log("adding to datetime: ", dateTime);
    console.log("adding to datetime: ", !state.allUserMatches[dateTime]);
    console.log("adding to datetime: ", state.allUserMatches[dateTime] !== null);
    if (!state.allUserMatches[dateTime] && state.allUserMatches[dateTime] !== null) {
      /* if datetime does not exist already, add to correct place */
      console.log("here!")
      let array = state.allUserMatchDateTimes
      let right = array.length;
      let left = 0;
      let idx;
      // binary search
      while (left < right) {
        idx = Math.floor((right+left)/2);
        if (array[idx] < dateTime) {
          left = idx+1;
        } else {
          right = idx;
        }
      }
      console.log("here2,left: ", left);
      state.allUserMatchDateTimes.splice(left, 0, dateTime);
    }
    console.log("added to datetime,", new Date(dateTime));
  },

  /**
   * removes dateTime from state.allUserMatchDateTimes array
   * @param {String} dateTime -- in ms 
   */
  removeMatchDateTime(state, dateTime) {
    console.log("removing datetime: ", dateTime);
    console.log("allusermatchdatetimes length: ", state.allUserMatchDateTimes.length);
    for (let i=0; i<state.allUserMatchDateTimes.length; i++) {
      console.log(i, state.allUserMatchDateTimes[i], dateTime, state.allUserMatchDateTimes[i]===dateTime);
      if (state.allUserMatchDateTimes[i] === dateTime) {
        const deleted = state.allUserMatchDateTimes.splice(i, 1);
        console.log("deleted: ", deleted, " target: ", dateTime);
        break;
      }
    }
  }
  
};

const actions = {
  

  /**
   * Sets a match in allUserMatches array for the specific date
   * Does not allow setting to past
   * @param {
    *  user: USER_SCHEMA or EXTENDED_USER_SCHEMA
    *  datetime: String of ms since Unix epoch
    * } data session is the session data of the partner
    */
  setMatchForDatetime({ commit }, data) {
    console.log("@setmatchfordatetime, data: ", data);
    if (Number(data.dateTime) >= Date.now()) {
      console.log("@setmatchfordatetime here!");
      commit("addMatchDatetime", data.dateTime);
      commit("setMatchForDatetime", data);
    }
  },

  /**
   * Sets a match in allUserMatches array for the specific date
   * @param {Number/String} dateTime session is the session data of the partner
    */
  removeMatchFromDateTime({ state, commit }, dateTime) {
    console.log("@removeMatchForDateTime, data: ", dateTime);
    const matchedUser = state.allUserMatches[dateTime];
    commit("removeMatchFromDatetime", dateTime);
    commit("removeMatchDateTime", Number(dateTime));
    console.log("@removeMatchFromDateTime: removeduser: ", matchedUser);
    return matchedUser;
  },

  /**
   * Compares against other people in sessions array. 
   * If preferences are suitable, adds to matchPoolUsersForSlot array
   * @param {
   *  user: USER_SCHEMA,
   *  dateTime: String or Number
   * } userData 
   * datetime must ms from Unix epoch either as String or Number 
   */
  addOneMatchPoolUser({ state, commit }, userData) {
    let index = getLocationFromDatetime(
      state.week, 
      state.currentSelectedDay, 
      state.currentWeekStart, 
      Number(userData.dateTime),
    );
    console.log("@ADDONEMATCHPOOL USER: !", userData);
    if (!index.success) {
      return { success: false };
    }
    let userArray = state.calendarData[index.calendarIndex].hourRowDays[index.daysFromStart].matchPoolUsersForSlot;
    index.position = getPositionInMatchPoolArray(state.currentUserData, userArray, userData.user, SLOT_USER_LIMIT);

    if (index.position >= SLOT_USER_LIMIT) {
      // if worse than all in array, don't add
      return null;
    }
    commit("addOneMatchPoolUserToSlot", {
      user: userData.user,
      index
    });
    return userData;
  },
  
  /**
   * Finds the user with corresponding ID and then removes it from the list 
   * @param {
   *  dateTime: String or Number,
   *  ID: String  
   * } removedUserData 
   * datetime must ms from Unix epoch either as String or Number
   * ID is the ID of the user to remove. 
   */
  removeOneMatchPoolUserFromSlot({ state, commit }, removedUserData) {
    let index = getLocationFromDatetime(
      state.week, 
      state.currentSelectedDay, 
      state.currentWeekStart, 
      Number(removedUserData.dateTime),
    );
  
    let userArray = state.calendarData[index.calendarIndex].hourRowDays[index.daysFromStart].matchPoolUsersForSlot;
    for (let i=0; i<userArray.length; i++) {
      if (userArray[i].metadata.ID === removedUserData.ID) {
        index.position = i;
        console.log("@removeOneMatchPoolUserFromSlot found index position: ", i);
        break;
      }
    }
    console.log("@removeOneMatchPoolUserFromSlot IDs: ", userArray, removedUserData);
    console.log("@removeOneMatchPoolUserFromSlot index: ", index);
    if (index.position !== "undefined") {
      commit("removeOneMatchPoolUserFromSlot", index);
      return removedUserData;
    }
    return null;
  },

  /**
   * Just calls addOneMatchPoolUser several times.
   * @param {
   *  userArray: [USER_SCHEMA],
   *  datetimeArray: [String or Number]
   * } usersData 
   * datetime must ms from Unix epoch either as String or Number 
   */
  addManyMatchPoolUsers(state, data) {
    // absolutely useless check, since would throw error anyway
    if (!data.userArray.length && data.userArray.length !== data.datetimeArray.length)  {
      throw new Error("Invalid argument @addManyMatchPoolUsers")
    }
    let returnArray = []; // not sure if necessary
    for (let i=0; i<data.userArray.length; i++) {
      returnArray.push(state.dispatch("addOneMatchPoolUser", {
        user: data.userArray[i],
        dateTime: data.datetimeArray[i]
      }));
    }
    return returnArray;
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
    let dataToMutation = {};
    Object.values(allMatchablePeople).forEach(data => {
      const dateTimes = data.dateTimes;
      const userData = data.userData;
      for (let i=0; i<dateTimes.length; i++) {
        if (Object.prototype.hasOwnProperty.call(dataToMutation, dateTimes[i])) {
          /* if already in dataToMutation */
          dataToMutation[dateTimes[i]].matchPoolUsersForSlot = addToMatchPoolArray(
            state.currentUserData, dataToMutation[dateTimes[i]].matchPoolUsersForSlot, userData, SLOT_USER_LIMIT
          );
        } else {
          /* otherwise get current state matchpoolarray and start adding there */
          const {success, calendarIndex, daysFromStart} = getLocationFromDatetime(
            state.week, state.currentSelectedDay, state.currentWeekStart, dateTimes[i]
          );
          if (success) {
            let currentMatchPoolArray = state.calendarData[calendarIndex].hourRowDays[daysFromStart].matchPoolUsersForSlot;
            /* initialize dataToMutation */
            dataToMutation[dateTimes[i]] = {
              calendarIndex,
              daysFromStart,
              matchPoolUsersForSlot: addToMatchPoolArray(
                state.currentUserData, currentMatchPoolArray, userData, SLOT_USER_LIMIT
              )
            };
          }
        }
      }
    });
    console.log("@ADD ALL MATCHABLE PEOPLE Data: ", dataToMutation);
    commit("addAllMatchablePeople", dataToMutation);
  },

  /**
   * Adds all user matches to state
   * @param {Object} data contains two values: 
   * matched: key: ID, value: {userData: {}, dateTimes: []} 
   * unmatched: [datetime1, datetime2, ...]
   */
  addAllMatches({commit}, data) {
    let allMatches = {};
    commit("clearMatchDateTimes");
    const allUserMatches = data.matched;
    const allUnmatched = data.unmatched;
    for (let i=0; i<allUnmatched.length; i++) {
      allMatches[allUnmatched[i]] = null;
      commit("addMatchDatetime", allUnmatched[i]);
    }
    Object.values(allUserMatches).forEach(value => {
      for (let i=0; i<value.dateTimes.length; i++) {
        commit("addMatchDatetime", value.dateTimes[i]);
        allMatches[value.dateTimes[i]] = value.userData;
      }
    });
    commit("setAllUserMatches", allMatches);
  },


  /**
   * Tries to add one user into several slots
   * Called, when another user books multiple sessions at a time
   * and then socket has emitted the other user's booking datetimes and data 
   * @param {
   *  user: USER_SCHEMA,
   *  datetimes: [String]
   * } userData 
   * @return {Array} Array of Promises
   */
  addOneUserMultipleTimes({ dispatch }, userData) {
    let returnArray = []; // not sure if necessary
    for (let i=0; i<userData.datetimes.length; i++) {
      returnArray.push(dispatch("addOneMatchPoolUser", {
        user: userData.user,
        dateTime: userData.datetimes[i]
      }));
    }
    return returnArray;
  },

  /**
   * Updates calendar slot availability, 
   * @param {Number} updateType -- either 0 or 1
   * if 0, updates isAvailableForBooking
   * if 1, updates isAvailableForSelecting 
   */
  updateCalendarSlotAvailability({ state, rootState, commit }, updateType) {
    // console.log("@calendar.js: Update slot availability.", updateType);
    const calendarStart = state.week ? state.currentWeekStart : state.currentSelectedDay;
    let indices = [];
    let field = "isAvailableForSelecting";
    // console.log("checkpoint: ", state.week, state.currentWeekStart, state.currentSelectedDay, calendarStart);
    if (updateType == 0) {
      indices = getSelectabilityIndices(state.allUserMatchDateTimes, calendarStart);
      // console.log("@calendar.js indices 0:", indices);
      field = "isAvailableForBooking";
    } else if (updateType == 1) {
      let dateTimes = [];
      // accesses booking module from rootState, gets current selection
      let selectedToBook = rootState.booking.selectedToBook;
      selectedToBook.sort((a,b)=>a.valueOf()-b.valueOf());
      for (let i=0; i<rootState.booking.selectedToBook.length; i++) {
        dateTimes.push(Number(rootState.booking.selectedToBook[i]));
      }
      indices = getSelectabilityIndices(dateTimes, calendarStart);
      // console.log("@calendar.js indices 1:", indices);
      field = "isAvailableForSelecting";
    }
    // console.log("@calendar.js: ", field)
    // console.log("@calendar.js: ", indices);
    commit("updateCalendarSlotAvailability", {
      indices,
      field
    });
    // console.log("@calendar.js: Update slot availability: DONE: ", field, indices);
  },
 
   /**
    * Update selected slot based on update data
    * @param {
    *   slotDateTime {Date} -- slot's datetime 
    *   newSlotState -- new value  
    *   field {String} -- field to update
    * } slotUpdateData 
    */
  updateOneSlotByDateTime({ state, commit }, slotUpdateData) {
    const location = getLocationFromDatetime(
      state.week,
      state.currentSelectedDay,
      state.currentWeekStart,
      Number(slotUpdateData.slotDateTime.valueOf())
    );
    if (location.success) {
      commit("updateCalendarSlotField", {
        location,
        field: slotUpdateData.field,
        newValue: slotUpdateData.newSlotState
      });
    }
  },

  /**
    * Update many slots based on update data
    * NB! for all dateTimes in array, updates the same field to same value
    * @param {
    *   slotDateTimeArray {[Date]} -- Array of slots' datetimes 
    *   newSlotState -- new value  
    *   field {String} -- field to update
    * } slotUpdateData 
    */
  updateManySlotsByDateTime({ dispatch }, slotUpdateData) {
    for (let i=0; i<slotUpdateData.slotDateTimeArray.length; i++) {
      dispatch("updateOneSlotByDateTime", {
        slotDateTime: slotUpdateData.slotDateTimeArray[i],
        newSlotState: slotUpdateData.newSlotState,
        field: slotUpdateData.field
      });
    }
  },

  // default expects: sessionId, sessionDateTime, session = null
  setCalendarData(state, calendarData) {
    state.commit("setCalendarData", calendarData);
  },

  setCalendarWeekDates(state, dates) {
    state.commit("setCalendarWeekDates", dates);
  },

  setCalendarDayDate(state, dates) {
    state.commit("setCalendarDayDate", dates);
  },

  setCurrentWeekStartToThisWeekStart(state) {
    state.commit("setCurrentWeekStartToThisWeekStart");
  },

  setCurrentWeekStart(state, date) {
    state.commit("setCurrentWeekStart", date);
  },

  setCurrentSelectedDay(state, date) {
    state.commit("setCurrentSelectedDay", date);
  },

  setCurrentSelectedDayAsToday(state) {
    state.commit("setCurrentSelectedDayAsToday");
  },

  setCurrentSelectedDayAsStartOfWeek(state) {
    state.commit("setCurrentSelectedDayAsStartOfWeek");
  },

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

  toggleWeekOrDay(state) {
    state.commit("toggleWeekOrDay");
  },

  setRowNumberForWeekOrDay(state, number) {
    state.commit("setRowNumberForWeekOrDay", number);
  },


  /* ====== SLOT AVAILABILITY STATE CHANGING  ====== */
  

  /* ====== ITERATIVE DATA REFRESH -- ONLY UPDATE CHANGES  ====== */
  iterativeRefreshCalendarSessions(state, data) { // eslint-disable-line no-unused-vars
    /* ====== Collect data to update  ====== */
    return;
  },
  
  updateCalendarCurrentSessionSlot(state, sessionData) {
    state.commit("updateCalendarCurrentSessionSlot", sessionData);
  },
  removeSelectionsInThePast(state) {
    state.commit("removeSelectionsInThePast");
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
