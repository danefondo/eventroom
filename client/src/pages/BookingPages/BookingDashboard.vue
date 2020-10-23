<template>
  <div class="cofocus">
    <div class="wrapper">
      <div class="calendar">
        <Switcher
          v-if="start && end && currentStart"
          @switchWeek="switchWeek"
          @switchDay="switchDay"
          @setToToday="setToToday"
          :start="start"
          :end="end"
          :currentStart="currentStart"
          :week="week"
          :currentSelectedDay="currentSelectedDay"
          @toggleDayWeekView="toggleDayWeekView"
        />
        <Table
          v-if="dates && start && end"
          :dates="dates"
          :start="start"
          :end="end"
          :rowNumberForWeekOrDay="rowNumberForWeekOrDay"
          :currentStart="currentStart"
          :calendarData="calendarData"
          :week="week"
          :weekdayNum="weekdayNum"
          @select-slot="selectSlot"
        />
      </div>
      <!-- <div class="sidebar">Random things</div> -->
      <div class="modal">
        <div class="modal-body">
          <form>
            <input name="title" type="text" placeholder="Event title" /><br />
            <input
              name="date"
              type="date"
              v-model="date"
              placeholder="Date"
            /><br />
            <input
              name="start-time"
              type="time"
              v-model="startTime"
              placeholder="Start time"
            /><br />
            <input
              name="end-time"
              type="time"
              v-model="endTime"
              placeholder="End time"
            />

            <div class="all-users"></div>
          </form>
          <div class="bookSession" @click="bookSession">
            {{ currentlyBookingSession ? "Booking..." : "Book session" }}
          </div>
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
import moment from "moment";

import Switcher from "./CalendarComponents/Switcher";
import Table from "./CalendarComponents/Table";

import { startOfDay, endOfDay, getDay, startOfISOWeek } from "date-fns";

