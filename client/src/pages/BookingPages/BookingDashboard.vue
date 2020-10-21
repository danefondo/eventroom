<template>
  <div class="calendar">
    <div class="wrapper">
      <div class="calendar">
        <Switcher
          v-if="start && end && currentStart"
          @switchWeek="switchWeek"
          @setToToday="setToToday"
          :start="start"
          :end="end"
          :currentStart="currentStart"
          :week="week"
          @toggleDayWeekView="toggleDayWeekView"
        />
        <Table
          v-if="dates && start && end"
          :dates="dates"
          :start="start"
          :end="end"
          :currentStart="currentStart"
          :calendarData="calendarData"
        />
      </div>
      <div class="sidebar">Random things</div>
    </div>

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
        <div @click="bookSession">Book session</div>
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

export default {
  name: "BookingDashboard",
  data() {
    return {
      startTime: null,
      endTime: null,
      date: null,
      gettingBookedSessions: false,
      gettingBookedSessionsError: false,
      gettingAllBookedSessions: false,
      gettingAllBookedSessionsError: false,
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
      week: true,
    };
  },
  computed: {
    ...mapState({
      bookingData: (state) => state.booking.bookingData,
      startX: (state) => state.booking.bookingData.startTime,
      user: (state) => state.auth.user,
    }),
  },
  components: {
    Switcher,
    Table,
  },
  //   computed: {
  //     ...mapState({
  //       user: (state) => state.auth.user,
  //       isAuthenticated: (state) => state.auth.authenticationStatus,
  //       isVerified: (state) => state.auth.verificationStatus,
  //     }),
  //   },
  async mounted() {
    if (
      this.bookingData.startTime &&
      this.bookingData.endTime &&
      this.bookingData.date
    ) {
      this.startTime = this.bookingData.startTime;
      this.endTime = this.bookingData.endTime;
      this.date = this.bookingData.date;
    }
    this.initCalendar();
    this.getCalendarTimes();

    await this.getAllBookedUsersForSpecificWeek();
    await this.getUserBookedSessionsForThisWeek();
    // this.plotEvents();
  },
  methods: {
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
        endOfWeekDate = endOfWeekDate.add(169, 'hours');
        endOfWeekDate = endOfWeekDate.toDate();

        let weekData = {
          currentWeek: this.currentStart,
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
            globalThis.calendarData.forEach((hourRow) => {
              hourRow.timeRowDays.forEach((day) => {
                if (day.specificDateTime == session.queryDateTime) {
                  day.bookedPeopleOnTime.push(session);
                }
              });
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
        console.log("@gettingBookedSessions Error: ", error);
        this.gettingBookedSessions = false;
        this.gettingBookedSessionsError = true;
      }
    },
    async bookSession() {
      try {
        let sendData = JSON.parse(JSON.stringify(this.bookingData));
        sendData.userId = this.user._id;
        sendData.username = this.user.username;
        const response = await requestWithAuthentication(
          `post`,
          `api/booking/bookSessionSlot`,
          sendData
        );
        console.log("response", response);
      } catch (error) {
        console.log("errorBooking", error);
      }
    },

    toggleDayWeekView() {
      this.week = !this.week;
    },
    switchWeek(currentStart) {
      this.currentStart = currentStart;
      this.initCalendar();
    },
    setToToday() {
      this.currentStart = moment().startOf("isoWeek");
      this.initCalendar();
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

    // See OTHERS on the calendar
    plotEvents() {
      // clearAllEvents();
      this.bookedSessions.forEach((eachEvent) => {
        const diffMinutes = moment(eachEvent.scheduledStartTime, "HH:mm").diff(
          moment(this.minimumTime, "HH:mm"),
          "minutes"
        );

        console.log("diffMin", diffMinutes);
        // this will fail for events that transcend a day
        const eventLength = moment(eachEvent.scheduledEndTime, "HH:mm").diff(
          moment(eachEvent.scheduledStartTime, "HH:mm"),
          "minutes"
        );
        const rowIndex = Math.floor(diffMinutes / this.interval);
        const diffMinutesInTimeFrame = diffMinutes - rowIndex * this.interval;
        let date = eachEvent.scheduledDate.split("-");
        let dateNumber = new Date(eachEvent.scheduledDate);
        dateNumber = dateNumber.getUTCDate();
        console.log("date", date);
        const column = document.querySelector(`[data-date="${dateNumber}"]`);
        if (column && column.dataset.month === date[1]) {
          const columnIndex = parseInt(column.dataset.index);
          const eventHtml = `<div class="event">My Booked Session</div>`;
          const cell = document.querySelector(
            `tbody tr:nth-of-type(${rowIndex + 1}) td:nth-of-type(${
              columnIndex + 1
            })`
          );
          cell.innerHTML = eventHtml;
          cell.children[0].style.height = `${
            (eventLength / this.interval) * this.height
          }px`;
          //console.log(minute, ((minute % interval) / interval) * height)
          cell.children[0].style.top = `${
            (diffMinutesInTimeFrame / this.interval) * this.height
          }px`;
        }
      });
    },
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

      let globalThis = this;

      let min = this.minimumTime;
      let max = this.maximumTime;
      const time = moment(min, "HH:mm");
      const endTimeCounter = moment(min, "HH:mm");
      let inter = this.interval;

      const maxTime = moment(max, "HH:mm");
      do {
        let endTime = endTimeCounter;
        endTime = endTime.add(inter, "minutes");

        let timeObject = {
          time: time.format("HH:mm"),
          timeRowDays: [],
        };
        // each iteration is for one day out of 7
        // each 7 is for
        let current = new moment(globalThis.currentStart);
        for (var i = 0; i < 7; i++) {
          // COMPUTE DATE-TIME-STRING

          let monthNum = current.format("MM");
          let yearNum = current.format("YYYY");
          let startNum = timeObject.time;
          let endNum = endTime.format("HH:mm");
          let dateNum;
          if (i == 0) {
            dateNum = current.format("DD");
          } else {
            dateNum = current.add(1, "d");
            dateNum = dateNum.format("DD");
          }
          let specificDateTime = `${yearNum}-${monthNum}-${dateNum}-${startNum}-${endNum}`;
          console.log("dateNumber", dateNum);
          console.log("specificDateTime", specificDateTime);

          let dayObject = {
            bookedSessionsOnTime: [],
            bookedPeopleOnTime: [],
            specificDateTime: specificDateTime,
          };
          timeObject.timeRowDays.push(dayObject);
        }
        globalThis.calendarData.push(timeObject);
        time.add(this.interval, "minutes");
      } while (time.isSameOrBefore(maxTime));
      console.log("calendarTime", globalThis.calendarData);
    },
    // async getAllEvents() {
    //   try {
    //     const { data } = await axios.get(`/api/events/getAllEvents`);
    //     console.log("@home data", data);
    //     this.events = data.events;
    //   } catch (error) {
    //     console.log("error", error);
    //   }
    // },
  },
  watch: {
    startX: function () {
      if (
        this.bookingData.startTime &&
        this.bookingData.endTime &&
        this.bookingData.date
      ) {
        this.startTime = this.bookingData.startTime;
        this.endTime = this.bookingData.endTime;
        this.date = this.bookingData.date;
      }
    },
  },
};
</script>

<style>
.wrapper {
  display: flex;
  justify-content: space-between;
}

.calendar {
  width: 78%;
}

.sidebar {
  width: 20%;
}

.modal {
  position: fixed;
  width: 22%;
  height: 100vh;
  top: 0;
  right: -22%;
  right: 17%;
  z-index: 3;
  background: #fff;
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
</style>