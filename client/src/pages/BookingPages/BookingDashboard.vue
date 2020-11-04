<template>
  <div class="cofocus">
    <div class="wrapper">
      <CalendarTimer />
      <div class="calendar-container">
        <div class="calendar">
          <Switcher
            v-if="weekStartDay && weekEndDay && currentWeekStart"
            :weekStartDay="weekStartDay"
            :weekEndDay="weekEndDay"
            :currentWeekStart="currentWeekStart"
            :week="week"
            :currentSelectedDay="currentSelectedDay"
            @toggleDayWeekView="toggleDayWeekView"
            @switchWeek="switchWeek"
            @switchDay="switchDay"
            @setToToday="setToToday"
          />
          <!-- 
          Splitting into two different tables
          based on week / day to maximize
          speed, as otherwise there are a lot of
          if (week) checks
          And this app needs to be the absolute
          fastest. We hate slow apps. With our guts.
          It's not right to give people slow shit.
          Life's too short for a bad app experience.
        -->
          <Table
            v-if="weekDates && weekStartDay && weekEndDay"
            :weekDates="weekDates"
            :weekStartDay="weekStartDay"
            :weekEndDay="weekEndDay"
            :rowNumberForWeekOrDay="rowNumberForWeekOrDay"
            :currentWeekStart="currentWeekStart"
            :calendarData="calendarData"
            :week="week"
            :allSessions="allSessions"
            @select-slot="selectSlot"
            @cancel-slot="cancelSlot"
            @cancel-session="cancelSession"
            @set-canceling="setIsCanceling"
            @exit-canceling="exitIsCanceling"
            @book-slot="setSelectAndBook"
          />
        </div>
        <!-- <div class="sidebar">Random things</div> -->
        <div class="modal">
          <div class="modal-body">
            <div class="selectedToBook">
              <div
                class="sessionToBook"
                v-for="(slot, index) in selectedToBook"
                :key="index"
              >
                <div class="session-header">
                  {{ `${slot.dayNameShort}` }}
                </div>
                <div class="session-header">
                  {{ `${slot.slotStartTime}-${slot.slotEndTime}` }}
                </div>
              </div>
            </div>
            <form>
              <input
                class="booking-input"
                autocomplete="off"
                name="title"
                type="text"
                v-model="selectedSlotName"
                placeholder="Event title"
              /><br />
              <input
                class="booking-input"
                name="date"
                type="date"
                v-model="selectedSlotDateString"
                placeholder="Date"
              /><br />
              <input
                class="booking-input"
                name="start-time"
                type="time"
                v-model="selectedSlotStartTime"
                placeholder="Start time"
              /><br />
              <div class="all-users"></div>
            </form>
            <button
              class="bookSession"
              :class="currentlyBookingSessions ? 'not-allowed' : ''"
              :disabled="currentlyBookingSessions == true"
              @click="isBookMany ? bookManySessions() : bookSession(true)"
            >
              {{ returnBookButtonText }}
            </button>
            <div class="cancelBooking" @click="cancelBooking">Cancel</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
/**
 * 
 * Components to create
 * 1. Calendar
 * 2. CalendarSlot
 
 Most efficient way of rendering calendar and its contents?

1. First pre-render calendar layout based on configuration
2. Then begin displaying sessions based on config
3. CSS based on config, e.g. height of a box
4. Time starts by default either from 12AM Monday OR your specified time slot

No more shitty product experiences.
Enough is enough.
Welcome to Cofocus.

 */

// import SessionCalendar from "./CalendarComponents/SessionCalendar";
import { requestWithAuthentication } from "../../config/api";
import { mapState } from "vuex";

import Switcher from "./CalendarComponents/Switcher";
import Table from "./CalendarComponents/Table";

import {
  addDays,
  endOfDay,
  // getDay,
  setSeconds,
  setMilliseconds,
  startOfISOWeek,
  endOfISOWeek,
  isSameWeek,
  isEqual,
  isBefore,
  format,
  getMinutes,
  getHours,
  setMinutes,
  setHours,
  addMinutes,
} from "date-fns";

