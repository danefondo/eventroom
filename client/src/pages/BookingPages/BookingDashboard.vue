<template>
  <div class="cofocus">
    <Alert
      :showAlert="showAlert"
      :alertStyle="alertStyle"
      :alertMessage="alertMessage"
    />
    <div class="wrapper">
      <div class="calendar-container">
        <div class="calendar">
          <Switcher
            v-if="weekStartDay && weekEndDay && currentWeekStart"
            ref="switcher"
            :weekStartDay="weekStartDay"
            :weekEndDay="weekEndDay"
            :currentWeekStart="currentWeekStart"
            :originalWeekStart="originalWeekStart"
            :week="week"
            :currentSelectedDay="currentSelectedDay"
            :currentlyRefreshingData="currentlyRefreshingData"
            @initCalendar="initCalendar"
            @scrollToCurrentHour="scrollToCurrentHour"
            @refreshCalendarData="getAllBookedUsersForSpecificWeek(true, true)"
          />
          <Table
            v-if="weekDates && weekStartDay && weekEndDay"
            :user="user"
            :selectedToBook="selectedToBook"
            :currentlyBooking="currentlyBooking"
            :selectedInterval="selectedInterval"
            :bookingInterval="bookingInterval"
            :selectedSlotDateTime="selectedSlotDateTime"
            :selectedSlotStartTime="selectedSlotStartTime"
            :selectedSlotDateString="selectedSlotDateString"
            :rowNumberForWeekOrDay="rowNumberForWeekOrDay"
            :weekDates="weekDates"
            :minimumTime="minimumTime"
            :maximumTime="maximumTime"
            :calendarData="calendarData"
            :allUserSessions="allUserSessions"
            :nextSession="nextSession"
            :currentSession="currentSession"
            :nextSessionIsTenMinToStart="nextSessionIsTenMinToStart"
            :currentWeekStart="currentWeekStart"
            :currentSelectedDay="currentSelectedDay"
            :week="week"
            :lastMinInMS="lastMinInMS"
            @refreshNextOrCurrentSession="refreshNextOrCurrentSession"
            @hardRefreshTimerAndNextSession="hardRefreshTimerAndNextSession"
          />
        </div>
        <div class="sidebar">
          <div class="widgets">
            <TimerManager ref="timer" parentName="booking" />
            <Booker
              :user="user"
              :allUserSessions="allUserSessions"
              :calendarData="calendarData"
              :selectedInterval="selectedInterval"
              :selectedToBook="selectedToBook"
              :currentlyBooking="currentlyBooking"
              :selectedSlotName="selectedSlotName"
              :selectedSlotStartTime="selectedSlotStartTime"
              :selectedSlotDateString="selectedSlotDateString"
              @refreshNextOrCurrentSession="refreshNextOrCurrentSession"
            />
          </div>
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
import Alert from "../../components/Alert";
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
  endOfISOWeek,
  isSameWeek,
  startOfDay,
  getHours,
  getMinutes,
  format,
} from "date-fns";

