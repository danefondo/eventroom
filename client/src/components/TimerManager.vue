<template>
  <div>
    <SessionTimer
      v-if="doneLoadingTimes"
      ref="sessiontimer"
      :doneLoadingTimes="doneLoadingTimes"
      :sessionHasStarted="sessionHasStarted"
      :sessionHasFinished="sessionHasFinished"
      :userIsCurrentlyInSession="userIsCurrentlyInSession"
      :nextSessionIsTenMinToStart="nextSessionIsTenMinToStart"
      :tenMinToStartInMS="tenMinToStartInMS"
      :didNextSessionTenMinCheck="didNextSessionTenMinCheck"
      :oneMinToStartInMS="oneMinToStartInMS"
      :didNextSessionOneMinCheck="didNextSessionOneMinCheck"
      :nextSessionStartInMS="nextSessionStartInMS"
      :didSessionStartedCheck="didSessionStartedCheck"
      :nextSessionEndInMS="nextSessionEndInMS"
      :didSessionFinishedCheck="didSessionFinishedCheck"
      :nextSessionIntervalInMS="nextSessionIntervalInMS"
      @checkIfSessionStillThere="getUserNextSession"
    />
  </div>
</template>

<script>
import { mapState } from "vuex";
import { endOfISOWeek } from "date-fns";
import { requestWithAuthentication } from "../config/api";
import SessionTimer from "./SessionTimer";
import { isUserPartnerStillSame } from "../pages/BookingPages/CalendarUtilities/compareHelpers";