export default {
  name: "BookingDashboard",
  data() {
    return {
      databaseSyncTimer: "",
      selectedSlotName: "",
      selectedSlotDateTime: null,
      selectedSlotDateString: null,
      selectedSlotStartTime: null,
      selectedInterval: 60,
      currentlyBookingSessions: false,
      gettingBookedSessions: false,
      gettingBookedSessionsError: false,
      gettingAllBookedSessions: false,
      gettingAllBookedSessionsError: false,
      gettingBookedSessionsForOneDay: false,
      gettingBookedSessionsForOneDayError: false,
      allSessions: [],
      bookedSessions: [],
      bookedPeopleOnTime: [],
      interval: 15,
      minimumTime: "00:00",
      maximumTime: "23:45",
      height: 100,
      calendarData: [],

      weekStartDay: null,
      weekEndDay: null,
      weekDates: null,
      currentWeekStart: startOfISOWeek(new Date()),
      currentSelectedDay: new Date(),
      week: true,
      rowNumberForWeekOrDay: 7,
      // weekdayNum: null,
    };
  },
  computed: {
    ...mapState({
      user: (state) => state.auth.user,
      isAuthenticated: (state) => state.auth.authenticationStatus,
      isVerified: (state) => state.auth.verificationStatus,
      selectedToBook: (state) => state.booking.selectedToBook,
    }),
    returnBookButtonText() {
      let bookText = "";
      if (this.currentlyBookingSessions) {
        bookText = "Booking...";
      } else if (
        !this.currentlyBookingSessions &&
        this.selectedToBook.length > 1
      ) {
        bookText = "Book sessions";
      } else if (
        !this.currentlyBookingSessions &&
        this.selectedToBook.length < 2
      ) {
        bookText = "Book session";
      }
      return bookText;
    },
    isBookMany() {
      let isMany = false;
      console.log("isbookymany");
      if (this.selectedToBook.length > 1) {
        isMany = true;
      }
      console.log("isagani", isMany);
      return isMany;
    },
  },
  components: {
    Switcher,
    Table,
    CalendarTimer: () => import("./CalendarComponents/CalendarTimer"),
  },
  beforeRouteLeave(to, from, next) {
    this.cleanBeforeLeave(true, next);
  },
  async mounted() {
    this.initCalendar();
    this.getCalendarTimes();

    await this.getAllBookedUsersForSpecificWeek();
    this.renderSavedSelectionsIfAny();

    this.$socket.emit("joinCofocusCalendar", "cofocus");
    // this.startReceivingPushedSessions();
    this.startReceivingCanceledSessions();

    let globalThis = this;
    window.onbeforeunload = () => {
      globalThis.cleanBeforeLeave();
    };

    // Sync calendar data with database
    // (make iterative check, to only update if change)
    this.databaseSyncTimer = setInterval(
      this.syncCalendarWithDatabase,
      60 * 1000
    );
    // this.databaseSyncTimer = setInterval(this.syncCalendarWithDatabase, 10000);
  },
  methods: {
    startReceivingPushedSessions() {
      this.sockets.subscribe("receivePushedSessions", (sessions) => {
        sessions.forEach((session) => {
          this.calendarData.forEach((hourRow) => {
            hourRow.hourRowDays.forEach((day) => {
              let sessionDateTime = new Date(session.dateTime);
              if (day.dateTime.valueOf() == sessionDateTime.valueOf()) {
                // later also check if all partners contains userId
                if (session.sessionThroughMatching) {
                  // If through matching, need not update, only change
                  let partnerOne = day.bookedSessionsOnTime[0].firstPartnerId;
                  let partnerTwo = day.bookedSessionsOnTime[0].secondPartnerId;

                  // must check both in case it's a case where someone had canceled who was first partner, though could in backend set any single second partner as first partner
                  if (partnerOne && partnerTwo) {
                    // return if already matched
                    return;
                  } else if (
                    partnerOne &&
                    partnerOne == this.user._id &&
                    !partnerTwo
                  ) {
                    // can set direct without further comparison since rest is handled in server (e.g. making sure second partner is second partner if first is you)
                    let daySession = day.bookedSessionsOnTime[0];

                    this.$set(
                      daySession,
                      "secondPartnerId",
                      session.secondPartnerId
                    );

                    this.$set(
                      daySession,
                      "secondPartnerUsername",
                      session.secondPartnerUsername
                    );
                  } else if (
                    partnerTwo &&
                    partnerTwo == this.user._id &&
                    !partnerOne
                  ) {
                    let daySession = day.bookedSessionsOnTime[0];

                    this.$set(
                      daySession,
                      "firstPartnerId",
                      session.firstPartnerId
                    );

                    this.$set(
                      daySession,
                      "firstPartnerUsername",
                      session.firstPartnerUsername
                    );
                  }
                }
                if (
                  !session.sessionThroughMatching &&
                  (session.firstPartnerId == this.user._id ||
                    session.secondPartnerId == this.user._id)
                ) {
                  this.checkIfAlreadyInArrayElsePush(
                    day.bookedSessionsOnTime,
                    session
                  );
                  this.checkIfAlreadyInArrayElsePush(
                    this.bookedSessions,
                    session
                  );
                  this.checkIfAlreadyInArrayElsePush(this.allSessions, session);
                } else if (!session.sessionThroughMatching) {
                  this.checkIfAlreadyInArrayElsePush(
                    day.bookedPeopleOnTime,
                    session
                  );
                  this.checkIfAlreadyInArrayElsePush(
                    this.bookedPeopleOnTime,
                    session
                  );
                  this.checkIfAlreadyInArrayElsePush(this.allSessions, session);
                }
              }
            });
          });
        });
      });
    },

    startReceivingCanceledSessions() {
      // someone else cancels
      // for the receiver
      // it is either a session with them in bookedSessionsOnTime
      // OR it is a standalone session of someone else

      // therefore, first check is if it affects me
      // then if not, just remove it from the list

      // for everyone else
      // is is going to be someone in bookedPeople who is going to lose one of the matches
      // making ONE person somewhere available
      this.sockets.subscribe("receiveCanceledSessions", (sessions) => {
        console.log("@1: Received canceled sessions.", sessions);
        sessions.forEach((session) => {
          console.log("@2: Begin iterating canceled sessions.", session);
          this.calendarData.forEach((hourRow) => {
            console.log("@3: Iterate calendarData hours.", hourRow);
            hourRow.hourRowDays.forEach((day) => {
              console.log("@4 Iterate Calendar hour days for the week.", day);
              let sessionDateTime = new Date(session.sessionDateTime);
              console.log("@5 Show session dateTime", sessionDateTime);
              console.log("@6 Show day datetime", day.dateTime);
              console.log(
                "@7 Show valueOf session datetime",
                sessionDateTime.valueOf()
              );
              console.log("@8 Show day datetime", day.dateTime.valueOf());
              if (day.dateTime.valueOf() == sessionDateTime.valueOf()) {
                console.log(
                  "@9 Correct session found! Day matched session datetime"
                );
                if (!session.sessionIsMatchlessAndToBeDeleted) {
                  console.log(
                    "@10 If session.sessionIsMatchlessAndToBeDeleted == false"
                  );
                  // If one of user's sessions (e.g. was matched before), update with new
                  // Check if canceled sessions affects me / is one of my sessions (e.g. receiver's)
                  this.checkIfCancelAffectsReceiverAndUpdate(day, session);

                  this.checkIfCancelAffectsOtherSessionsAndUpdate(day, session);
                } else {
                  // if was empty, then remove it from bookedPeople
                  console.log("@10 Session is empty, delete.");
                  day.bookedPeopleOnTime.forEach((personSession, index) => {
                    if (personSession._id == session.sessionId) {
                      day.bookedPeopleOnTime.splice(index, 1);
                    }
                  });
                }
              }
            });
          });
        });
      });
    },

    removeOnePartnerFromSession(calendarSession, userId) {
      console.log(
        "@15 REMOVING ONE PARTNER FROM SESSION!!!",
        userId,
        calendarSession
      );
      console.log(
        "Let's make this session somehow visible now for receiver!!!"
      );
      if (calendarSession.firstPartnerId == userId) {
        if (calendarSession.secondPartnerId) {
          this.$set(calendarSession, "secondPartnerId", null);
        }
        if (calendarSession.secondPartnerUsername) {
          this.$set(calendarSession, "secondPartnerUsername", null);
        }
        if (calendarSession.secondPartnerFirstName) {
          this.$set(calendarSession, "secondPartnerFirstName", null);
        }
        if (calendarSession.secondPartnerLastName) {
          this.$set(calendarSession, "secondPartnerLastName", null);
        }
        if (calendarSession.secondPartnerDisplayName) {
          this.$set(calendarSession, "secondPartnerDisplayName", null);
        }
        if (calendarSession.secondPartnerProfileImageUrl) {
          this.$set(calendarSession, "secondPartnerProfileImageUrl", null);
        }
        if (calendarSession.secondPartnerSessionCustomTitle) {
          this.$set(calendarSession, "secondPartnerSessionCustomTitle", null);
        }
        if (calendarSession.sessionIsMatched) {
          this.$set(calendarSession, "sessionIsMatched", false);
        }
        if (calendarSession.sessionThroughMatching) {
          this.$set(calendarSession, "sessionThroughMatching", false);
        }
      } else if (calendarSession.secondPartnerId == userId) {
        if (calendarSession.firstPartnerId) {
          this.$set(calendarSession, "firstPartnerId", null);
        }
        if (calendarSession.firstPartnerUsername) {
          this.$set(calendarSession, "firstPartnerUsername", null);
        }
        if (calendarSession.firstPartnerFirstName) {
          this.$set(calendarSession, "firstPartnerFirstName", null);
        }
        if (calendarSession.firstPartnerLastName) {
          this.$set(calendarSession, "firstPartnerLastName", null);
        }
        if (calendarSession.firstPartnerDisplayName) {
          this.$set(calendarSession, "firstPartnerDisplayName", null);
        }
        if (calendarSession.firstPartnerProfileImageUrl) {
          this.$set(calendarSession, "firstPartnerProfileImageUrl", null);
        }
        if (calendarSession.firstPartnerSessionCustomTitle) {
          this.$set(calendarSession, "firstPartnerSessionCustomTitle", null);
        }
        if (calendarSession.sessionIsMatched) {
          this.$set(calendarSession, "sessionIsMatched", false);
        }
        if (calendarSession.sessionThroughMatching) {
          this.$set(calendarSession, "sessionThroughMatching", false);
        }
      }
    },

    checkIfCancelAffectsReceiverAndUpdate(day, session) {
      day.bookedSessionsOnTime.forEach((calendarSession) => {
        console.log(
          "@11 Iterate over the day's bookedSessionsOnTime, get calendar session",
          calendarSession
        );
        if (calendarSession._id == session.sessionId) {
          console.log("@12 Calendar session id matched session id!");
          if (
            calendarSession.firstPartnerId &&
            calendarSession.secondPartnerId
          ) {
            console.log(
              "@13 Both partners exist still!!! Let's remove one, since we're canceling."
            );
            if (
              calendarSession.firstPartnerId == this.user._id ||
              calendarSession.secondPartnerId == this.user._id
            ) {
              console.log(
                "@14 Okay! One of those users is me!!!",
                calendarSession
              );
              console.log("Removing the user that is not me, that canceled.");
              this.removeOnePartnerFromSession(calendarSession, this.user._id);
            }
          }
        }
      });
    },

    checkIfCancelAffectsOtherSessionsAndUpdate(day, session) {
      day.bookedPeopleOnTime.forEach((calendarSession) => {
        console.log(
          "@11 Iterate over the day's bookedPeopleOnTime, get calendar session",
          calendarSession
        );
        if (calendarSession._id == session.sessionId) {
          console.log("@12 Calendar session id matched session id!");
          if (
            calendarSession.firstPartnerId &&
            calendarSession.secondPartnerId
          ) {
            console.log(
              "@13 Both partners exist still!!! Let's remove one, since we're canceling."
            );
            if (
              calendarSession.firstPartnerId == session.cancelerId ||
              calendarSession.secondPartnerId == session.cancelerId
            ) {
              console.log(
                "@14 Okay! One of those users is me!!!",
                calendarSession
              );
              console.log("Removing the user that is not me, that canceled.");
              this.removeOnePartnerFromSession(
                calendarSession,
                session.cancelerId
              );
            }
          }
        }
      });
    },

    // Two questions:
    // What are the general session holders in vue data for?

    // Conditions:
    // Matched session must be available
    // to the user to do update for

    // Step 1 is to determine where the session is
    // --> then it should! be easy to update the data

    // This matched session must be found
    // when a signal has come and is iterating
    // to remove one of the partners

    // This signal must come through

    cleanBeforeLeave(fromBeforeLeave = false, next = null) {
      this.sockets.unsubscribe("receivePushedSessions");
      this.sockets.unsubscribe("receiveCanceledSessions");

      // this.resetData();
      clearInterval(this.databaseSyncTimer);
      if (fromBeforeLeave && next !== null) {
        next();
      }
    },
    async getUserBookedSessionsForThisWeek() {
      try {
        if (!this.user || !this.user._id) {
          return (window.location.href = "/");
        }
        this.gettingBookedSessions = true;

        let userData = {
          userId: this.user._id,
        };

        const response = await requestWithAuthentication(
          `post`,
          "/api/booking/getUserBookedSessionsForThisWeek",
          userData
        );

        let bookedSessions = response.data.result;
        if (!bookedSessions) throw new Error("Failed to fetch user sessions.");

        console.log("sessions", bookedSessions);

        if (response.data.success) {
          this.gettingBookedSessions = false;

          bookedSessions.forEach((session) => {
            this.updateCalendarSessions(session);
          });

          // add rooms to vuex or local storage to display them in order of creation or in the order of chosen preference;
          // then display the rooms
        }
      } catch (error) {
        console.log("@gettingBookedSessions Error: ", error);
        this.gettingBookedSessions = false;
        this.gettingBookedSessionsError = true;
      }
    },
    async getAllBookedUsersForSpecificWeek(refresh = false) {
      // Get everyone's booked sessions for this week from this time forward (no past sessions)
      try {
        if (!this.user || !this.user._id) {
          return (window.location.href = "/");
        }
        this.gettingAllBookedSessions = true;

        let endOfWeekDate = new Date(this.currentWeekStart.valueOf());
        endOfWeekDate = endOfISOWeek(endOfWeekDate);

        let weekData = {
          endOfWeekDate: endOfWeekDate,
        };

        const response = await requestWithAuthentication(
          `post`,
          "/api/booking/getAllBookedUsersForSpecificWeek",
          weekData
        );

        let allBookedSessions = response.data.result;
        if (!allBookedSessions)
          throw new Error("Failed to fetch general sessions.");

        console.log("sessionsALLBOOKEDPEOPLE", allBookedSessions);

        if (response.data.success) {
          this.gettingAllBookedSessions = false;

          if (refresh) {
            // this.bookedSessions = [];
            // this.bookedPeopleOnTime = [];
            // allBookedSessions.forEach((session) => {
            //   this.hardRefreshCalendarSessions(session);
            // });
            this.iterativeRefreshCalendarSessions(allBookedSessions);
          } else {
            allBookedSessions.forEach((session) => {
              this.updateCalendarSessions(session);
            });
          }

          this.updateCalendarSlotAvailability();

          // add rooms to vuex or local storage to display them in order of creation or in the order of chosen preference;
          // then display the rooms
        }
      } catch (error) {
        console.log("@gettingBookedSessions Error: ", error);
        this.gettingBookedSessions = false;
        this.gettingBookedSessionsError = true;
      }
    },

    // updateAvailableCalendarSlots(sessions) {
    //   sessions.forEach((session) => {
    //     updateCalendarSlotAvailability(session);
    //   });
    // },

    updateCalendarSlotAvailability(session = null) {
      this.calendarData.forEach((hourRow) => {
        hourRow.hourRowDays.forEach((slot) => {
          if (session) {
            // update only single slot matching the time of the session
            let sessionStartTime = new Date(session.dateTime);
            if (slot.dateTime.valueOf() == sessionStartTime.valueOf()) {
              this.checkIfSlotBookedOrNearbyBooked(slot);
            }
          } else {
            // update all slots
            this.checkIfSlotBookedOrNearbyBooked(slot);
          }
        });
      });
    },

    // goal: update all slots availability / update single slot availability
    // if single, then find slot which matches session start time

    checkIfSlotBookedOrNearbyBooked(slot) {
      const slotStartTime = slot.dateTime;
      const slotStartInMS = slotStartTime.valueOf();

      const FIFTEEN_MINUTES = 900000; // milliseconds

      const fifteenBefore = slotStartInMS - FIFTEEN_MINUTES;
      const thirtyBefore = slotStartInMS - FIFTEEN_MINUTES * 2;
      const fortyFiveBefore = slotStartInMS - FIFTEEN_MINUTES * 3;

      const fifteenAfter = slotStartInMS + FIFTEEN_MINUTES;
      const thirtyAfter = slotStartInMS + FIFTEEN_MINUTES * 2;
      const fortyFiveAfter = slotStartInMS + FIFTEEN_MINUTES * 3;

      for (let i = 0; i < this.bookedSessions.length; i++) {
        let sessionStartTime = new Date(this.bookedSessions[i].dateTime);
        let sessionStartInMS = sessionStartTime.valueOf();

        if (
          sessionStartInMS == fifteenBefore ||
          sessionStartInMS == thirtyBefore ||
          sessionStartInMS == fortyFiveBefore ||
          sessionStartInMS == fifteenAfter ||
          sessionStartInMS == thirtyAfter ||
          sessionStartInMS == fortyFiveAfter ||
          sessionStartInMS == slotStartInMS
        ) {
          this.$set(slot, "isAvailableForBooking", false);
          return;
        }
      }
      this.$set(slot, "isAvailableForBooking", true);
      return;
    },

    async getBookedSessionsForOneDay(refresh = false) {
      // Get everyone's booked sessions for this day from this time forward (no past sessions) until the end of this particular day
      // Return in two lists, load in one go?
      try {
        if (!this.user || !this.user._id) {
          return (window.location.href = "/");
        }
        this.gettingBookedSessionsForOneDay = true;

        let dayData = {
          endOfDay: endOfDay(this.currentSelectedDay),
        };

        const response = await requestWithAuthentication(
          `post`,
          "/api/booking/getBookedSessionsForOneDay",
          dayData
        );

        let allBookedSessions = response.data.result;
        if (!allBookedSessions)
          throw new Error("Failed to fetch general sessions.");

        console.log("sessionsALLBOOKEDPEOPLE day", allBookedSessions);

        if (response.data.success) {
          this.gettingBookedSessionsForOneDay = false;

          if (refresh) {
            // this.bookedSessions = [];
            // this.bookedPeopleOnTime = [];
            // allBookedSessions.forEach((session) => {
            //   this.hardRefreshCalendarSessions(session);
            // });
            this.iterativeRefreshCalendarSessions(allBookedSessions);
          } else {
            allBookedSessions.forEach((session) => {
              this.updateCalendarSessions(session);
            });
          }

          this.updateCalendarSlotAvailability();

          // add rooms to vuex or local storage to display them in order of creation or in the order of chosen preference;
          // then display the rooms
        }
      } catch (error) {
        console.log("@gettingAllBookedSessionsForOneDay Error: ", error);
        this.gettingBookedSessionsForOneDay = false;
        this.gettingBookedSessionsForOneDayError = true;
      }
    },

    async cancelSession(slotData) {
      let errors = {};
      let slot = slotData["bookedSessionsOnTime"][0];
      let sessionId = slot._id;
      try {
        let sendData = {
          userId: this.user._id,
          sessionId: sessionId,
        };
        console.log("CANCEL STUFF??", sendData);
        const response = await requestWithAuthentication(
          `post`,
          `api/booking/cancelSession`,
          sendData
        );
        console.log("response from canceled", response);
        let session = response.data.result;
        if (!session) {
          errors.FailedToCancelSession = true;
          throw { errors: errors };
        }

        if (response.data.success) {
          // For cancel receiver to quickly filter to the right session
          this.exitIsCanceling(slotData);
          let sessionIsMatchlessAndToBeDeleted = false;
          let sessionDateTime = slot.dateTime;

          // Session still exists, one partner has canceled &&
          // has not yet been rematched && is unmatched && available
          // needs removing one partner from local data copy
          if (
            response.data.result._id &&
            response.data.result._id == sessionId
          ) {
            console.log(
              "Someone has canceled and an unmatched session is available."
            );
            this.updateCalendarAfterCancel(
              sessionId,
              sessionDateTime,
              response.data.result
            );
          }
          // Session had no match and has been deleted, remove from calendar completely
          else if (response.data.result == 1) {
            sessionIsMatchlessAndToBeDeleted = true;
            console.log("Someone has canceled, deleting session.");
            this.updateCalendarAfterCancel(sessionId, sessionDateTime);
          }

          // Pack cancelerId with updateCanceledSession;
          let updateCanceledSession = {
            sessionId: sessionId,
            sessionDateTime: sessionDateTime,
            cancelerId: this.user._id,
          };

          if (sessionIsMatchlessAndToBeDeleted) {
            console.log(
              "Session is matchlesss and packing that with send to all data."
            );
            updateCanceledSession.sessionIsMatchlessAndToBeDeleted = sessionIsMatchlessAndToBeDeleted;
          }

          let sessions = [];
          sessions.push(updateCanceledSession);
          let sessionInfo = {
            userId: this.user._id,
            sessions: sessions,
            roomType: "cofocus",
          };
          console.log("Pushing canceled sessions to others");
          this.$socket.emit("pushCanceledSessionsToOthers", sessionInfo);
        }
      } catch (error) {
        console.log("errorCanceling", error);
      }
    },

    async bookSession(fromSidebarButton = false) {
      let errors = {};
      if (this.currentlyBookingSessions) return;
      // if (this.selectedToBook.length > 1) return;
      if (this.selectedToBook.length < 1) return;
      try {
        this.currentlyBookingSessions = true;
        let sendData = {
          sessionInterval: this.selectedInterval,
          dateTime: this.selectedSlotDateTime,
        };
        sendData.userId = this.user._id;
        sendData.username = this.user.username;
        sendData.firstName = this.user.firstName;
        sendData.lastName = this.user.lastName;
        sendData.displayName = this.user.displayName;
        sendData.profileImageUrl = this.user.profileImageUrl;
        console.log("BOOK STUFF??", sendData);
        const response = await requestWithAuthentication(
          `post`,
          `api/booking/bookSessionSlot`,
          sendData
        );
        console.log("response from boooked", response);
        let session = response.data.result;
        if (!session) {
          errors.FailedToBookSession = true;
          throw { errors: errors };
        }

        if (response.data.success) {
          this.updateCalendarSessions(session);

          // only cancel if comes from button
          if (fromSidebarButton) {
            this.cancelBooking();
          }

          // Prepare data for socket
          // let sessions = [];
          // sessions.push(session);

          // let sessionInfo = {
          //   userId: this.user._id,
          //   sessions: sessions,
          //   roomType: "cofocus",
          // };
          // this.$socket.emit("pushSessionsToOthers", sessionInfo);

          this.currentlyBookingSessions = false;
        }
      } catch (error) {
        console.log("errorBooking", error);
        this.currentlyBookingSessions = false;
      }
    },

    async bookManySessions() {
      let errors = {};
      if (this.currentlyBookingSessions) return;
      // Client-side prevent use of wrong book function if bypassed
      if (this.selectedToBook.length < 2) return;

      try {
        this.currentlyBookingSessions = true;

        let sessionsToBook = [];
        let sessionTimes = [];
        // Prepare selected to book data
        this.selectedToBook.forEach((toBook) => {
          let slotData = {
            sessionInterval: this.selectedInterval,
            dateTime: toBook.dateTime,
          };

          sessionTimes.push(toBook.dateTime);
          sessionsToBook.push(slotData);
        });

        // Could just use userId in the backend to
        // grab the rest of the user's data
        let sendData = {
          slotsToBookArray: sessionsToBook,
          slotsToBookTimesArray: sessionTimes,
          userId: this.user._id,
          username: this.user.username,
          firstName: this.user.firstName,
          lastName: this.user.lastName,
          displayName: this.user.displayName,
          profileImageUrl: this.user.profileImageUrl,
        };

        const response = await requestWithAuthentication(
          `post`,
          `api/booking/bookManySessionSlots`,
          sendData
        );
        let sessions = response.data.result;
        if (!sessions) {
          errors.FailedToBookSession = true;
          throw { errors: errors };
        }

        sessions.forEach((session) => {
          this.updateCalendarSessions(session);
        });

        this.cancelBooking();

        // let sessionsInfo = {
        //   userId: this.user._id,
        //   sessions: sessions,
        //   roomType: "cofocus",
        // };
        // this.$socket.emit("pushSessionsToOthers", sessionsInfo);

        this.currentlyBookingSessions = false;
      } catch (error) {
        console.log("errorBooking", error);
        this.currentlyBookingSessions = false;
      }
    },

    updateCalendarSessions(session) {
      this.calendarData.forEach((hourRow) => {
        hourRow.hourRowDays.forEach((day) => {
          let sessionDateTime = new Date(session.dateTime);
          if (day.dateTime.valueOf() == sessionDateTime.valueOf()) {
            if (
              session.firstPartnerId == this.user._id ||
              session.secondPartnerId == this.user._id
            ) {
              this.checkIfAlreadyInArrayElsePush(
                day.bookedSessionsOnTime,
                session
              );
              this.checkIfAlreadyInArrayElsePush(this.bookedSessions, session);
            } else {
              this.checkIfAlreadyInArrayElsePush(
                day.bookedPeopleOnTime,
                session
              );
              this.checkIfAlreadyInArrayElsePush(
                this.bookedPeopleOnTime,
                session
              );
            }

            this.checkIfAlreadyInArrayElsePush(this.allSessions, session);
          }
        });
      });
    },

    checkIfAlreadyInArrayElsePush(sessionsArray, session) {
      console.log("check if already there", sessionsArray, session);
      let found = false;
      for (let i = 0; i < sessionsArray.length; i++) {
        if (sessionsArray[i]._id == session._id) {
          found = true;
          break;
        }
      }
      if (!found) {
        sessionsArray.push(session);
      }
    },

    // scenario 1: I book an empty session, updates calendar succ
    // scen 2: book existing session in bookedpeople, then must move session
    // but problem is somewhere else, because else refresh would work

    updateCalendarAfterCancel(sessionId, sessionDateTime, session = null) {
      this.calendarData.forEach((hourRow) => {
        hourRow.hourRowDays.forEach((day) => {
          sessionDateTime = new Date(sessionDateTime);
          if (day.dateTime.valueOf() == sessionDateTime.valueOf()) {
            day.bookedSessionsOnTime.forEach((calendarSession, index) => {
              if (calendarSession._id == sessionId) {
                if (
                  calendarSession.firstPartnerId &&
                  calendarSession.secondPartnerId
                ) {
                  if (
                    calendarSession.firstPartnerId == this.user._id ||
                    calendarSession.secondPartnerId == this.user._id
                  ) {
                    // remove from one
                    // push to the other
                    day.bookedSessionsOnTime.splice(index, 1);
                    if (session) {
                      // day.bookedPeopleOnTime.push(session);
                      this.checkIfAlreadyInArrayElsePush(
                        day.bookedPeopleOnTime,
                        session
                      );
                    }
                  }
                } else {
                  // just remove
                  day.bookedSessionsOnTime.splice(index, 1);
                }
              }
            });
            // this.bookedSessions.push(session);
          }
        });
      });
    },

    async syncCalendarWithDatabase() {
      // this.getCalendarTimes();
      if (this.week) {
        await this.getAllBookedUsersForSpecificWeek(true);
      } else {
        await this.getBookedSessionsForOneDay(true);
      }
      this.renderSavedSelectionsIfAny();
    },
    async updateDayViewData() {
      this.getCalendarTimes();
      await this.getBookedSessionsForOneDay();
      this.renderSavedSelectionsIfAny();
    },

    initCalendar() {
      let startOfPeriod = this.currentWeekStart;
      let newStart = new Date(startOfPeriod.valueOf());
      this.getDates(newStart);
    },
    getDates(startOfWeek) {
      const dates = [
        {
          dateNum: format(startOfWeek, "dd"),
          dayName: format(startOfWeek, "eeee"),
          dayNameShort: format(startOfWeek, "eee"),
          monthNameShort: format(startOfWeek, "MMM"),
          monthNum: format(startOfWeek, "MM"),
          yearNum: format(startOfWeek, "yyyy"),
        },
      ];
      for (let i = 1; i < 7; i++) {
        startOfWeek = addDays(startOfWeek, 1);
        dates.push({
          dateNum: format(startOfWeek, "dd"),
          dayName: format(startOfWeek, "eeee"),
          dayNameShort: format(startOfWeek, "eee"),
          monthNameShort: format(startOfWeek, "MMM"),
          monthNum: format(startOfWeek, "MM"),
          yearNum: format(startOfWeek, "yyyy"),
        });
      }
      this.weekDates = dates;
      this.weekStartDay = this.weekDates[0];
      this.weekEndDay = this.weekDates[this.weekDates.length - 1];
    },
    getOneDate() {
      // get current week first day
      // if currentSelectedDay is not of selectedweek
      // select firstDate of the week

      // then use current selected date
      let currentDate = new Date(this.currentSelectedDay.valueOf());
      const date = {
        dateNum: format(currentDate, "dd"),
        dayName: format(currentDate, "eeee"),
        dayNameShort: format(currentDate, "eee"),
        monthNameShort: format(currentDate, "MMM"),
        monthNum: format(currentDate, "MM"),
        yearNum: format(currentDate, "yyyy"),
      };
      this.weekDates = [];
      this.weekDates.push(date);
      this.weekStartDay = this.weekDates[0];
      this.weekEndDay = this.weekDates[0];
    },
    isSameOrBefore(before, after) {
      return isBefore(before, after) || isEqual(before, after);
    },

    setSelectAndBook(slotData) {
      this.selectedSlotDateTime = slotData.dateTime;
      this.selectedSlotStartTime = slotData.slotStartTime;
      this.selectedSlotDateString = `${slotData.yearNum}-${slotData.monthNum}-${slotData.dateNum}`;

      this.bookSession();
      this.cancelSlot(slotData);
    },

    selectSlot(slotData) {
      // console.log("slotData", slotData);

      this.selectedSlotDateTime = slotData.dateTime;
      this.selectedSlotStartTime = slotData.slotStartTime;
      this.selectedSlotDateString = `${slotData.yearNum}-${slotData.monthNum}-${slotData.dateNum}`;

      slotData.isSelected = true;

      this.updateCalendarSelectedSlots(slotData, slotData.isSelected, false, 0);

      slotData = JSON.parse(JSON.stringify(slotData));
      this.$store.dispatch("booking/selectSlot", slotData);
      // later add to array of SELECTED SLOTS
    },

    setIsCanceling(slotData) {
      console.log("YO", slotData);
      slotData.isCanceling = true;

      this.updateCalendarSelectedSlots(
        slotData,
        slotData.isCanceling,
        false,
        1
      );

      slotData = JSON.parse(JSON.stringify(slotData));
      this.$store.dispatch("booking/setIsCanceling", slotData);
      // later add to array of SELECTED SLOTS
    },

    exitIsCanceling(slotData) {
      console.log("slotData", slotData);

      slotData.isCanceling = false;
      this.updateCalendarSelectedSlots(
        slotData,
        slotData.isCanceling,
        false,
        1
      );

      slotData = JSON.parse(JSON.stringify(slotData));
      this.$store.dispatch("booking/exitIsCanceling", slotData);
    },

    // exitAllCanceling() {
    //    this.selectedToBook.forEach((slotData) => {
    //     this.updateCalendarSelectedSlots(slotData, false, true, 0);
    //   });

    //   this.$store.dispatch("booking/clearAllCanceling");
    // },

    /* ====== CHANGE CALENDAR SLOT STATES  ====== */

    /* Clear single selection */
    cancelSlot(slotData) {
      console.log("cancel slot");

      slotData.isSelected = false;
      this.updateCalendarSelectedSlots(slotData, slotData.isSelected, false, 0);

      slotData = JSON.parse(JSON.stringify(slotData));
      this.$store.dispatch("booking/cancelSlot", slotData);
    },

    /* Clear all current selections */
    cancelBooking() {
      this.selectedToBook.forEach((slotData) => {
        this.updateCalendarSelectedSlots(slotData, false, true, 0);
      });

      this.$store.dispatch("booking/clearAllSelections");
    },

    /* Update calendar data slot(s) selected state */
    updateCalendarSelectedSlots(slotData, newSlotState, all = false, field) {
      if (field == 0) {
        field = "isSelected";
      } else if (field == 1) {
        field = "isCanceling";
      }
      this.calendarData.forEach((hourRow) => {
        if (hourRow.slotStartTime == slotData.slotStartTime) {
          hourRow.hourRowDays.forEach((day) => {
            if (all) {
              this.$set(day, field, newSlotState);
            } else if (day.dateTime.valueOf() == slotData.dateTime.valueOf()) {
              this.$set(day, field, newSlotState);
            }
          });
        }
      });
    },

    renderSavedSelectionsIfAny() {
      if (this.selectedToBook.length) {
        this.selectedToBook.forEach((slotData) => {
          this.updateCalendarSelectedSlots(slotData, true, false, 0);
        });
      }
    },

    /* ====== INDIVIDUAL SOCKET UPDATES FOR BOOKINGS & CANCELING  ====== */

    /* ====== DATABASE SYNCING -- HARD REFRESH SWAP OLD DATA WITH NEW ====== */

    hardRefreshCalendarSessions(session) {
      this.calendarData.forEach((hourRow) => {
        hourRow.hourRowDays.forEach((day) => {
          while (day.bookedSessionsOnTime.length > 0) {
            day.bookedSessionsOnTime.pop();
          }

          while (day.bookedPeopleOnTime.length > 0) {
            day.bookedPeopleOnTime.pop();
          }
          this.$nextTick(function () {
            let sessionDateTime = new Date(session.dateTime);
            if (day.dateTime.valueOf() == sessionDateTime.valueOf()) {
              if (
                session.firstPartnerId == this.user._id ||
                session.secondPartnerId == this.user._id
              ) {
                this.checkIfAlreadyInArrayElsePush(
                  day.bookedSessionsOnTime,
                  session
                );
                this.checkIfAlreadyInArrayElsePush(
                  this.bookedSessions,
                  session
                );
              } else {
                this.checkIfAlreadyInArrayElsePush(
                  day.bookedPeopleOnTime,
                  session
                );
                this.checkIfAlreadyInArrayElsePush(
                  this.bookedPeopleOnTime,
                  session
                );
              }

              this.checkIfAlreadyInArrayElsePush(this.allSessions, session);
            }
          });
        });
      });
      this.updateCalendarSlotAvailability();
    },

    /* ====== ITERATIVE DATABASE SYNCING -- ONLY UPDATE CHANGES  ====== */

    iterativeRefreshCalendarSessions(sessions) {
      this.calendarData.forEach((hourRow) => {
        hourRow.hourRowDays.forEach((day) => {
          let bookedSessions = day.bookedSessionsOnTime;
          let bookedPeople = day.bookedPeopleOnTime;

          if (bookedSessions.length) {
            /* ====== Clear non-existing sessions  ====== */
            this.clearNoLongerExistingSessions(bookedSessions, sessions);

            /* ====== Change updated sessions  ====== */
            this.updateSessionsWithLatestData(bookedSessions, sessions);
          }

          /* ====== Add new sessions  ====== */
          // must be last for efficiency
          this.addNewSessions(day, sessions);

          if (bookedPeople.length) {
            /* ====== Clear non-existing sessions  ====== */
            this.clearNoLongerExistingSessions(bookedPeople, sessions);

            /* ====== Change updated sessions  ====== */
            this.updateSessionsWithLatestData(bookedPeople, sessions);
          }
          /* ====== Add new sessions  ====== */
          // must be last for efficiency
          this.addNewSessions(day, sessions, true);
        });
      });
      this.updateCalendarSlotAvailability();
    },

    clearNoLongerExistingSessions(calendarSessions, updatedSessions) {
      // Iterate over calendar sessions,
      // if any not in updatedSessions, remove it
      calendarSessions.forEach((calendarSession, index) => {
        // To save computational time, use for loop which you can break out of
        let found = false;
        for (let i = 0; i < updatedSessions.length; i++) {
          if (updatedSessions[i]._id == calendarSession._id) {
            found = true;
            break;
          }
        }
        if (!found) {
          calendarSessions.splice(index, 1);
        }
      });
    },

    addNewSessions(day, updatedSessions, bookedPeople = false) {
      // Iterate over updated sessions data,
      // if any not in calendar sessions, push to calendar sessions
      let calendarSessions = day.bookedSessionsOnTime;
      if (bookedPeople) {
        calendarSessions = day.bookedPeopleOnTime;
      }
      updatedSessions.forEach((updatedSession) => {
        // To save computational time, use for loop which you can break out of
        let found = false;
        for (let i = 0; i < calendarSessions.length; i++) {
          if (calendarSessions[i]._id == updatedSession._id) {
            found = true;
            break;
          }
        }
        if (!found) {
          if (bookedPeople) {
            if (
              updatedSession.firstPartnerId !== this.user._id &&
              updatedSession.secondPartnerId !== this.user._id &&
              new Date(updatedSession.dateTime).valueOf() ==
                day.dateTime.valueOf()
            ) {
              this.checkIfAlreadyInArrayElsePush(
                calendarSessions,
                updatedSession
              );
            }
          }
        }
      });
    },

    updateSessionsWithLatestData(calendarSessions, updatedSessions) {
      updatedSessions.forEach((updatedSession) => {
        // To save computational time, use for loop which you can break out of
        let found = false;
        let calendarSession = null;
        for (let i = 0; i < calendarSessions.length; i++) {
          if (calendarSessions[i]._id == updatedSession._id) {
            found = true;
            calendarSession = calendarSessions[i];
            break;
          }
        }
        if (found) {
          // Fields with no nested properties, else this iteration won't work
          let fieldsToUpdate = [
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
          ];
          this.updateSessionWithNewValues(
            fieldsToUpdate,
            calendarSession,
            updatedSession
          );
        }
      });
    },

    updateSessionWithNewValues(fieldsToUpdate, oldSession, updatedSession) {
      fieldsToUpdate.forEach((field) => {
        // If new session data has value && old data has value
        if (updatedSession[field] && oldSession[field]) {
          // If they do not match, replace old value with new value
          if (oldSession[field] !== updatedSession[field]) {
            this.$set(oldSession, field, updatedSession[field]);
          }
          // If new data has value, but old data does not, set new data to old session
        } else if (updatedSession[field] && !oldSession[field]) {
          this.$set(oldSession, field, updatedSession[field]);
          // If new data lacks value, but old data has value, clear value of old data
        } else if (!updatedSession[field] && oldSession[field]) {
          this.$set(oldSession, field, null);
        }
      });
    },

    /* ====== CALENDAR RENDERING ====== */

    getCalendarTimes() {
      // Create day end time for comparison in loop
      let dayEndTimeString = this.maximumTime;
      let dayEndHour = dayEndTimeString.split(":")[0];
      let dayEndMin = dayEndTimeString.split(":")[1];
      let dayEndTime = new Date(null, null, null, dayEndHour, dayEndMin);

      // Create slot start hour for hourRowObjects & dayObjects inside hourRowObjects
      let dayStartTimeString = this.minimumTime;
      let slotStartHour = dayStartTimeString.split(":")[0];
      let slotStartMin = dayStartTimeString.split(":")[1];
      let slotStartTime = new Date(
        null,
        null,
        null,
        slotStartHour,
        slotStartMin
      );

      // Create slot end hour for dayObjects to know where block ends
      let slotEndTime = new Date(null, null, null, slotStartHour, slotStartMin);
      // Add session length interval to produce end time from start time
      slotEndTime = addMinutes(slotEndTime, this.interval);

      // Empty calendar
      this.calendarData = [];

      // Iterate over all hours from start time
      // till end time, e.g. until end time is complete.
      // Prepare each hour's row for week or day
      do {
        // Prepare a single hour row object
        // which is to contain the row's hour
        // and an array of days for the week
        // for that specific hour
        let hourRowObject = {
          slotStartTime: format(slotStartTime, "HH:mm"),
          hourRowDays: [],
        };

        let currentWeekOrDayStart = null;
        if (this.week) {
          // New date from current week start
          currentWeekOrDayStart = new Date(this.currentWeekStart.valueOf());
        } else {
          currentWeekOrDayStart = new Date(this.currentSelectedDay.valueOf());
        }

        hourRowObject.hourRowDays = this.populateTimeRowWithDays(
          currentWeekOrDayStart,
          slotStartTime,
          slotEndTime
        );
        this.calendarData.push(hourRowObject);

        // Switch to next hour
        slotStartTime = addMinutes(slotStartTime, this.interval);
        slotEndTime = addMinutes(slotEndTime, this.interval);
      } while (this.isSameOrBefore(slotStartTime, dayEndTime));
    },

    populateTimeRowWithDays(currentWeekOrDayStart, slotStartTime, slotEndTime) {
      let hourRowDays = [];

      if (this.week) {
        // Prepare 7 days for the week view
        for (var i = 0; i < 7; i++) {
          // If first day, don't add day
          if (i !== 0) {
            currentWeekOrDayStart = addDays(currentWeekOrDayStart, 1);
          }

          let dayObject = this.createDayObjectForTimeRow(
            currentWeekOrDayStart,
            slotStartTime,
            slotEndTime
          );

          // Per created day, push to hourRowDays
          hourRowDays.push(dayObject);
        }
      } else {
        // Prepare a single day for the day view
        let dayObject = this.createDayObjectForTimeRow(
          currentWeekOrDayStart,
          slotStartTime,
          slotEndTime
        );
        hourRowDays.push(dayObject);
      }

      return hourRowDays;
    },

    createDayObjectForTimeRow(
      currentWeekOrDayStart,
      slotStartTime,
      slotEndTime
    ) {
      let dateTime = new Date(currentWeekOrDayStart.valueOf());
      dateTime = setHours(dateTime, getHours(slotStartTime));
      dateTime = setMinutes(dateTime, getMinutes(slotStartTime));
      dateTime = setSeconds(dateTime, "00");
      dateTime = setMilliseconds(dateTime, "000");

      // Values computed and listed here
      // so that they would not need to
      // be recomputed every time they
      // are used in table generation
      let dayObject = {
        bookedSessionsOnTime: [],
        bookedPeopleOnTime: [],
        dayName: format(currentWeekOrDayStart, "eeee"),
        dayNameShort: format(currentWeekOrDayStart, "eee"),
        yearNum: format(currentWeekOrDayStart, "yyyy"),
        monthNum: format(currentWeekOrDayStart, "MM"),
        dateNum: format(currentWeekOrDayStart, "dd"),
        slotStartTime: format(slotStartTime, "HH:mm"),
        slotEndTime: format(slotEndTime, "HH:mm"),
        dateTime: dateTime,
        isSelected: false,
        isCanceling: false,
        isAvailableForBooking: true,
      };
      return dayObject;
    },

    /* ====== CALENDAR NAVIGATION ====== */

    async toggleDayWeekView() {
      this.week = !this.week;
      // If week == current week, set currentDay to today
      this.setNewCurrentDay();
      if (this.week) {
        this.rowNumberForWeekOrDay = 7;
        this.initCalendar();
        this.getCalendarTimes();
        await this.getAllBookedUsersForSpecificWeek();
        // await this.getUserBookedSessionsForThisWeek();
      } else if (!this.week) {
        this.rowNumberForWeekOrDay = 1;
        // -1 is here for...?
        // this.weekdayNum = getDay(this.currentSelectedDay) - 1;
        this.getOneDate();
        this.getCalendarTimes();
        await this.getBookedSessionsForOneDay();
      }
      this.renderSavedSelectionsIfAny();
    },

    setNewCurrentDay() {
      // if new week start = current time week start
      // --> then set today as selected day
      // else if any other week, set start of week as day
      let newWeekStart = this.currentWeekStart;
      let todayWeekStart = startOfISOWeek(new Date());
      console.log("new and today", newWeekStart, todayWeekStart);
      let checkIfSameWeek = isSameWeek(newWeekStart, todayWeekStart);
      if (checkIfSameWeek) {
        this.currentSelectedDay = new Date();
      } else {
        this.currentSelectedDay = this.currentWeekStart;
      }
    },

    async switchWeek(currentWeekStart) {
      this.currentWeekStart = currentWeekStart;
      this.setNewCurrentDay();
      this.initCalendar();
      this.getCalendarTimes();
      await this.getAllBookedUsersForSpecificWeek();
      this.renderSavedSelectionsIfAny();
      // await this.getUserBookedSessionsForThisWeek();
    },

    async switchDay(newSelectedDay) {
      console.log("received new day", newSelectedDay);
      this.currentSelectedDay = newSelectedDay;
      console.log("new day local data", this.currentSelectedDay);
      // In case week changes, set up current week to match day's week
      let isoWeekStart = startOfISOWeek(this.currentSelectedDay);
      this.currentWeekStart = new Date(isoWeekStart);
      // this.weekdayNum = getDay(this.currentSelectedDay) - 1;
      this.getOneDate();
      this.getCalendarTimes();
      await this.getBookedSessionsForOneDay();
      this.renderSavedSelectionsIfAny();
      // this.initCalendar();
      // this.getCalendarTimes();
    },

    async setToToday() {
      this.currentWeekStart = startOfISOWeek(new Date());
      this.currentSelectedDay = new Date();
      if (this.week) {
        this.initCalendar();
        this.getCalendarTimes();
        await this.getAllBookedUsersForSpecificWeek();
        this.renderSavedSelectionsIfAny();
      } else {
        this.getOneDate();
        this.getCalendarTimes();
        await this.getBookedSessionsForOneDay();
        this.renderSavedSelectionsIfAny();
      }
    },
  },
};
</script>