export default {
  name: "BookingDashboard",
  data() {
    return {
      startTime: null,
      endTime: null,
      date: null,
      currentlyBookingSession: false,
      gettingBookedSessions: false,
      gettingBookedSessionsError: false,
      gettingAllBookedSessions: false,
      gettingAllBookedSessionsError: false,
      gettingBookedSessionsForOneDay: false,
      gettingBookedSessionsForOneDayError: false,
      bookedSessions: [],
      bookedPeopleOnTime: [],
      interval: 60,
      minimumTime: "08:00",
      maximumTime: "16:00",
      height: 70,
      calendarData: [],

      start: null,
      end: null,
      dates: null,
      currentStart: moment().startOf("isoWeek"),
      currentSelectedDay: new Date(),
      week: true,
      rowNumberForWeekOrDay: 7,
      weekdayNum: null,
    };
  },
  computed: {
    ...mapState({
      user: (state) => state.auth.user,
      isAuthenticated: (state) => state.auth.authenticationStatus,
      isVerified: (state) => state.auth.verificationStatus,
    }),
  },
  components: {
    Switcher,
    Table,
  },
  beforeRouteLeave(to, from, next) {
    this.cleanBeforeLeave(true, next);
  },
  async mounted() {
    this.initCalendar();
    this.getCalendarTimes();

    await this.getAllBookedUsersForSpecificWeek();

    this.$socket.emit("joinCofocusCalendar", "cofocus");
    this.startReceivingPushedSessions();

    let globalThis = this;
    window.onbeforeunload = () => {
      globalThis.cleanBeforeLeave();
    };
  },
  methods: {
    startReceivingPushedSessions() {
      let globalThis = this;
      this.sockets.subscribe("receivePushedSessions", (session) => {
        console.log("WOWZA SESIONA", session);

        // could be one or many
        // It also gives all relevant data to know where to insert it
        if (globalThis.week) {
          globalThis.calendarData.forEach((hourRow) => {
            hourRow.timeRowDays.forEach((day) => {
              if (day.specificDateTime == session.queryDateTime) {
                // later also check if all partners contains userId
                console.log("session====", session);
                // if (session.sessionThroughMatching) {
                //   // If through matching, need not update, only change
                //   let partnerOne = day.bookedSessionsOnTime[0].firstPartnerId;
                //   let partnerTwo = day.bookedSessionsOnTime[0].secondPartnerId;

                //   console.log("p1, p2", partnerOne, partnerTwo);

                //   // must check both in case it's a case where someone had canceled who was first partner, though could in backend set any single second partner as first partner
                //   if (partnerOne && partnerTwo) {
                //     // return if already matched
                //     return;
                //   } else if (
                //     partnerOne &&
                //     partnerOne == globalThis.user._id &&
                //     !partnerTwo
                //   ) {
                //     // can set direct without further comparison since rest is handled in server (e.g. making sure second partner is second partner if first is you)
                //     console.log("PARTNER TWO NOT EXIST");
                //     day.bookedSessionsOnTime[0].secondPartnerId =
                //       session.secondPartnerId;
                //     day.bookedSessionsOnTime[0].secondPartnerUsername =
                //       session.secondPartnerUsername;
                //   } else if (
                //     partnerTwo &&
                //     partnerTwo == globalThis.user._id &&
                //     !partnerOne
                //   ) {
                //     console.log("PARTNER ONE NOT EXIST");
                //     day.bookedSessionsOnTime[0].firstPartnerId =
                //       session.firstPartnerId;
                //     day.bookedSessionsOnTime[0].firstPartnerUsername =
                //       session.firstPartnerUsername;
                //   }
                // }
                if (
                  !session.sessionThroughMatching &&
                  (session.firstPartnerId == globalThis.user._id ||
                    session.secondPartnerId == globalThis.user._id)
                ) {
                  day.bookedSessionsOnTime.push(session);
                  globalThis.bookedSessions.push(session);
                } else if (!session.sessionThroughMatching) {
                  day.bookedPeopleOnTime.push(session);
                  globalThis.bookedPeopleOnTime.push(session);
                }
              }
            });
          });
        } else {
          globalThis.calendarData.forEach((hourRow) => {
            let day = hourRow.timeRowDay;
            if (day.specificDateTime == session.queryDateTime) {
              // if (session.sessionThroughMatching) {
              //   // If through matching, need not update, only change
              //   let partnerOne = day.bookedSessionsOnTime[0].firstPartnerId;
              //   let partnerTwo = day.bookedSessionsOnTime[0].secondPartnerId;

              //   console.log("p1, p2", partnerOne, partnerTwo);

              //   // must check both in case it's a case where someone had canceled who was first partner, though could in backend set any single second partner as first partner
              //   if (partnerOne && partnerTwo) {
              //     // return if already matched
              //     return;
              //   } else if (
              //     partnerOne &&
              //     partnerOne == globalThis.user._id &&
              //     !partnerTwo
              //   ) {
              //     // can set direct without further comparison since rest is handled in server (e.g. making sure second partner is second partner if first is you)
              //     day.bookedSessionsOnTime[0].secondPartnerId =
              //       session.secondPartnerId;
              //     day.bookedSessionsOnTime[0].secondPartnerUsername =
              //       session.secondPartnerUsername;
              //   } else if (
              //     partnerTwo &&
              //     partnerTwo == globalThis.user._id &&
              //     !partnerOne
              //   ) {
              //     day.bookedSessionsOnTime[0].firstPartnerId =
              //       session.firstPartnerId;
              //     day.bookedSessionsOnTime[0].firstPartnerUsername =
              //       session.firstPartnerUsername;
              //   }
              // }
              if (
                !session.sessionThroughMatching &&
                (session.firstPartnerId == globalThis.user._id ||
                  session.secondPartnerId == globalThis.user._id)
              ) {
                day.bookedSessionsOnTime.push(session);
                globalThis.bookedSessions.push(session);
              } else if (!session.sessionThroughMatching) {
                day.bookedPeopleOnTime.push(session);
                globalThis.bookedPeopleOnTime.push(session);
              }
            }
          });
        }
      });
    },
    cleanBeforeLeave(fromBeforeLeave = false, next = null) {
      this.sockets.unsubscribe("receivePushedSessions");

      // this.resetData();
      if (fromBeforeLeave && next !== null) {
        next();
      }
    },
    async getUserBookedSessionsForThisWeek() {
      let globalThis = this;
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
            globalThis.calendarData.forEach((hourRow) => {
              hourRow.timeRowDays.forEach((day) => {
                if (day.specificDateTime == session.queryDateTime) {
                  console.log("daySpecificTime: ", day.specificDateTime);
                  console.log("sesSpecificTime: ", session.queryDateTime);
                  day.bookedSessionsOnTime.push(session);
                }
              });
            });
          });

          bookedSessions.forEach((room) => {
            globalThis.bookedSessions.push(room);
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
      // Get everyone's booked sessions for this week from this moment forward (no past sessions)
      let globalThis = this;
      try {
        if (!this.user || !this.user._id) {
          return (window.location.href = "/");
        }
        this.gettingAllBookedSessions = true;

        let endOfWeekDate = new moment(this.currentStart);
        endOfWeekDate = endOfWeekDate.endOf("isoWeek");
        endOfWeekDate = endOfWeekDate.toDate();

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

          // allBookedSessions.forEach((session) => {
          //   globalThis.calendarData.forEach((hourRow) => {
          //     hourRow.timeRowDays.forEach((day) => {
          //       if (day.specificDateTime == session.queryDateTime) {
          //         day.bookedPeopleOnTime.push(session);
          //       }
          //     });
          //   });
          // });

          allBookedSessions.forEach((session) => {
            globalThis.calendarData.forEach((hourRow) => {
              hourRow.timeRowDays.forEach((day) => {
                if (day.specificDateTime == session.queryDateTime) {
                  // later also check if all partners contains userId
                  console.log("session====", session);
                  if (
                    session.firstPartnerId == globalThis.user._id ||
                    session.secondPartnerId == globalThis.user._id
                  ) {
                    day.bookedSessionsOnTime.push(session);
                    globalThis.bookedSessions.push(session);
                  } else {
                    day.bookedPeopleOnTime.push(session);
                    globalThis.bookedPeopleOnTime.push(session);
                  }
                }
              });
            });
          });

          // allBookedSessions.forEach((room) => {
          //   globalThis.bookedPeopleOnTime.push(room);
          // });

          // bookedSessions.forEach((room) => {
          //   globalThis.bookedSessions.push(room);
          // });
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
      // Get everyone's booked sessions for this day from this moment forward (no past sessions) until the end of this particular day
      let globalThis = this;
      // Return in two lists, load in one go?
      try {
        if (!this.user || !this.user._id) {
          return (window.location.href = "/");
        }
        this.gettingBookedSessionsForOneDay = true;

        let dayData = {
          startOfDay: startOfDay(this.currentSelectedDay),
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

        console.log("sessionsALLBOOKEDPEOPLE", allBookedSessions);

        if (response.data.success) {
          this.gettingBookedSessionsForOneDay = false;

          // Sort here
          allBookedSessions.forEach((session) => {
            globalThis.calendarData.forEach((hourRow) => {
              let day = hourRow.timeRowDay;
              if (day.specificDateTime == session.queryDateTime) {
                if (
                  session.firstPartnerId == globalThis.user._id ||
                  session.secondPartnerId == globalThis.user._id
                ) {
                  day.bookedSessionsOnTime.push(session);
                }
              }
            });
          });

          allBookedSessions.forEach((room) => {
            globalThis.bookedPeopleOnTime.push(room);
          });

          // bookedSessions.forEach((room) => {
          //   globalThis.bookedSessions.push(room);
          // });
          // add rooms to vuex or local storage to display them in order of creation or in the order of chosen preference;
          // then display the rooms
        }
      } catch (error) {
        console.log("@gettingAllBookedSessionsForOneDay Error: ", error);
        this.gettingBookedSessionsForOneDay = false;
        this.gettingBookedSessionsForOneDayError = true;
      }
    },
    async bookSession() {
      let errors = {};
      try {
        this.currentlyBookingSession = true;
        const [year, month, date] = this.date.split("-");
        let sendData = {
          queryDate: `${year}-${month}-${date}-${this.startTime}-${this.endTime}`,
          startTime: this.startTime,
          endTime: this.endTime,
          date: this.date,
          rawDateTime: new moment(
            `${year}-${month}-${date} ${this.startTime}`,
            "YYYY-MM-DD HH:mm"
          ),
        };
        sendData.userId = this.user._id;
        sendData.username = this.user.username;
        const response = await requestWithAuthentication(
          `post`,
          `api/booking/bookSessionSlot`,
          sendData
        );
        let session = response.data.result;
        if (!session) {
          errors.FailedToBookSession = true;
          throw { errors: errors };
        }

        if (this.week) {
          this.calendarData.forEach((hourRow) => {
            hourRow.timeRowDays.forEach((day) => {
              if (day.specificDateTime == session.queryDateTime) {
                if (
                  session.firstPartnerId == this.user._id ||
                  session.secondPartnerId == this.user._id
                ) {
                  day.bookedSessionsOnTime.push(session);
                }
              }
            });
          });
        } else {
          this.calendarData.forEach((hourRow) => {
            let day = hourRow.timeRowDay;
            if (day.specificDateTime == session.queryDateTime) {
              if (
                session.firstPartnerId == this.user._id ||
                session.secondPartnerId == this.user._id
              ) {
                day.bookedSessionsOnTime.push(session);
              }
            }
          });
        }

        let sessionInfo = {
          userId: this.user._id,
          session: session,
          roomType: "cofocus",
        };
        this.$socket.emit("pushNewSessionToOthers", sessionInfo);

        this.currentlyBookingSession = false;
      } catch (error) {
        console.log("errorBooking", error);
        this.currentlyBookingSession = false;
      }
    },

    async toggleDayWeekView() {
      this.week = !this.week;
      if (this.week) {
        this.rowNumberForWeekOrDay = 7;
        this.initCalendar();
        this.getCalendarTimes();
        await this.getAllBookedUsersForSpecificWeek();
        // await this.getUserBookedSessionsForThisWeek();
      } else if (!this.week) {
        this.rowNumberForWeekOrDay = 1;
        this.weekdayNum = getDay(this.currentSelectedDay) - 1;
        this.getOneDate();
        this.getDayCalendarTimes();
        await this.getBookedSessionsForOneDay();
      }
    },
    async switchWeek(currentStart) {
      this.currentStart = currentStart;

      // if new week start = current time week start
      // --> then set today as selected day
      // else if any other week, set start of week as day
      let newWeekStart = currentStart.toDate();
      let todayWeekStart = moment().startOf("isoWeek").toDate();
      if (newWeekStart == todayWeekStart) {
        this.currentSelectedDay = new Date();
      } else {
        this.currentSelectedDay = currentStart.toDate();
      }
      this.initCalendar();
      this.getCalendarTimes();
      await this.getAllBookedUsersForSpecificWeek();
      // await this.getUserBookedSessionsForThisWeek();
    },
    async switchDay(newSelectedDay) {
      this.currentSelectedDay = newSelectedDay;
      // In case week changes, set up current week to match day's week
      let isoWeekStart = startOfISOWeek(this.currentSelectedDay);
      this.currentStart = moment(isoWeekStart);
      this.weekdayNum = getDay(this.currentSelectedDay) - 1;
      this.getOneDate();
      this.getDayCalendarTimes();
      await this.getBookedSessionsForOneDay();
      // this.initCalendar();
      // this.getCalendarTimes();
    },
    async setToToday() {
      this.currentStart = moment().startOf("isoWeek");
      this.currentSelectedDay = new Date();
      if (this.week) {
        this.initCalendar();
        this.getCalendarTimes();
        await this.getAllBookedUsersForSpecificWeek();
      } else {
        this.getOneDate();
        this.getDayCalendarTimes();
        this.getBookedSessionsForOneDay();
      }
    },
    initCalendar() {
      let startOfPeriod = this.currentStart;
      let newStart = new moment(startOfPeriod);
      this.getDates(newStart);
    },
    getDates(startOfWeek) {
      const dates = [
        {
          date: startOfWeek.format("DD"),
          day: startOfWeek.format("ddd"),
          month: startOfWeek.format("MMM"),
          monthInNum: startOfWeek.format("MM"),
          year: startOfWeek.format("YYYY"),
        },
      ];
      for (let i = 1; i < 7; i++) {
        const nextDay = startOfWeek.add(1, "d");
        dates.push({
          date: nextDay.format("DD"),
          day: nextDay.format("ddd"),
          month: nextDay.format("MMM"),
          monthInNum: nextDay.format("MM"),
          year: startOfWeek.format("YYYY"),
        });
      }
      this.dates = dates;
      this.start = this.dates[0];
      this.end = this.dates[this.dates.length - 1];
    },
    getOneDate() {
      // get current week first day
      // if currentSelectedDay is not of selectedweek
      // select firstDate of the week

      // then use current selected date
      let momentDate = moment(this.currentSelectedDay);
      const date = {
        date: momentDate.format("DD"),
        day: momentDate.format("ddd"),
        month: momentDate.format("MMM"),
        monthInNum: momentDate.format("MM"),
        year: momentDate.format("YYYY"),
      };
      this.dates = [];
      this.dates.push(date);
      this.start = this.dates[0];
      this.end = this.dates[0];
    },
    getTimes(min, max, interval) {
      const time = moment(min, "HH:mm");
      const maximumTime = moment(max, "HH:mm");
      const times = [];
      do {
        times.push(time.format("HH:mm"));
        time.add(interval, "minutes");
      } while (time.isSameOrBefore(maximumTime));
      return times;
    },
    // A couple of options for matching
    // Either keep additional Calendar Model
    // where all sessions are kept separately
    // or just keep the sessions modal
    // and can mark 'old sessions' as old
    // AND move them somewhere else to minimize query time
    // with new sessions

    // No 'auto-matching' necessary, albeit can have
    // matching suggestions ('Your X friend is matched 15 minutes from your current session [time15MinutesBefore], would you like to rebook?)

    // All that is necessary is that when someone is booked
    // either just match them with their choice
    // or if someone unmatches
    // then either match up with first available if only one free
    // else filter against the person by preferences

    // NOW SOMEHOW POPULATE bookedPeopleOnTime for each day & bookedSessionsOnTime
    // one where userId == this.user._id & everyone else
    // I must somehow decide WHICH ONE is the correct one to push data into

    // sessions.forEach()... -> what?
    getCalendarTimes() {
      // EITHER PASS OR USE LOCAL/DB DATA FOR MIN, MAX, INTERVAL
      // Each time row must have 7 entries
      // With each of the 7 entries having its own associated block
      // I create an empty object with some empty value holders necessary for rendering & later populating
      // I add a time to it
      // I push it to the calendar data

      // one time object, is one time row, containing 7 days

      // MUST ALSO IMPLEMENT TIMEZONES + SET GLOBAL TIMEZONE?

      //let globalThis = this;

      let min = this.minimumTime;
      let max = this.maximumTime;
      const time = moment(min, "HH:mm");
      const endTimeCounter = moment(min, "HH:mm");
      const maxTime = moment(max, "HH:mm");
      this.calendarData = [];
      do {
        let endTime = endTimeCounter;
        endTime = endTime.add(this.interval, "minutes");

        let timeObject = {
          time: time.format("HH:mm"),
          timeRowDays: [],
        };
        // each iteration is for one day out of 7
        // each 7 is for
        let current = new moment(this.currentStart);
        for (var i = 0; i < 7; i++) {
          // COMPUTE DATE-TIME-STRING
          let dateNum;

          // If first day, don't add day
          if (i == 0) {
            dateNum = current.format("DD");
          } else {
            dateNum = current.add(1, "d");
            dateNum = dateNum.format("DD");
          }
          let monthNum = current.format("MM");
          let yearNum = current.format("YYYY");
          let startNum = timeObject.time;
          let endNum = endTime.format("HH:mm");
          let specificDateTime = `${yearNum}-${monthNum}-${dateNum}-${startNum}-${endNum}`;
          console.log("dateNumber", dateNum);
          console.log("specificDateTime", specificDateTime);

          let dayObject = {
            bookedSessionsOnTime: [],
            bookedPeopleOnTime: [],
            date: dateNum,
            month: monthNum,
            year: yearNum,
            startTime: startNum,
            endTime: endNum,
            specificDateTime: specificDateTime,
          };
          timeObject.timeRowDays.push(dayObject);
        }
        this.calendarData.push(timeObject);
        time.add(this.interval, "minutes");
      } while (time.isSameOrBefore(maxTime));
    },
    getDayCalendarTimes() {
      let min = this.minimumTime;
      let max = this.maximumTime;
      const time = moment(min, "HH:mm");
      const endTimeCounter = moment(min, "HH:mm");
      const maxTime = moment(max, "HH:mm");
      this.calendarData = [];
      // Iterate and do for each hour, one row
      do {
        let endTime = endTimeCounter;
        endTime = endTime.add(this.interval, "minutes");

        let timeObject = {
          time: time.format("HH:mm"),
          timeRowDay: [],
        };
        // each iteration is for one day out of 7
        // each 7 is for
        let current = new moment(this.currentSelectedDay);
        // COMPUTE DATE-TIME-STRING

        let dateNum = current.format("DD");
        let monthNum = current.format("MM");
        let yearNum = current.format("YYYY");
        let startNum = timeObject.time;
        let endNum = endTime.format("HH:mm");
        let specificDateTime = `${yearNum}-${monthNum}-${dateNum}-${startNum}-${endNum}`;
        console.log("dateNumber", dateNum);
        console.log("specificDateTime", specificDateTime);

        let dayObject = {
          bookedSessionsOnTime: [],
          bookedPeopleOnTime: [],
          date: dateNum,
          month: monthNum,
          year: yearNum,
          startTime: startNum,
          endTime: endNum,
          specificDateTime: specificDateTime,
        };
        timeObject.timeRowDay = dayObject;
        this.calendarData.push(timeObject);
        time.add(this.interval, "minutes");
      } while (time.isSameOrBefore(maxTime));
    },
    selectSlot({ startTime, endTime, date, month, year }) {
      this.startTime = startTime;
      this.endTime = endTime;
      this.date = `${year}-${month}-${date}`;
      // later add to array of SELECTED SLOTS
    },
    cancelBooking() {
      console.log("canceling");
    },
  },
};
</script>

<style>
.wrapper {
  display: flex;
  justify-content: space-between;
  background-color: #f6f5f8;
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
  background-color: #f6f5f8;
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
  background: #e5e8ea;
  border-radius: 30px;
  padding: 15px 25px;
  font-size: 14px;
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

.calendar tbody td .add-highlight {
  position: absolute;
  display: none;
  width: 90%;
  background: #59599e;
  top: 10px;
  border-radius: 4px;
  font-size: 20px;
  color: #fff;
  text-align: center;
  left: 0;
  right: 0;
  margin: 0 auto;
}

/** BOOKING MODAL */
.bookSession,
.cancelBooking {
  font-size: 20px;
  margin-top: 15px;
  margin-left: 5px;
  margin-right: 5px;
  letter-spacing: 0.5px;
  background-color: #e9eced;
  padding: 6px 14px;
  font-weight: 700;
  border-radius: 360px;
  cursor: pointer;
  transition: 0.1s ease;
  text-align: center;
}

.bookSession {
  color: #5600ff;
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
</style>