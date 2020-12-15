<template>
  <div class="cofocus">
    <div class="wrapper">
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
          <Table
            v-if="weekDates && weekStartDay && weekEndDay"
            :user="user"
            :selectedToBook="selectedToBook"
            :currentlyBooking="currentlyBooking"
            :rowNumberForWeekOrDay="rowNumberForWeekOrDay"
            :weekDates="weekDates"
            :calendarData="calendarData"
            :nextSession="nextSession"
            :currentSession="currentSession"
            :nextSessionIsTenMinToStart="nextSessionIsTenMinToStart"
            :currentWeekStart="currentWeekStart"
            :currentSelectedDay="currentSelectedDay"
            :week="week"
            @refreshNextOrCurrentSession="refreshNextOrCurrentSession"
          />
        </div>
        <div class="sidebar">
          <TimerManager ref="timer" parentName="booking" />
          <Booker
            :user="user"
            :selectedToBook="selectedToBook"
            :currentlyBooking="currentlyBooking"
            :selectedSlotName="selectedSlotName"
            @refreshNextOrCurrentSession="refreshNextOrCurrentSession"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
/**

 Most efficient way of rendering calendar and its contents?

1. First pre-render calendar layout based on configuration
2. Then begin displaying sessions based on config
3. CSS based on config, e.g. height of a box
4. Time starts by default either from 12AM Monday OR your specified time slot

This app needs to be the absolute fastest.
We hate slow apps. With our guts.
Life's too short for a bad app experience.
No more shitty product experiences.
Enough is enough.
Welcome to Cofocus.

 */

import { requestWithAuthentication } from "../../config/api";
import { mapState } from "vuex";
import TimerManager from "../../components/TimerManager";
import {
  generateCalendarData,
  getWeekDates,
  getDayDate,
} from "./CalendarUtilities/generateCalendar";

import Switcher from "./CalendarComponents/Switcher";
import Table from "./CalendarComponents/Table";
import Booker from "./CalendarComponents/Booker";

import {
  endOfDay,
  startOfISOWeek,
  endOfISOWeek,
  isSameWeek,
  startOfDay,
} from "date-fns";

// import { 
//   initializeSocket,
//   closeSocket,
// } from "./CalendarUtilities/calendarSocketHandlers";