<style>
.wrapper {
  display: flex;
  justify-content: space-between;
  flex-direction: column;
  /* background-color: #f6f5f8; */
}

.cofocus {
  width: 100%;
}

.calendar {
  width: 78%;
  margin: 0px 30px;
}

.calendar-container {
  display: flex;
}

.sidebar {
  width: 20%;
}

.modal {
  /* position: fixed; */
  width: 22%;
  height: 100vh;
  /* top: 0;
  right: -22%;
  right: 17%; */
  z-index: 3;
  /* background: #fff; */
  align-items: center;
  justify-content: center;
  display: flex;
}

.calendar {
  /* background-color: #f6f5f8; */
}

.calendar table {
  width: 100%;
  border-collapse: collapse;
  box-sizing: border-box;
}

.calendar table thead {
  background: #fff;
}

.calendar table thead th:first-of-type {
  width: 60px;
}

.calendar table thead th {
  padding: 16px 20px;
  color: #bab9c6;
  font-size: 20px;
}

.calendar table thead th .day {
  font-size: 15px;
  color: #807f97;
}

.calendar table thead th .date {
  color: #b9b8c4;
  font-size: 22px;
}

.calendar table thead tr {
  border: 1px solid #e4e4e4;
  border-bottom: 2px solid #efefef;
}

