import Vue from "vue";
import { startOfISOWeek } from "date-fns";
import {
  checkIfInArrayById,
  isUserEitherPartnerInSession,
} from "../../pages/BookingPages/CalendarUtilities/compareHelpers";

const state = {
  calendarData: [],

  allUserSessions: [],

  selectedToBook: [],

  weekDates: [],
  weekStartDay: null,
  weekEndDay: null,

  week: true,

  rowNumberForWeekOrDay: 7,

  currentSelectedDay: new Date(),
  currentWeekStart: startOfISOWeek(new Date()),

  minimumTime: "00:00",
  maximumTime: "23:59",
  // maximumTime: "24:30",

  fieldsToUpdate: [
    "dateTime",
    "sessionInterval",
    "firstPartnerId",
    "firstPartnerUsername",
    "firstPartnerFirstName",
    "firstPartnerLastName",
    "firstPartnerDisplayName",
    "firstPartnerProfileImageUrl",
    "firstPartnerProfileImageUrlSmall",
    "firstPartnerSessionCustomTitle",
    "secondPartnerId",
    "secondPartnerUsername",
    "secondPartnerFirstName",
    "secondPartnerLastName",
    "secondPartnerDisplayName",
    "secondPartnerProfileImageUrl",
    "secondPartnerProfileImageUrlSmall",
    "secondPartnerSessionCustomTitle",
    "sessionIsMatched",
    "sessionThroughMatching",
    "sessionPartnerLimit",
    "sessionType",
    "sessionRoomInitiated",
    "sessionURL",
    "eventroomId",
  ],

  // Shows when last full database sync occurred
  // but also serves as dummy data to update in mutations
  // when the state parameter is not used
  lastUpdated: null,
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

  /* ====== HARD DATA REFRESH  ====== */

  hardRefreshCalendarSessions(state, data) {
    let userId = data.userId;
    let sessions = data.sessions;
    state.allUserSessions = [];

    sessions.forEach((session) => {
      state.calendarData.forEach((hourRow) => {
        hourRow.hourRowDays.forEach((slot) => {
          while (slot.userSessionsForSlot.length > 0) {
            slot.userSessionsForSlot.pop();
          }

          while (slot.peopleSessionsForSlot.length > 0) {
            slot.peopleSessionsForSlot.pop();
          }

          let sessionDateTime = new Date(session.dateTime);
          if (slot.dateTime.valueOf() == sessionDateTime.valueOf()) {
            if (
              session.firstPartnerId == userId ||
              session.secondPartnerId == userId
            ) {
              let inUserSessionsForSlot = checkIfInArrayById(
                slot.userSessionsForSlot,
                session._id
              );
              if (inUserSessionsForSlot) {
                slot.userSessionsForSlot.push(session);
              }

              let inAllUserSessions = checkIfInArrayById(
                state.allUserSessions,
                session._id
              );
              if (inAllUserSessions) {
                state.allUserSessions.push(session);
              }

              this.checkIfInArrayElsePush(this.allUserSessions, session);
            } else {
              let inPeopleSessionsForSlot = checkIfInArrayById(
                slot.peopleSessionsForSlot,
                session._id
              );
              if (inPeopleSessionsForSlot) {
                slot.peopleSessionsForSlot.push(session);
              }
            }
          }
        });
      });
    });
  },

  /* ====== ITERATIVE DATA REFRESH  ====== */
  clearNoLongerExistingSessions(state, updateData) {
    // Iterate over all calendar slots
    // Check all the slot sessions in user and people sessions
    // If any exist in slot sessions that don't in new updated sessions
    // Remove those sessions from the calendar
    let slots = updateData.slots;
    let updatedSessions = updateData.updatedSessions;

    for (var i = state.allUserSessions - 1; i > -1; i--) {
      let userSession = state.allUserSessions[i];
      let found = checkIfInArrayById(updatedSessions, userSession._id);

      if (!found) {
        state.allUserSessions.splice(i, 1);
      }
    }

    slots.forEach((slot) => {
      let userSessionsForSlot = slot.userSessionsForSlot;
      let peopleSessionsForSlot = slot.peopleSessionsForSlot;

      for (var i = userSessionsForSlot.length - 1; i > -1; i--) {
        let userSession = userSessionsForSlot[i];
        let found = checkIfInArrayById(updatedSessions, userSession._id);

        if (!found) {
          userSessionsForSlot.splice(i, 1);
        }
      }

      for (var x = peopleSessionsForSlot.length - 1; x > -1; x--) {
        let peopleSession = peopleSessionsForSlot[x];
        let found = checkIfInArrayById(updatedSessions, peopleSession._id);

        if (!found) {
          peopleSessionsForSlot.splice(x, 1);
        }
      }
    });

    state.lastUpdated = new Date();
  },

  addNewSessions(state, updateData) {
    // Iterate over updated sessions data,
    // And iterate over slots
    // If any updated sessions not in the calendar
    // (for their respective time), then push to calendar
    let slots = updateData.slots;
    let updatedSessions = updateData.updatedSessions;
    let userId = updateData.userId;

    // Must also add to user sessions in case of being on another tab
    for (var i = 0; i < updatedSessions.length; i++) {
      let partnerCompare =
        updatedSessions[i].firstPartnerId == userId ||
        updatedSessions[i].secondPartnerId == userId;

      let inAll = checkIfInArrayById(
        state.allUserSessions,
        updatedSessions[i]._id
      );
      if (!inAll && partnerCompare) {
        state.allUserSessions.push(updatedSessions[i]);
      }
    }

    slots.forEach((slot) => {
      let userSessionsForSlot = slot.userSessionsForSlot;
      let peopleSessionsForSlot = slot.peopleSessionsForSlot;
      let slotTimeInMS = new Date(slot.dateTime).valueOf();

      for (var i = 0; i < updatedSessions.length; i++) {
        let updatedSession = updatedSessions[i];
        let sessionId = updatedSession._id;
        let sessionTimeInMS = new Date(updatedSession.dateTime).valueOf();

        if (slotTimeInMS == sessionTimeInMS) {
          let partnerCompare =
            updatedSession.firstPartnerId == userId ||
            updatedSession.secondPartnerId == userId;

          let inUser = checkIfInArrayById(userSessionsForSlot, sessionId);
          if (!inUser && partnerCompare) {
            userSessionsForSlot.push(updatedSession);
          }

          let inPeople = checkIfInArrayById(peopleSessionsForSlot, sessionId);
          if (!inPeople && !partnerCompare) {
            peopleSessionsForSlot.push(updatedSession);
          }
        }
      }
    });

    state.lastUpdated = new Date();
  },

  /* ====== SLOT SELECTION STATE CHANGING  ====== */
  selectSlot(state, slotData) {
    state.selectedToBook.push(slotData);
  },

  cancelSlot(state, slotData) {
    let index = state.selectedToBook.findIndex(
      (slot) => slot.dateTime.valueOf() === slotData.dateTime.valueOf()
    );

    state.selectedToBook.splice(index, 1);
  },

  clearAllSelections(state) {
    state.selectedToBook = [];
  },

  removeSelectionsInThePast(state) {
    for (var i = state.selectedToBook.length - 1; i > -1; i--) {
      let slotData = state.selectedToBook[i];
      let slotStartTimeInMS = new Date(slotData.dateTime).valueOf();
      if (Date.now() > slotStartTimeInMS) {
        state.selectedToBook.splice(i, 1);
      }
    }
  },

  /* ====== SLOT AVAILABILITY STATE CHANGING  ====== */
  updateCalendarSlotAvailability(state, updateData) {
    console.log("@calendar.js: Update slot availability.", updateData);
    // Could create some algorithm to determine last affected session
    // and then instead of always iterating through all calendar slots
    // breaking the loop if latest session in array has been checked
    // as the latest session would create a max-range to loop through
    let type = updateData.updateType;

    let array = [];

    array = state[updateData.array];

    // console.log("array", array);
    // console.log("type", type);

    if (array.length) {
      const FIFTEEN_MINUTES = 900000; // milliseconds

      state.calendarData.forEach((hourRow) => {
        hourRow.hourRowDays.forEach((slot) => {
          const slotStartTime = slot.dateTime;
          const slotStartInMS = slotStartTime.valueOf();

          let newState = true;

          for (let i = 0; i < array.length; i++) {
            // Session or selection start time
            let startTime = new Date(array[i].dateTime);
            let startTimeInMS = startTime.valueOf();

            const fifteenBefore = slotStartInMS - FIFTEEN_MINUTES;
            const thirtyBefore = slotStartInMS - FIFTEEN_MINUTES * 2;
            const fortyFiveBefore = slotStartInMS - FIFTEEN_MINUTES * 3;

            const fifteenAfter = slotStartInMS + FIFTEEN_MINUTES;
            const thirtyAfter = slotStartInMS + FIFTEEN_MINUTES * 2;
            const fortyFiveAfter = slotStartInMS + FIFTEEN_MINUTES * 3;

            if (
              startTimeInMS == fifteenBefore ||
              startTimeInMS == thirtyBefore ||
              startTimeInMS == fortyFiveBefore ||
              startTimeInMS == fifteenAfter ||
              startTimeInMS == thirtyAfter ||
              startTimeInMS == fortyFiveAfter ||
              startTimeInMS == slotStartInMS
            ) {
              // Set availability of bookability or selectability to false
              newState = false;
            }
          }
          slot[type] = newState;
        });
      });
    } else if (!array.length) {
      state.calendarData.forEach((hourRow) => {
        hourRow.hourRowDays.forEach((slot) => {
          slot[type] = true;
        });
      });
    }
  },

  updateCalendarCurrentSessionSlot(state, session) {
    console.log("I AM HERE. AS I SHOULD BE. SO PROBLEM IS WITH ME.");
    let sessionStartInMS = new Date(session.dateTime).valueOf();
    let FIFTEEN_MINUTES = 900000; // milliseconds

    state.calendarData.forEach((hourRow) => {
      hourRow.hourRowDays.forEach((slot) => {
        let slotStartInMS = new Date(slot.dateTime).valueOf();

        let fifteenBefore = slotStartInMS - FIFTEEN_MINUTES;
        let thirtyBefore = slotStartInMS - FIFTEEN_MINUTES * 2;
        let fortyFiveBefore = slotStartInMS - FIFTEEN_MINUTES * 3;
        // let fifteenAfter = slotStartInMS + FIFTEEN_MINUTES;

        // Technically, this only calculates current session
        // however currently past hour is decided based on
        // whether 'hasCurrentOrNextSession' is true or not
        // if a particular slot has the 'next' session in the
        // next slot, then it will evaluate wrong for booked
        // sessions.

        if (
          sessionStartInMS == slotStartInMS ||
          sessionStartInMS == fifteenBefore ||
          sessionStartInMS == thirtyBefore ||
          sessionStartInMS == fortyFiveBefore 
        ) {
          slot.hasCurrentOrNextSession = true;
        } else {
          slot.hasCurrentOrNextSession = false;
        }
      });
    });
  },

  // setCalendarPastMatchedSessions(state, sessions) {
  //   // 1. for user sessions
  //   // 2. if past && had matched
  //   // 3. set true && show

  //   // let sessionStartInMS = new Date(session.dateTime).valueOf();
  //   // let FIFTEEN_MINUTES = 900000; // milliseconds

  //   // state.calendarData.forEach((hourRow) => {
  //   //   hourRow.hourRowDays.forEach((slot) => {
  //   //     let slotStartInMS = new Date(slot.dateTime).valueOf();

  //   //     let fifteenBefore = slotStartInMS - FIFTEEN_MINUTES;
  //   //     let thirtyBefore = slotStartInMS - FIFTEEN_MINUTES * 2;
  //   //     let fortyFiveBefore = slotStartInMS - FIFTEEN_MINUTES * 3;

  //   //     if (
  //   //       sessionStartInMS == slotStartInMS ||
  //   //       sessionStartInMS == fifteenBefore ||
  //   //       sessionStartInMS == thirtyBefore ||
  //   //       sessionStartInMS == fortyFiveBefore
  //   //     ) {
  //   //       slot.hasPastMatchedSession = true;
  //   //     } else {
  //   //       slot.hasPastMatchedSession = false;
  //   //     }
  //   //   });
  //   // });
  // },

  /* ====== ADDING SESSIONS TO DATA  ====== */

  pushManyCalendarSessions(state, updateData) {
    let userId = updateData.userId;
    updateData.sessions.forEach((session) => {
      state.calendarData.forEach((hourRow) => {
        hourRow.hourRowDays.forEach((slot) => {
          let sessionDateTime = new Date(session.dateTime);
          let sessionId = session._id;
          if (slot.dateTime.valueOf() == sessionDateTime.valueOf()) {
            if (isUserEitherPartnerInSession(session, userId)) {
              let inUserSessionsForSlot = checkIfInArrayById(
                slot.userSessionsForSlot,
                sessionId
              );
              if (!inUserSessionsForSlot) {
                slot.userSessionsForSlot.push(session);
              }

              let inAllUserSessions = checkIfInArrayById(
                state.allUserSessions,
                sessionId
              );
              if (!inAllUserSessions) {
                state.allUserSessions.push(session);
              }

              // Covers the case in case this was initially an unmatched people session
              for (let i = 0; i < slot.peopleSessionsForSlot.length; i++) {
                if (slot.peopleSessionsForSlot[i]._id == session._id) {
                  slot.peopleSessionsForSlot.splice(i, 1);
                  break;
                }
              }
            } else {
              let inPeopleSessionsForSlot = checkIfInArrayById(
                slot.peopleSessionsForSlot,
                sessionId
              );
              if (!inPeopleSessionsForSlot) {
                slot.peopleSessionsForSlot.push(session);
              }
            }
          }
        });
      });
    });
  },

  pushOneCalendarSession(state, pushData) {
    let userId = pushData.userId;
    let session = pushData.session;
    let sessionId = pushData.session._id;
    state.calendarData.forEach((hourRow) => {
      hourRow.hourRowDays.forEach((slot) => {
        let sessionDateTime = new Date(session.dateTime);
        if (slot.dateTime.valueOf() == sessionDateTime.valueOf()) {
          if (isUserEitherPartnerInSession(session, userId)) {
            let inUserSessionsForSlot = checkIfInArrayById(
              slot.userSessionsForSlot,
              sessionId
            );
            if (!inUserSessionsForSlot) {
              slot.userSessionsForSlot.push(session);
            }

            let inAllUserSessions = checkIfInArrayById(
              state.allUserSessions,
              sessionId
            );
            if (!inAllUserSessions) {
              state.allUserSessions.push(session);
            }

            // Covers the case in case this was initially an unmatched people session
            for (let i = 0; i < slot.peopleSessionsForSlot.length; i++) {
              if (slot.peopleSessionsForSlot[i]._id == session._id) {
                slot.peopleSessionsForSlot.splice(i, 1);
                break;
              }
            }
          } else {
            let inPeopleSessionsForSlot = checkIfInArrayById(
              slot.peopleSessionsForSlot,
              sessionId
            );
            if (!inPeopleSessionsForSlot) {
              slot.peopleSessionsForSlot.push(session);
            }
          }
        }
      });
    });
  },

  pushSessionToUserSessionsForSlot(state, pushData) {
    let [hourRowIndex, slotIndex] = pushData.indexes;
    let slot = state.calendarData[hourRowIndex].hourRowDays[slotIndex];
    slot.userSessionsForSlot.push(pushData.session);
  },

  pushSessionToAllUserSessions(state, session) {
    let inAllUserSessions = checkIfInArrayById(
      state.allUserSessions,
      session._id
    );
    if (!inAllUserSessions) {
      state.allUserSessions.push(session);
    }
  },

  pushSessionToPeopleSessionsForSlot(state, pushData) {
    let [hourRowIndex, slotIndex] = pushData.indexes;
    let slot = state.calendarData[hourRowIndex].hourRowDays[slotIndex];
    slot.peopleSessionsForSlot.push(pushData.session);
  },

  /* ====== ADD TO CALENDAR AFTER BOOKING ====== */
  pushInfoToCalendarAfterBooking(state, pushInfo) {
    pushInfo.forEach((pushObject) => {
      let [hourRowIndex, slotIndex] = pushObject.indexes;
      let slot = state.calendarData[hourRowIndex].hourRowDays[slotIndex];
      let session = pushObject.session;
      let pushConfig = pushObject.pushConfig;

      for (var config in pushConfig) {
        if (pushConfig[config] == true) {
          if (config in state) {
            state[config].push(session);
          }

          if (config in slot) {
            slot[config].push(session);
          }
        }
      }
    });
  },

  /* ====== ADD OR REMOVE FROM CALENDAR AFTER CANCEL ====== */
  pushInfoToCalendarAfterCancel(state, pushInfo) {
    let session = pushInfo.session;
    console.log("LET US PUSH!", session);

    let breakLoop = false;
    for (let i = 0; i < state.calendarData.length; i++) {
      let hourRow = state.calendarData[i];
      let hourRowDays = hourRow.hourRowDays;
      for (let x = 0; x < hourRowDays.length; x++) {
        let slot = hourRowDays[x];
        let sessionDateTime = new Date(session.dateTime);
        if (slot.dateTime.valueOf() == sessionDateTime.valueOf()) {
          slot.peopleSessionsForSlot.push(session);
          breakLoop = true;
          break;
        }
      }
      if (breakLoop) break;
    }
  },

  removeInfoFromCalendarAfterCancel(state, removeInfo) {
    let breakLoop = false;
    for (let i = 0; i < state.calendarData.length; i++) {
      let hourRow = state.calendarData[i];
      let hourRowDays = hourRow.hourRowDays;
      for (let x = 0; x < hourRowDays.length; x++) {
        let slot = hourRowDays[x];
        let sessionDateTime = new Date(removeInfo.sessionDateTime);
        if (slot.dateTime.valueOf() == sessionDateTime.valueOf()) {
          slot.userSessionsForSlot.splice(0, 1);
          breakLoop = true;
          break;
        }
      }
      if (breakLoop) break;
    }

    for (let i = 0; i < state.allUserSessions.length; i++) {
      if (state.allUserSessions[i]._id == removeInfo.sessionId) {
        state.allUserSessions.splice(i, 1);
        break;
      }
    }
  },

  /* ====== UPDATE CALENDAR DATA POST BOOKING OR CANCEL RECEIVE ====== */

  updateCalendarAfterReceive(state, updateData) {
    let userId = updateData.userId;
    let sessions = updateData.sessions;
    sessions.forEach((session) => {
      if (session.session) {
        session = session.session;
      }
      let updatedSession = JSON.parse(JSON.stringify(session)); // session.session???
      let isUserSession = isUserEitherPartnerInSession(session, userId);
      state.calendarData.forEach((hourRow) => {
        hourRow.hourRowDays.forEach((slot) => {
          let sessionDateTime = new Date(updatedSession.dateTime);
          // Find slot that matches datetime
          if (slot.dateTime.valueOf() == sessionDateTime.valueOf()) {
            // Remove any from existing sessions that exist in new
            // Since it can only find one, the for loop index remove
            // will work to splice & remove without worrying about
            // messing up the indexes,

            for (var i = slot.userSessionsForSlot.length - 1; i > -1; i--) {
              let userSession = slot.userSessionsForSlot[i];
              if (userSession._id == updatedSession._id) {
                slot.userSessionsForSlot.splice(i, 1);
                break;
              }
            }

            if (isUserSession) {
              slot.userSessionsForSlot.push(updatedSession);
            }

            for (var x = slot.peopleSessionsForSlot.length - 1; x > -1; x--) {
              let peopleSession = slot.peopleSessionsForSlot[x];
              if (peopleSession._id == updatedSession._id) {
                slot.peopleSessionsForSlot.splice(x, 1);
                break;
              }
            }

            if (!isUserSession) {
              slot.peopleSessionsForSlot.push(updatedSession);
            }
          }
        });
      });

      for (let i = 0; i < state.allUserSessions.length; i++) {
        if (state.allUserSessions[i]._id == session._id) {
          state.allUserSessions.splice(i, 1);
          break;
        }
      }

      if (isUserSession) {
        state.allUserSessions.push(session);
      }
    });
  },

  updateSessionWithNewValues(state, sessions) {
    let oldSession = sessions.oldSession;
    let updatedSession = sessions.updatedSession;

    state.fieldsToUpdate.forEach((field) => {
      // If new session data has value && old data has value
      if (updatedSession[field] && oldSession[field]) {
        // If they do not match, replace old value with new value
        if (oldSession[field] !== updatedSession[field]) {
          // oldSession[field] = updatedSession[field];
          Vue.set(oldSession, field, updatedSession[field]);
        }
        // If new data has value, but old data does not, set new data to old session
      } else if (updatedSession[field] && !oldSession[field]) {
        // oldSession[field] = updatedSession[field];
        Vue.set(oldSession, field, updatedSession[field]);
        // If new data lacks value, but old data has value, clear value of old data
      } else if (!updatedSession[field] && oldSession[field]) {
        // oldSession[field] = null;
        Vue.set(oldSession, field, null);
      }
    });
  },

  updateManySessionsWithNewValues(state, sessions) {
    sessions.forEach((sessionData) => {
      let oldSession = sessionData.oldSession;
      let updatedSession = sessionData.updatedSession;
      // Fields with no nested properties, else this iteration won't work

      state.fieldsToUpdate.forEach((field) => {
        // If new session data has value && old data has value
        if (updatedSession[field] && oldSession[field]) {
          // If they do not match, replace old value with new value
          if (oldSession[field] !== updatedSession[field]) {
            // oldSession[field] = updatedSession[field];
            Vue.set(oldSession, field, updatedSession[field]);
          }
          // If new data has value, but old data does not, set new data to old session
        } else if (updatedSession[field] && !oldSession[field]) {
          // oldSession[field] = updatedSession[field];
          Vue.set(oldSession, field, updatedSession[field]);
          // If new data lacks value, but old data has value, clear value of old data
        } else if (!updatedSession[field] && oldSession[field]) {
          // oldSession[field] = null;
          Vue.set(oldSession, field, null);
        }
      });
    });
  },

  pushNewPeopleSession(state, pushObject) {
    let [hourRowIndex, slotIndex] = pushObject.indexes;
    let slot = state.calendarData[hourRowIndex].hourRowDays[slotIndex];
    slot.peopleSessionsForSlot.push(pushObject.session);
  },

  /* ====== CHANGE CALENDAR SLOT STATES  ====== */

  /* Update calendar data slot(s) selected state */
  updateCalendarSelectedSlots(state, slotUpdateData) {
    let field = slotUpdateData.field;
    let targetSlot = slotUpdateData.targetSlot;
    let newSlotState = slotUpdateData.newSlotState;

    if (field == 0) {
      field = "isSelected";
    } else if (field == 1) {
      field = "isCanceling";
    }

    state.calendarData.forEach((hourRow) => {
      if (hourRow.slotStartTime == targetSlot.slotStartTime) {
        hourRow.hourRowDays.forEach((slot) => {
          let targetSlotTime = new Date(targetSlot.dateTime);
          if (slotUpdateData.all) {
            slot[field] = newSlotState;
          } else if (slot.dateTime.valueOf() == targetSlotTime.valueOf()) {
            slot[field] = newSlotState;
          }
        });
      }
    });
  },
};