export default {
  name: "BookingDashboard",
  data() {
    return {
      alertMessage: "",
      alertStyle: "",
      showAlert: false,

      databaseSyncTimer: "",

      pastHourTimer: "",

      gettingBookedSessions: false,
      gettingBookedSessionsError: false,
      gettingAllBookedSessions: false,
      gettingAllBookedSessionsError: false,

      interval: 15,

      height: 100,

      iterativeRefreshInterval: 2 * 60 * 1000,

      currentlyRefreshingData: false,
    };
  },
  computed: {
    ...mapState({
      user: (state) => state.auth.user,
      isAuthenticated: (state) => state.auth.authenticationStatus,
      isVerified: (state) => state.auth.verificationStatus,
      calendarData: (state) => state.calendar.calendarData,
      allUserSessions: (state) => state.calendar.allUserSessions,
      weekDates: (state) => state.calendar.weekDates,
      weekStartDay: (state) => state.calendar.weekStartDay,
      weekEndDay: (state) => state.calendar.weekEndDay,
      currentSelectedDay: (state) => state.calendar.currentSelectedDay,
      currentWeekStart: (state) => state.calendar.currentWeekStart,
      originalWeekStart: (state) => state.calendar.originalWeekStart,
      rowNumberForWeekOrDay: (state) => state.calendar.rowNumberForWeekOrDay,
      week: (state) => state.calendar.week,
      lastMinInMS: (state) => state.calendar.lastMinInMS,

      selectedInterval: (state) => state.booking.selectedInterval,
      bookingInterval: (state) => state.booking.bookingInterval,
      currentlyBooking: (state) => state.booking.currentlyBooking,
      selectedToBook: (state) => state.calendar.selectedToBook,

      selectedSlotName: (state) => state.booking.selectedSlotName,
      selectedSlotDateTime: (state) => state.booking.selectedSlotDateTime,
      selectedSlotStartTime: (state) => state.booking.selectedSlotStartTime,
      selectedSlotDateString: (state) => state.booking.selectedSlotDateString,

      minimumTime: (state) => state.calendar.minimumTime,
      maximumTime: (state) => state.calendar.maximumTime,

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

      firstBookingForWeek: (state) => state.cofocus.firstBookingForWeek,
    }),
  },
  components: {
    TimerManager,
    Switcher,
    Table,
    Booker,
    Alert,
  },
  beforeRouteLeave(to, from, next) {
    this.cleanBeforeLeave(true, next);
  },
  async mounted() {
    // console.log("@Step 1: Render calendar structure.");
    await this.initCalendar();
    this.scrollToCurrentHour();

    // console.log("@Step 2: Join Cofocus socket port.");
    this.$socket.emit("joinCofocusCalendar", "cofocus");

    // console.log("@Step 3: Start listening to pushes and cancels.");
    if (this.user.preferences.calendarPreferences.preferRealTimeUpdates) {
      this.startReceivingBookedSessions();
      this.startReceivingCanceledSessions();
    }
    // Consider also listening to 'rematches'.

    // console.log("@Step 4: Setup cleaning for when you leave.");
    let globalThis = this;
    window.onbeforeunload = () => {
      globalThis.cleanBeforeLeave();
    };

    // ON TIMERS: https://stackoverflow.com/a/2553507

    // Sync calendar data with database
    // (make iterative check, to only update if change)
    this.databaseSyncTimer = setInterval(
      this.syncCalendarWithDatabase,
      this.iterativeRefreshInterval
    );

    this.pastHourTimer = setInterval(this.updateLastMinInMS, 1 * 60 * 1000);
  },
  methods: {
    async cleanBeforeLeave(fromBeforeLeave = false, next = null) {
      this.sockets.unsubscribe("receivePushedSessions");
      this.sockets.unsubscribe("receiveCanceledSessions");

      await this.$refs.timer.resetSessionAndTimer();

      // this.resetData();
      clearInterval(this.databaseSyncTimer);
      clearInterval(this.pastHourTimer);
      if (fromBeforeLeave && next !== null) {
        next();
      }
    },

    updateLastMinInMS() {
      this.$store.dispatch("calendar/updateLastMinInMS");
    },

    scrollToCurrentHour() {
      let now = new Date();
      let hours = getHours(now);
      let minutes = getMinutes(now);

      if (minutes >= 0 && minutes < 15) {
        minutes = "00";
      } else if (minutes >= 15 && minutes < 30) {
        minutes = "15";
      } else if (minutes >= 30 && minutes < 45) {
        minutes = "30";
      } else if (minutes >= 45 && minutes < 60) {
        minutes = "45";
      }

      let rowHour = new Date(null, null, null, hours, minutes);
      rowHour = format(rowHour, "HH:mm");

      let rowHourElement = document.querySelector(
        `[data-rowhour="${rowHour}"]`
      );

      // rowHourElement.closest("tbody").scrollTop =
      //   rowHourElement.offsetTop - 200;

      var elementPosition = rowHourElement.getBoundingClientRect().top;
      var offsetPosition = elementPosition - 300;

      rowHourElement.closest("tbody").scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });

      rowHourElement.closest("tbody").scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    },

    async refreshNextOrCurrentSession() {
      if (this.currentlyRefreshingNextSession) {
        this.$store.dispatch("cofocus/pushToRefreshQueue");
      } else if (this.timerManagerHasMounted && this.initialFinalizeCompleted) {
        await this.$refs.timer.getUserNextSession();
      } else if (this.firstBookingForWeek) {
        // Bypass case of timer not having mounted yet
        await this.$refs.timer.getUserNextSession();
      }
    },

    // Mainly used after canceling a session
    // that is the current or next session
    async hardRefreshTimerAndNextSession() {
      await this.$refs.timer.hardRefreshTimerAndNextSession();
    },

    startReceivingBookedSessions() {
      this.sockets.subscribe("receiveBookedSessions", (sessions) => {
        console.log("received", sessions);
        this.updateCalendarPostReceive(sessions);
      });
    },

    startReceivingCanceledSessions() {
      this.sockets.subscribe("receiveCanceledSessions", (sessions) => {
        console.log("received canceled", sessions);
        this.updateCalendarPostReceive(sessions, true);
      });
    },

    updateCalendarPostReceive(sessions, cancel = false) {
      if (sessions.length) {
        let updateData = {
          sessions,
          userId: this.user._id,
        };

        if (cancel) {
          updateData.cancel = true;
        }

        this.$store.dispatch("calendar/updateCalendarAfterReceive", updateData);
      }

      this.$nextTick(() => {
        console.log("will update availability");
        this.updateCalendarAvailability();
      });
    },

    displayAlert(messageNum) {
      if (messageNum == 0) {
        this.alertMessage = "Successfully refreshed calendar data!";
        this.alertStyle =
          "background-color: #e1fff8; color: #333; width: 350px;";
      }
      this.showAlert = true;

      setTimeout(this.resetAlert, 3000);
    },

    resetAlert() {
      this.showAlert = false;
      this.alertMessage = "";
      this.alertStyle = "";
    },

    async getAllBookedUsersForSpecificWeek(refresh = false, manual = false) {
      try {
        if (!this.user || !this.user._id) {
          return (window.location.href = "/");
        }
        if (refresh && !this.currentlyRefreshingData) {
          this.currentlyRefreshingData = true;
        } else if (this.currentlyRefreshingData) {
          return;
        }

        this.gettingAllBookedSessions = true;

        let query = "getAllBookedUsersForSpecificWeek";
        let dataToPass = { userId: this.user._id };

        if (!this.week) {
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

        console.log("sessionsALLBOOKEDPEOPLE", allBookedSessions);

        if (response.data.success) {
          this.gettingAllBookedSessions = false;
          // console.log(refresh);

          if (refresh) {
            this.iterativeRefreshCalendarSessions(allBookedSessions, manual);
          } else {
            let updateData = {
              sessions: allBookedSessions,
              userId: this.user._id,
            };
            this.$store.dispatch(
              "calendar/pushManyCalendarSessions",
              updateData
            );
          }
        }
      } catch (error) {
        console.log("@gettingBookedSessions Error: ", error);
        this.gettingBookedSessions = false;
        this.gettingBookedSessionsError = true;
      }
    },

    // exitAllCanceling() {
    //    this.selectedToBook.forEach((slotData) => {
    //     this.updateCalendarSelectedSlots(slotData, false, true, 0);
    //   });

    //   this.$store.dispatch("booking/clearAllCanceling");
    // },

    /* ====== DATABASE SYNCING -- HARD REFRESH SWAP OLD DATA WITH NEW ====== */

    hardRefreshCalendarSessions(sessions) {
      let updateData = {
        sessions,
        userId: this.user._id,
      };

      this.$store.dispatch("calendar/hardRefreshCalendarSessions", updateData);

      this.updateCalendarStates();
    },

    /* ====== ITERATIVE DATABASE SYNCING ====== */

    iterativeRefreshCalendarSessions(sessions, manual = false) {
      let updateData = {
        updatedSessions: sessions,
        userId: this.user._id,
      };

      this.$store.dispatch(
        "calendar/iterativeRefreshCalendarSessions",
        updateData
      );

      this.updateCalendarStates();
      this.currentlyRefreshingData = false;
      if (manual) {
        this.displayAlert(0);
      }
    },

    /* ====== CALENDAR RENDERING ====== */

    renderCalendar() {
      let configData = {
        maximumTime: this.maximumTime,
        minimumTime: this.minimumTime,
        interval: this.interval,
        week: this.week,
        currentWeekStart: this.currentWeekStart,
        currentSelectedDay: this.currentSelectedDay,
      };
      configData = JSON.parse(JSON.stringify(configData));
      let calendarData = generateCalendarData(configData);
      // + nextTick
      this.$store.dispatch("calendar/setCalendarData", calendarData);
    },

    updateCalendarAvailability() {
      console.log("Update calendar availability.");
      this.$store.dispatch("calendar/updateCalendarSlotAvailability", 0);
      this.$store.dispatch("calendar/updateCalendarSlotAvailability", 1);
      // this.$store.dispatch("calendar/setCalendarPastSessions");

      this.refreshNextOrCurrentSession();
    },

    removeSelectionsInThePast() {
      this.$store.dispatch("calendar/removeSelectionsInThePast");
    },

    async syncCalendarWithDatabase() {
      await this.getAllBookedUsersForSpecificWeek(true);
      this.updateCalendarStates();
      this.$refs.switcher.changeWeekIfNecessary();
    },

    async initCalendar() {
      if (this.week) {
        this.setWeekData();
      } else {
        this.setDayData();
      }
      this.renderCalendar();
      await this.getAllBookedUsersForSpecificWeek();
      this.updateCalendarStates();

      /**
       * Does not currently work, because when returning to
       * the current week and some scrolling has been done,
       * the result will be incorrect.
       */
      // this.scrollToCurrentHourIfNecessary();
    },

    async setWeekData() {
      let startOfPeriod = this.currentWeekStart;
      let newStartOfWeek = new Date(startOfPeriod.valueOf());
      let dates = getWeekDates(newStartOfWeek);
      this.$store.dispatch("calendar/setCalendarWeekDates", dates);
    },

    async setDayData() {
      let currentSelectedDay = new Date(this.currentSelectedDay.valueOf());
      let dates = getDayDate(currentSelectedDay);
      this.$store.dispatch("calendar/setCalendarDayDate", dates);
    },

    renderSavedSelectionsIfAny() {
      if (this.selectedToBook.length) {
        this.selectedToBook.forEach((slotData) => {
          let slot = JSON.parse(JSON.stringify(slotData));

          let updateData = {
            targetSlot: slot,
            newSlotState: true,
            all: false,
            field: 0,
          };

          this.$store.dispatch(
            "calendar/updateCalendarSelectedSlots",
            updateData
          );
        });
      }
    },

    updateCalendarStates() {
      this.removeSelectionsInThePast();
      this.renderSavedSelectionsIfAny();

      this.$nextTick(() => {
        this.updateCalendarAvailability();
      });
    },

    /* ====== CALENDAR NAVIGATION ====== */

    /**
     * When user navigates between weeks
     * and arrives at the current week
     * which is the original week
     * scroll their calendar to the current hour.
     */
    scrollToCurrentHourIfNecessary() {
      let originalStart = this.originalWeekStart;
      let selectedWeek = this.currentWeekStart;
      if (isSameWeek(selectedWeek, originalStart)) {
        this.scrollToCurrentHour();
      }
    },
  },
};
</script>