.calendar table tbody tr {
  height: 70px;
}

.calendar table tbody td {
  position: relative;
  border: 1px solid #f1f1f3;
  text-align: center;
  background-color: white;
  color: #7d7d93;
  font-size: 14px;
  font-weight: bold;
}

tbody::before {
  content: "@";
  display: block;
  line-height: 10px;
  text-indent: -99999px;
}

.calendar table tbody tr td:first-of-type {
  border: none;
  background: #fafafc;
  border-left: 1px solid #f8f8fa;
  vertical-align: baseline;
}

.calendar table tbody tr td:first-of-type {
  border: none;
  background: #fafafc;
  border-left: 1px solid #f8f8fa;
  vertical-align: baseline;
  width: 80px;
  background-color: transparent;
}

.calendar table tbody td {
  border-bottom-color: transparent;
}

.calendar table tbody tr td:first-of-type div {
  position: absolute;
  top: -5px;
  z-index: 9999;
  color: #c9cad0;
  font-weight: 600;
  font-size: 13px;
}

.calendar-container {
  height: calc(100vh - 76px);
  overflow: hidden;
}

.calendar table thead {
  display: table;
  width: 100%;
  table-layout: fixed;
}

tbody {
  display: block;
  overflow-y: auto;
  overflow-x: hidden;
  height: 650px;
  width: 100%;
  border-right: 1px solid #f1f1f3;
  margin-top: 5px;
  border-radius: 8px;
}