export default {
  name: "TimerManager",
  async mounted() {
    await this.getUserNextSession();
    // TODO: For some reason, when setting Vuex data her
    // and even inside 'getUserNextSession' and then calling
    // getUserNextSession from parent BookingDashboard.vue
    // the Vuex data set here gets reset.
  },
  components: {
    SessionTimer,
  },
  props: ["parentName"],
  computed: {
    ...mapState({
      user: (state) => state.auth.user,

      /* Session objects */
      nextSession: (state) => state.cofocus.nextSession,
      currentSession: (state) => state.cofocus.currentSession,

      /* Next session key times in MS */
      nextSessionStartInMS: (state) => state.cofocus.nextSessionStartInMS,
      nextSessionEndInMS: (state) => state.cofocus.nextSessionEndInMS,
      nextSessionIntervalInMS: (state) => state.cofocus.nextSessionIntervalInMS,

      /* Session status states */
      sessionHasStarted: (state) => state.cofocus.sessionHasStarted,
      sessionHasFinished: (state) => state.cofocus.sessionHasFinished,
      nextSessionIsTenMinToStart: (state) =>
        state.cofocus.nextSessionIsTenMinToStart,
      sessionStartedLessThanFiveMinAgo: (state) =>
        state.cofocus.sessionStartedLessThanFiveMinAgo,

      /* User session status states */
      userHasJoinedSessionOnceDuring: (state) =>
        state.cofocus.userHasJoinedSessionOnceDuring,
      userIsCurrentlyInSession: (state) =>
        state.cofocus.userIsCurrentlyInSession,

      /* Session partner status states */
      sessionMatchIsPresent: (state) => state.cofocus.sessionMatchIsPresent,

      /* Status of checks done before session */
      didNextSessionTenMinCheck: (state) =>
        state.cofocus.didNextSessionTenMinCheck,
      didNextSessionOneMinCheck: (state) =>
        state.cofocus.didNextSessionOneMinCheck,
      didSessionFinishedCheck: (state) => state.cofocus.didSessionFinishedCheck,
      didSessionStartedCheck: (state) => state.cofocus.didSessionStartedCheck,

      /* Times before and after session start time in MS (full datetime in MS) */
      oneMinToStartInMS: (state) => state.cofocus.oneMinToStartInMS,
      tenMinToStartInMS: (state) => state.cofocus.tenMinToStartInMS,

      doneLoadingTimes: (state) => state.cofocus.doneLoadingTimes,
      timerHasBeenStarted: (state) => state.cofocus.timerHasBeenStarted,

      timerManagerHasMounted: (state) => state.cofocus.timerManagerHasMounted,
      initialFinalizeCompleted: (state) =>
        state.cofocus.initialFinalizeCompleted,
      refreshTimerQueue: (state) => state.cofocus.refreshTimerQueue,
      currentlyRefreshingNextSession: (state) =>
        state.cofocus.currentlyRefreshingNextSession,
    }),
  },

  methods: {
    async getUserNextSession() {
      // Get everyone's booked sessions for this week from this time forward (no past sessions)
      try {
        if (!this.user || !this.user._id) {
          // return (window.location.href = "/account/login");
          return;
        }
        this.changeState("gettingNextSession", true);
        this.changeState("gettingNextSessionError", false);
        this.changeState("currentlyRefreshingNextSession", true);

        let weekData = this.prepEndOfWeekData();

        const response = await requestWithAuthentication(
          `post`,
          "/api/booking/getUserNextSession",
          weekData
        );

        let nextSession = response.data.result;
        if (response.data.result.NoSessionsThisWeek) {
          this.updateWhenNoNextSessionOrRefreshNotNeeded(true);
          return console.log("@getUserNextSession: No sessions found.");
        }

        // if (!nextSession) throw new Error("Failed to fetch next session.");

        if (response.data.success) {
          this.changeState("firstBookingForWeek", false);
          this.changeState("gettingNextSession", false);
          this.checkIfSameElseSetNew(nextSession);
        }
      } catch (error) {
        console.log("@gettingNextSession Error: ", error);
        this.changeState("gettingNextSession", false);
        this.changeState("gettingNextSessionError", true);
        this.changeState("currentlyRefreshingNextSession", false);
        if (this.refreshTimerQueue.length) {
          this.handleRefreshQueue();
        }
      }
    },

    // I need to check if the session is the same
    // - [] AT DIFF INTERVALS, 10, 1, what else??? and on start
    // also when user comes on the page from another tab
    // or comes on from an idle state and moves mouse or smt

    /* ====== 
    When a new session is requested, a check is performed
    to determine whether the retrieved new session is
    the same as the current existing session or not.

    The purpose is to keep the timer information 
    up to date.

    This is done through checking whether there is
    a current or next session at all. If there is,
    a comparison can be done.
    
    If next session or current session exists, then
    an additional check is done to see whether it's
    the exact same session (by id) or not.

    If it's not, the timer is reset and a new session
    is set in vuex store.

    If the times do not match any longer, the timer
    is also reset, and the up to date next or current
    session is set.  
    ====== */

    checkIfSameElseSetNew(session) {
      // If current or next session exist
      if (this.nextSession) {
        let oldSession = this.nextSession;
        let oldStartInMS = new Date(oldSession.dateTime).valueOf();
        let sessionStartInMS = new Date(session.dateTime).valueOf();
        // If existing session time is same as new session
        if (sessionStartInMS == oldStartInMS) {
          // If existing session id is same as new session
          if (session._id !== oldSession._id) {
            this.resetSessionAndTimer();
            this.setNextOrCurrentSession(session);
          }
          // If previous user partner is still same
          else if (!isUserPartnerStillSame(oldSession, session)) {
            this.resetSessionAndTimer();
            this.setNextOrCurrentSession(session);
          }

          // In the case nothing needs changing, the
          // currentlRefreshingNextSession needs to be set
          // to false, and refreshQueue to empty array.
          else {
            console.log("@TimerManager: No refresh needed.");
            this.updateWhenNoNextSessionOrRefreshNotNeeded();
          }
        } else {
          this.resetSessionAndTimer();
          this.setNextOrCurrentSession(session);
        }
      } else {
        this.setNextOrCurrentSession(session);
      }
    },

    setNextOrCurrentSession(session) {
      if (session) {
        let sessionStartInMS = new Date(session.dateTime).valueOf();
        let sessionIntervalInMS = session.sessionInterval * 60 * 1000;
        let sessionEndInMS = sessionStartInMS + sessionIntervalInMS;
        let sessionEndInMSBuffer = sessionEndInMS + 2 * 60 * 1000;
        let nowInMS = Date.now();

        // If current time is more than or equal to session end time
        let isOldSession = nowInMS >= sessionEndInMS;

        // If current time is between session start & end time + buffer
        let isCurrentSession =
          nowInMS >= sessionStartInMS && nowInMS < sessionEndInMSBuffer;

        // If current time is less than session start time
        let isUpcomingSession = nowInMS < sessionStartInMS;

        if (isOldSession) {
          this.getUserNextSession(); // Received old session, try getting again
        } else if (isCurrentSession) {
          this.changeState("nextSession", session);
          this.changeState("currentSession", session);
          this.startCountdownToNextSession();
        } else if (isUpcomingSession) {
          this.changeState("nextSession", session);
          this.changeState("currentSession", null);
          this.startCountdownToNextSession();
        }
      } else {
        this.changeState("nextSession", null);
        this.changeState("currentSession", null);
      }
    },

    startCountdownToNextSession() {
      /* Set session start time in MS */
      let nextSessionStart = this.nextSession.dateTime;
      let nextSessionStartInMS = new Date(nextSessionStart).valueOf();
      this.changeState("nextSessionStartInMS", nextSessionStartInMS);

      /* Set session interval time in MS */
      let nextSessionIntervalInMin = this.nextSession.sessionInterval;
      let nextSessionIntervalInMS = nextSessionIntervalInMin * 60 * 1000;
      this.changeState("nextSessionIntervalInMS", nextSessionIntervalInMS);

      /* Set session end time in MS */
      let nextSessionEndInMS = nextSessionStartInMS + nextSessionIntervalInMS;
      this.changeState("nextSessionEndInMS", nextSessionEndInMS);

      /* Set session timer checkpoint times */
      let oneMinToStartInMS = nextSessionStartInMS - 60 * 1000;
      let tenMinToStartInMS = nextSessionStartInMS - 600 * 1000;
      this.changeState("oneMinToStartInMS", oneMinToStartInMS);
      this.changeState("tenMinToStartInMS", tenMinToStartInMS);

      // console.log("Enter land of the tick!");
      this.$nextTick(() => {
        this.finalizeRefresh();
      });
    },

    finalizeRefresh() {
      this.$store.dispatch(
        "calendar/updateCalendarCurrentSessionSlot",
        this.nextSession
      );

      this.changeState("currentlyRefreshingNextSession", false);

      if (this.timerHasBeenStarted) {
        this.startTimer();
      }

      if (this.refreshTimerQueue.length) {
        this.handleRefreshQueue();
      }

      if (
        !this.initialFinalizeCompleted ||
        !this.doneLoadingTimes ||
        !this.timerManagerHasMounted
      ) {
        this.setInitialChecksAsComplete();
      }
    },

    async handleRefreshQueue() {
      console.log("@TimerManager: Refresh Queue.");
      this.$store.dispatch("cofocus/clearRefreshQueue");

      if (this.currentlyRefreshingNextSession) {
        this.$store.dispatch("cofocus/pushToRefreshQueue");
        console.log("@TimerManager: Adding to refresh queue.");
      } else if (this.timerManagerHasMounted && this.initialFinalizeCompleted) {
        this.changeState("currentlyRefreshingNextSession", true);
        console.log("@TimerManager: Initializing refresh from queue.");
        await this.getUserNextSession();
      }
    },

    setInitialChecksAsComplete() {
      this.changeState("doneLoadingTimes", true);
      this.changeState("initialFinalizeCompleted", true);
      this.changeState("timerManagerHasMounted", true);
    },

    startTimer() {
      if (this.$route.meta.session) {
        this.$refs.sessiontimer.startTimer();
      } else if (this.$route.meta.calendar) {
        this.$refs.sessiontimer.startTimer();
      }
    },

    resetSessionAndTimer() {
      if (this.$route.meta.session) {
        this.$refs.sessiontimer.resetSessionAndTimer();
      } else if (this.$route.meta.calendar) {
        this.$refs.sessiontimer.resetSessionAndTimer();
      }
    },

    async hardRefreshTimerAndNextSession() {
      this.resetSessionAndTimer();
      await this.getUserNextSession();
    },

    prepEndOfWeekData() {
      let endOfWeekDate = endOfISOWeek(new Date());

      let twoHoursInMS = 2 * 60 * 60 * 1000;

      // Add +2 hours to end of this week to account for midnight for all intervals
      let endOfWeekPlusTwoHours = new Date(
        endOfWeekDate.valueOf() + twoHoursInMS
      );

      let weekData = {
        endOfWeekPlusTwoHours: endOfWeekPlusTwoHours,
        userId: this.user._id,
      };

      return weekData;
    },

    /* ====== 
    Cover cases when execution flow stops before reaching end
    ====== */
    updateWhenNoNextSessionOrRefreshNotNeeded(noSessions = false) {
      if (noSessions) {
        this.changeState("firstBookingForWeek", true);
        // Remove hasCurrentOrNextSession from all slots
        this.$store.dispatch("calendar/resetCalendarCurrentSessionSlot");
      } else {
        // This is here in case a full re-render happens
        // to the calendar data, which removes 'hasCurrentOrNextSession'
        // from calendar data, but does not reset the timer
        this.$store.dispatch(
          "calendar/updateCalendarCurrentSessionSlot",
          this.nextSession
        );
      }

      this.changeState("currentlyRefreshingNextSession", false);

      if (this.refreshTimerQueue.length) {
        this.handleRefreshQueue();
      }
    },

    changeState(field, newValue) {
      let dispatchObject = { field, newValue };
      this.$store.dispatch("cofocus/changeSingleState", dispatchObject);
    },
  },
};
</script>