export default {
  name: "BookingDashboard",
  data() {
    return {
      databaseSyncTimer: "",

      gettingBookedSessions: false,
      gettingBookedSessionsError: false,
      gettingAllBookedSessions: false,
      gettingAllBookedSessionsError: false,

      interval: 15,

      height: 100,
    };
  },
  computed: {
    ...mapState({
      user: (state) => state.auth.user,
      isAuthenticated: (state) => state.auth.authenticationStatus,
      isVerified: (state) => state.auth.verificationStatus,

      calendarData: (state) => state.calendar.calendarData,                     // cleaned
      weekDates: (state) => state.calendar.weekDates,                           // cleaned
      weekStartDay: (state) => state.calendar.weekStartDay,                     // cleaned
      weekEndDay: (state) => state.calendar.weekEndDay,                         // cleaned
      currentSelectedDay: (state) => state.calendar.currentSelectedDay,         // cleaned
      currentWeekStart: (state) => state.calendar.currentWeekStart,             // cleaned
      rowNumberForWeekOrDay: (state) => state.calendar.rowNumberForWeekOrDay,   // cleaned ish
      week: (state) => state.calendar.week,

      currentlyBooking: (state) => state.booking.currentlyBooking,
      selectedToBook: (state) => state.booking.selectedToBook,                 // cleaned

      selectedSlotName: (state) => state.booking.selectedSlotName,

      // constants
      // minimumTime: (state) => state.calendar.minimumTime,                       // unsure
      // maximumTime: (state) => state.calendar.maximumTime,                       // unsure

      // cofocus 
      nextSession: (state) => state.cofocus.nextSession,
      currentSession: (state) => state.cofocus.currentSession,
      nextSessionIsTenMinToStart: (state) =>
        state.cofocus.nextSessionIsTenMinToStart,

      timerManagerHasMounted: (state) => state.cofocus.timerManagerHasMounted,
      initialFinalizeCompleted: (state) =>
        state.cofocus.initialFinalizeCompleted,
      refreshTimerQueue: (state) => state.cofocus.refreshTimerQueue,
      currentlyRefreshingNextSession: (state) =>
        state.cofocus.currentlyRefreshingNextSession,
    }),
  },
  components: {
    TimerManager,
    Switcher,
    Table,
    Booker,
  },
  beforeRouteLeave(to, from, next) {
    this.cleanBeforeLeave(true, next);
  },
  created() {
    // console.log("@Step 1: Render calendar structure.");
    this.initWeekCalendar();

    // console.log("@Step 4: Setup cleaning for when you leave.");
    let globalThis = this;
    window.onbeforeunload = () => {
      globalThis.cleanBeforeLeave();
    };

    // Sync calendar data with database
    // (make iterative check, to only update if change)
    this.databaseSyncTimer = setInterval(
      this.syncCalendarWithDatabase,
      2 * 60 * 1000
    );
  },
  methods: {
    cleanBeforeLeave(fromBeforeLeave = false, next = null) {
      this.sockets.unsubscribe("receivePushedSessions");
      this.sockets.unsubscribe("receiveCanceledSessions");
      // closeSocket();
      // this.resetData();
      clearInterval(this.databaseSyncTimer);
      if (fromBeforeLeave && next !== null) {
        next();
      }
    },

    changeState(field, newValue) {
      let dispatchObject = { field, newValue };
      this.$store.dispatch("cofocus/changeSingleState", dispatchObject);
    },

    async refreshNextOrCurrentSession() {
      if (this.currentlyRefreshingNextSession) {
        this.$store.dispatch("cofocus/pushToRefreshQueue");
      } else if (this.timerManagerHasMounted && this.initialFinalizeCompleted) {
        console.log("Let's refresh IN BOOKING.");
        await this.$refs.timer.getUserNextSession();
      }
    },

    async getAllBookedUsersForSpecificWeek(refresh = false, day = false) {
      try {
        if (!this.user || !this.user._id) {
          return (window.location.href = "/");
        }
        this.gettingAllBookedSessions = true;

        let query = "getAllBookedUsersForSpecificWeek";
        let dataToPass = { userId: this.user._id };

        if (day) {
          query = "getBookedSessionsForOneDay";
          dataToPass.startOfDay = startOfDay(this.currentSelectedDay);
          dataToPass.endOfDay = endOfDay(this.currentSelectedDay);
        } else {
          let startOfWeekDate = this.currentWeekStart;
          dataToPass.startOfWeekDate = startOfWeekDate;
          let endOfWeekDate = new Date(this.currentWeekStart.valueOf());
          dataToPass.endOfWeekDate = endOfISOWeek(endOfWeekDate);
        }

        const response = await requestWithAuthentication(
          `post`,
          `/api/booking/${query}`,
          dataToPass
        );

        let allBookedSessions = response.data.result;
        if (!allBookedSessions)
          throw new Error("Failed to fetch general sessions.");

        // console.log("sessionsALLBOOKEDPEOPLE", allBookedSessions);

        if (response.data.success) {
          this.gettingAllBookedSessions = false;
          // console.log(refresh);

          if (refresh) {
            this.iterativeRefreshCalendarSessions(allBookedSessions);
          } else {
            console.log("response successful")
            // let updateData = {
            //   sessions: allBookedSessions,
            //   userId: this.user._id,
            // };
            // this.$store.dispatch(
            //   "calendar/pushManyCalendarSessions",
            //   updateData
            // );
          }
        }
      } catch (error) {
        console.log("@gettingBookedSessions Error: ", error);
        this.gettingBookedSessions = false;
        this.gettingBookedSessionsError = true;
      }
    },


    /* ====== DATABASE SYNCING -- HARD REFRESH SWAP OLD DATA WITH NEW ====== */

    // removed

    /* ====== ITERATIVE DATABASE SYNCING ====== */

    iterativeRefreshCalendarSessions(sessions) {
      let updateData = {
        updatedSessions: sessions,
        userId: this.user._id,
      };

      this.$store.dispatch(
        "calendar/iterativeRefreshCalendarSessions",
        updateData
      );

      this.$nextTick(() => {
        this.updateCalendarAvailability();
      });
    },

    /* ====== CALENDAR RENDERING ====== */

    renderCalendar() {
      let configData = {
        maximumTime: "23:59",
        minimumTime: "00:00",
        interval: this.interval,
        week: this.week,
        currentWeekStart: this.currentWeekStart,
        currentSelectedDay: this.currentSelectedDay,
      };
      console.log("@renderCalendar: config: ", configData);
      // configData = JSON.parse(JSON.stringify(configData)); // unnecessary since copy anyway
      let calendarData = generateCalendarData(configData);
      // + nextTick
      this.$store.dispatch("calendar/setCalendarData", calendarData);
    },

    updateCalendarAvailability() {
      console.log("Update calendar availability.");
      this.$store.dispatch("calendar/updateCalendarSlotAvailability", 0);
      this.$store.dispatch("calendar/updateCalendarSlotAvailability", 1);

      this.refreshNextOrCurrentSession();
    },

    removeSelectionsInThePast() {
      this.$store.dispatch("booking/removeSelectionsInThePast");
    },

    async syncCalendarWithDatabase() {
      if (this.week) {
        await this.getAllBookedUsersForSpecificWeek(true);
      } else {
        await this.getAllBookedUsersForSpecificWeek(true, true);
      }
      this.removeSelectionsInThePast();
      this.renderSavedSelectionsIfAny();
      this.$nextTick(() => {
        this.updateCalendarAvailability();
      });
    },

    async updateDayViewData() {
      this.renderCalendar();
      await this.getAllBookedUsersForSpecificWeek(false, true);
      this.renderSavedSelectionsIfAny();
    },

    async initWeekCalendar() {
      let startOfPeriod = this.currentWeekStart;
      let newStartOfWeek = new Date(startOfPeriod.valueOf());
      let dates = getWeekDates(newStartOfWeek);
      console.log("@initweekCalendar: thiscurrentWeekStart", startOfPeriod);
      console.log("@initweekCalendar: newStartOfWeek", newStartOfWeek);
      console.log("@initweekCalendar: dates", dates);
      this.$store.dispatch("calendar/setCalendarWeekDates", dates);
      // TODO await both or smth
      this.renderCalendar();
      await this.getAllBookedUsersForSpecificWeek();
      this.renderSavedSelectionsIfAny();
      this.$nextTick(function () {
        this.updateCalendarAvailability();
      });
    },

    async initDayCalendar() {
      // TODO cleanup
      let currentSelectedDay = new Date(this.currentSelectedDay.valueOf());
      let dates = getDayDate(currentSelectedDay);
      this.$store.dispatch("calendar/setCalendarDayDate", dates);

      this.renderCalendar();
      await this.getAllBookedUsersForSpecificWeek(false, true);
      this.renderSavedSelectionsIfAny();
      this.$nextTick(() => {
        this.updateCalendarAvailability();
      });
    },

    renderSavedSelectionsIfAny() {
      const updateData = {
        slotDateTimeArray: this.selectedToBook,
        newSlotState: true,
        field: "isSelected",
      }
      this.$store.dispatch("calendar/updateManySlotsByDateTime", updateData);
    },

    /* ====== CALENDAR NAVIGATION ====== */

    async toggleDayWeekView() {
      this.$store.dispatch("calendar/toggleWeekOrDay");
      // If week == current week, set currentDay to today
      this.setNewCurrentDay();
      if (this.week) {
        let number = 7;
        this.$store.dispatch("calendar/setRowNumberForWeekOrDay", number);
        await this.initWeekCalendar();
      } else {
        let number = 1;
        this.$store.dispatch("calendar/setRowNumberForWeekOrDay", number);
        await this.initDayCalendar();
      }
    },

    setNewCurrentDay() {
      // if new week start = current time week start
      // --> then set today as selected day
      // else if any other week, set start of week as day
      let newWeekStart = this.currentWeekStart;
      let todayWeekStart = startOfISOWeek(new Date());
      let checkIfSameWeek = isSameWeek(newWeekStart, todayWeekStart);
      if (checkIfSameWeek) {
        this.$store.dispatch("calendar/setCurrentSelectedDayAsToday");
      } else {
        this.$store.dispatch("calendar/setCurrentSelectedDayAsStartOfWeek");
      }
    },

    async switchWeek(newWeekStart) {
      this.$store.dispatch("calendar/setCurrentWeekStart", newWeekStart);
      this.setNewCurrentDay();
      await this.initWeekCalendar();
    },

    async switchDay(newSelectedDay) {
      this.$store.dispatch("calendar/setCurrentSelectedDay", newSelectedDay);
      // In case week changes, set up current week to match day's week
      let isoWeekStart = startOfISOWeek(this.currentSelectedDay);
      isoWeekStart = new Date(isoWeekStart);
      this.$store.dispatch("calendar/setCurrentWeekStart", isoWeekStart);
      await this.initDayCalendar();
    },

    async setToToday() {
      this.$store.dispatch("calendar/setCurrentWeekStartToThisWeekStart");
      this.$store.dispatch("calendar/setCurrentSelectedDayAsToday");
      if (this.week) {
        await this.initWeekCalendar();
      } else {
        await this.initDayCalendar();
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
  padding-top: 35px;
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
</style>