.calendar table tbody tr {
  display: table;
  width: 100%;
  table-layout: fixed;
}

.calendar table thead th {
  padding: 16px 20px;
  color: #bab9c6;
  font-size: 20px;
  width: 164px;
}

.calendar table thead tr {
  border: 1px solid #f1f1f1;
  /* border-bottom: 1px solid #f5f5f5; */
  border-radius: 8px;
}

thead tr {
  display: block;
  width: 100%;
}

/* .calendar table tbody tr:nth-of-type(1) td {
  border-bottom-style: dashed;
}
.calendar table tbody tr:nth-of-type(2) td {
  border-bottom-style: dashed;
}
.calendar table tbody tr:nth-of-type(3) td {
  border-bottom-style: dashed;
} */

.calendar .event,
.calendar .booked-session {
  position: absolute;
  z-index: 2;
  width: calc(90%);
  left: 5%;
  border-radius: 10px;
  background: #eff1f3;
  color: #323554;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  font-size: 14px;
  text-transform: capitalize;
}

.calendar .event img,
.calendar .booked-session img {
  width: 20px;
  height: 20px;
  border-radius: 100%;
  margin: 0 5px;
}

/*
Switcher styles
*/

.calendar .switcher {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 25px 20px;
}

.calendar .switcher .today {
  background: #eef1f3;
  border-radius: 360px;
  padding: 8px 25px;
  font-size: 18px;
  color: #393954;
  font-weight: bold;
  cursor: pointer;
  transition: 0.1s ease;
}