const actions = {
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

  toggleWeekOrDay(state) {
    state.commit("toggleWeekOrDay");
  },

  setRowNumberForWeekOrDay(state, number) {
    state.commit("setRowNumberForWeekOrDay", number);
  },

  selectSlot(state, slotData) {
    state.commit("selectSlot", slotData);
  },

  cancelSlot(state, slotData) {
    state.commit("cancelSlot", slotData);
  },

  clearAllSelections(state) {
    state.commit("clearAllSelections");
  },

  /* ====== SLOT AVAILABILITY STATE CHANGING  ====== */
  updateCalendarSlotAvailability(state, updateType) {
    console.log("@calendar.js: Update slot availability.");
    let array = "allUserSessions";
    if (updateType == 0) {
      updateType = "isAvailableForBooking";
    } else if (updateType == 1) {
      updateType = "isAvailableForSelecting";
      array = "selectedToBook";
    }

    let updateData = {
      array: array,
      updateType: updateType,
    };

    state.commit("updateCalendarSlotAvailability", updateData);
  },

  updateCalendarCurrentSessionSlot(state, sessionData) {
    state.commit("updateCalendarCurrentSessionSlot", sessionData);
  },

  hardRefreshCalendarSessions(state, data) {
    state.commit("hardRefreshCalendarSessions", data);
  },

  /* ====== ITERATIVE DATA REFRESH -- ONLY UPDATE CHANGES  ====== */
  iterativeRefreshCalendarSessions(state, data) {
    /* ====== Collect data to update  ====== */
    let slots = [];
    state.state.calendarData.forEach((hourRow) => {
      hourRow.hourRowDays.forEach((slot) => {
        slots.push(slot);
      });
    });

    let updatedSessions = data.updatedSessions;
    let userId = data.userId;

    /* ====== Perform updates with collected data ====== */
    let updateData = { slots, updatedSessions, userId };
    /* ====== Clear non-existing sessions  ====== */
    state.commit("clearNoLongerExistingSessions", updateData);

    /* ====== Change updated sessions  ====== */
    state.dispatch("updateSessionsWithLatestData", updateData);

    /* ====== Add new sessions (must be done last)  ====== */
    state.commit("addNewSessions", updateData);
  },

  updateSessionsWithLatestData(state, updateData) {
    // Find all slot sessions with existing new session match
    // push into array of sessions to update
    // then update each individually where needed
    let slots = updateData.slots;
    let updatedSessions = updateData.updatedSessions;
    let userId = updateData.userId;

    let sessions = [];
    slots.forEach((slot) => {
      let userSessionsForSlot = slot.userSessionsForSlot;
      let peopleSessionsForSlot = slot.peopleSessionsForSlot;
      let slotTimeInMS = new Date(slot.dateTime).valueOf();

      updatedSessions.forEach((updatedSession) => {
        let sessionTimeInMS = new Date(updatedSession.dateTime).valueOf();
        let partnerCompare =
          updatedSession.firstPartnerId == userId ||
          updatedSession.secondPartnerId == userId;

        for (let i = 0; i < state.state.allUserSessions.length; i++) {
          if (state.state.allUserSessions[i]._id == updatedSession._id) {
            if (partnerCompare) {
              let updateObject = {
                oldSession: state.state.allUserSessions[i],
                updatedSession,
              };
              sessions.push(updateObject);
            }
            break;
          }
        }

        if (slotTimeInMS == sessionTimeInMS) {
          for (let i = 0; i < userSessionsForSlot.length; i++) {
            if (userSessionsForSlot[i]._id == updatedSession._id) {
              if (partnerCompare) {
                let updateObject = {
                  oldSession: userSessionsForSlot[i],
                  updatedSession,
                };
                sessions.push(updateObject);
              }
              break;
            }
          }

          for (let i = 0; i < peopleSessionsForSlot.length; i++) {
            if (peopleSessionsForSlot[i]._id == updatedSession._id) {
              if (!partnerCompare) {
                let updateObject = {
                  oldSession: peopleSessionsForSlot[i],
                  updatedSession,
                };
                sessions.push(updateObject);
              }
              break;
            }
          }
        }
      });
    });

    state.commit("updateManySessionsWithNewValues", sessions);
  },

  updateCalendarSessionsPostPushReceive(state, pushData) {
    state.commit("updateCalendarSessionsPostPushReceive", pushData);
  },

  updateSessionWithNewValues(state, sessions) {
    state.commit("updateSessionWithNewValues", sessions);
  },

  updateManySessionsWithNewValues(state, sessions) {
    state.commit("updateManySessionsWithNewValues", sessions);
  },

  pushManyCalendarSessions(state, updateData) {
    state.commit("pushManyCalendarSessions", updateData);
  },

  pushOneCalendarSession(state, pushData) {
    state.commit("pushOneCalendarSession", pushData);
  },

  updateCalendarSelectedSlots(state, slotUpdateData) {
    state.commit("updateCalendarSelectedSlots", slotUpdateData);
  },

  pushInfoToCalendarAfterCancel(state, pushInfo) {
    state.commit("pushInfoToCalendarAfterCancel", pushInfo);
  },

  removeInfoFromCalendarAfterCancel(state, removeInfo) {
    state.commit("removeInfoFromCalendarAfterCancel", removeInfo);
  },

  pushInfoToCalendarAfterBooking(state, pushInfo) {
    state.commit("pushInfoToCalendarAfterBooking", pushInfo);
  },

  removeSelectionsInThePast(state) {
    state.commit("removeSelectionsInThePast");
  },

  updateCalendarAfterReceive(state, updateData) {
    state.commit("updateCalendarAfterReceive", updateData);
  },
};

const calendar = {
  namespaced: true,
  state,
  mutations,
  actions,
};

export default calendar;
