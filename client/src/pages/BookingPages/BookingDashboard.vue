<template>
  <div class="cofocus">
    <div class="wrapper">
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
      bookedSessions: [],
      bookedPeopleOnTime: [],
      interval: 60,
      minimumTime: "00:00",
      maximumTime: "23:00",
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
    // DayTable: () => import("./CalendarComponents/DayTable"),
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
    this.startReceivingPushedSessions();
    this.startReceivingCanceledSessions();

    let globalThis = this;
    window.onbeforeunload = () => {
      globalThis.cleanBeforeLeave();
    };
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
                  day.bookedSessionsOnTime.push(session);
                  this.bookedSessions.push(session);
                } else if (!session.sessionThroughMatching) {
                  day.bookedPeopleOnTime.push(session);
                  this.bookedPeopleOnTime.push(session);
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
        sessions.forEach((session) => {
          this.calendarData.forEach((hourRow) => {
            hourRow.hourRowDays.forEach((day) => {
              let sessionDateTime = new Date(session.sessionDateTime);
              if (day.dateTime.valueOf() == sessionDateTime.valueOf()) {
                if (!session.noMatchSession) {
                  // If one of user's sessions (e.g. matched), update with new
                  day.bookedSessionsOnTime.forEach((calendarSession) => {
                    if (calendarSession._id == session.sessionId) {
                      if (
                        calendarSession.firstPartnerId &&
                        calendarSession.secondPartnerId
                      ) {
                        if (
                          calendarSession.firstPartnerId == this.user._id ||
                          calendarSession.secondPartnerId == this.user._id
                        ) {
                          this.removeOnePartnerFromSession(
                            calendarSession,
                            this.user._id
                          );
                        } else if (
                          calendarSession.firstPartnerId !== this.user._id ||
                          (calendarSession.secondPartnerId !== this.user._id &&
                            (calendarSession.firstPartnerId ==
                              session.cancelerId ||
                              calendarSession.secondPartnerId ==
                                session.cancelerId))
                        ) {
                          console.log("YOOOOOO", session.cancelerId);
                          this.removeOnePartnerFromSession(
                            calendarSession,
                            session.cancelerId
                          );
                        }
                      }
                    }
                  });
                } else {
                  // if was empty, then remove it from bookedPeople
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
      if (calendarSession.firstPartnerId == userId) {
        this.$set(calendarSession, "sessionThroughMatching", false);
        this.$set(calendarSession, "secondPartnerId", null);
        this.$set(calendarSession, "secondPartnerUsername", null);
      } else if (calendarSession.secondPartnerId == userId) {
        this.$set(calendarSession, "sessionThroughMatching", false);
        this.$set(calendarSession, "firstPartnerId", null);
        this.$set(calendarSession, "firstPartnerUsername", null);
      }
    },

    cleanBeforeLeave(fromBeforeLeave = false, next = null) {
      this.sockets.unsubscribe("receivePushedSessions");

      // this.resetData();
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
    async getAllBookedUsersForSpecificWeek() {
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

          allBookedSessions.forEach((session) => {
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
    async getBookedSessionsForOneDay() {
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

          // Sort here
          allBookedSessions.forEach((session) => {
            this.updateCalendarSessions(session);
          });

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
          let noMatchSession = false;
          let sessions = [];
          let sessionDateTime = slot.dateTime;
          if (
            response.data.result._id &&
            response.data.result._id == sessionId
          ) {
            this.updateCalendarAfterCancel(
              sessionId,
              sessionDateTime,
              response.data.result
            );
          } else if (response.data.result == 1) {
            noMatchSession = true;
            this.updateCalendarAfterCancel(sessionId, sessionDateTime);
          }
          let deletedSession = {
            sessionId: sessionId,
            sessionDateTime: sessionDateTime,
            cancelerId: this.user._id,
          };
          if (noMatchSession) {
            deletedSession.noMatchSession = noMatchSession;
          }
          sessions.push(deletedSession);
          let sessionInfo = {
            userId: this.user._id,
            sessions: sessions,
            roomType: "cofocus",
          };
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
          let sessions = [];
          sessions.push(session);

          let sessionInfo = {
            userId: this.user._id,
            sessions: sessions,
            roomType: "cofocus",
          };
          this.$socket.emit("pushSessionsToOthers", sessionInfo);

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

        let sendData = {
          slotsToBookArray: sessionsToBook,
          slotsToBookTimesArray: sessionTimes,
          userId: this.user._id,
          username: this.user.username,
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

        let sessionsInfo = {
          userId: this.user._id,
          sessions: sessions,
          roomType: "cofocus",
        };
        this.$socket.emit("pushSessionsToOthers", sessionsInfo);

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
              day.bookedSessionsOnTime.push(session);
              this.bookedSessions.push(session);
            } else {
              day.bookedPeopleOnTime.push(session);
              this.bookedPeopleOnTime.push(session);
            }
          }
        });
      });
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
                      day.bookedPeopleOnTime.push(session);
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
      };
      return dayObject;
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
      slotData.isCanceling = true;

      this.updateCalendarSelectedSlots(slotData, slotData.isCanceling, false, 1);

      slotData = JSON.parse(JSON.stringify(slotData));
      this.$store.dispatch("booking/setIsCanceling", slotData);
      // later add to array of SELECTED SLOTS
    },
    exitIsCanceling(slotData) {
      console.log("slotData", slotData);

      slotData.isCanceling = false;
      this.updateCalendarSelectedSlots(slotData, slotData.isCanceling, false, 1);

      slotData = JSON.parse(JSON.stringify(slotData));
      this.$store.dispatch("booking/exitIsCanceling", slotData);
    },
    
    cancelSlot(slotData) {
      console.log("slotData", slotData);

      slotData.isSelected = false;
      this.updateCalendarSelectedSlots(slotData, slotData.isSelected, false, 0);

      slotData = JSON.parse(JSON.stringify(slotData));
      this.$store.dispatch("booking/cancelSlot", slotData);
    },

    // exitAllCanceling() {
    //    this.selectedToBook.forEach((slotData) => {
    //     this.updateCalendarSelectedSlots(slotData, false, true, 0);
    //   });

    //   this.$store.dispatch("booking/clearAllCanceling");
    // },

    cancelBooking() {
      console.log("canceling");

      this.selectedToBook.forEach((slotData) => {
        this.updateCalendarSelectedSlots(slotData, false, true, 0);
      });

      this.$store.dispatch("booking/clearAllSelections");
    },
    renderSavedSelectionsIfAny() {
      if (this.selectedToBook.length) {
        this.selectedToBook.forEach((slotData) => {
          this.updateCalendarSelectedSlots(slotData, true, false, 0);
        });
      }
    },
    updateCalendarSelectedSlots(slotData, newSlotState, all = false, field) {
      if (field == 0) {
        field = "isSelected";
      } else if (field == 1) {
        field = "isCanceling"
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
  },
};
</script>

<style>
.wrapper {
  display: flex;
  justify-content: space-between;
  /* background-color: #f6f5f8; */
}

.cofocus {
  width: 100%;
}

.calendar {
  width: 78%;
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