.calendar .switcher .today:hover {
  background-color: #b7bcc194;
}

.today:hover {
  background-color: #b7bcc194;
}

.calendar .switcher .date-range {
  display: flex;
  align-items: center;
}

.calendar .switcher .date-range .arrow {
  border-radius: 100%;
  height: 40px;
  width: 40px;
  line-height: 40px;
  text-align: center;
  border: 1px solid #eae9ec;
  cursor: pointer;
  color: #737389;
  font-weight: bold;
}

.calendar .switcher .date-range .current {
  margin: 0 40px;
  font-size: 20px;
  color: #343556;
  font-weight: bold;
}

.calendar .switcher .calendar-view {
  display: flex;
  font-weight: bold;
}

.calendar .switcher .calendar-view > div {
  padding: 10px 25px;
  border: 1px solid #e6e6e6;
  border-left: none;
  border-bottom-left-radius: unset;
  border-top-left-radius: 0px;
  border-radius: 4px;
  font-size: 14px;
}

.calendar .switcher .calendar-view .active {
  background: white;
  color: #3e3d56;
  border: none;
  border-bottom-right-radius: 1px;
  border-top-right-radius: 2px;
  box-shadow: 1px 2px 1px 0px #efefef;
}

/** BOOKING MODAL */
.bookSession,
.cancelBooking {
  font-size: 20px;
  margin-top: 15px;
  margin-left: 5px;
  margin-right: 5px;
  letter-spacing: 0.5px;
  background-color: #f7f7fb;
  padding: 6px 14px;
  font-weight: 700;
  border-radius: 360px;
  cursor: pointer;
  transition: 0.1s ease;
  text-align: center;
  outline: none;
  border-color: unset;
  border: none;
  box-sizing: border-box;
  width: 250px;
}

.bookSession {
  color: #5600ff;
}

.not-allowed {
  cursor: not-allowed !important;
}

.cancelBooking {
  margin-top: 7px;
  padding: 4px 15px;
  font-size: 18px;
}

.bookSession:hover,
.cancelBooking:hover {
  background-color: #b7bcc194;
}

.booking-input {
  border: 1px solid #eee;
  border-radius: 3px;
  width: 250px;
  caret-color: #666;
  padding: 8px 14px;
  font-size: 17px;
  font-family: "Nunito", sans-serif;
  transition: 0.2s ease;
  box-sizing: border-box;
  outline: none;
  margin-bottom: 5px;
}

.booking-input:hover {
  border-color: #ccc;
}
</style>