<template>
  <div>
    <div
      v-if="
        doneLoadingTimes && nextSessionIsTenMinToStart && !sessionHasStarted
      "
    >
      {{ `Hack session starting with Tony Stark in ${getTimeLeft} minutes.` }}
    </div>
    <div
      v-else-if="
        doneLoadingTimes &&
        sessionHasStarted &&
        !sessionHasFinished &&
        userIsCurrentlyInSession
      "
    >
      {{ `Hack sessions ends in ${getTimeLeft} minutes.` }}
    </div>
    <div
      v-else-if="
        doneLoadingTimes &&
        sessionHasStarted &&
        !sessionHasFinished &&
        !userIsCurrentlyInSession
      "
    >
      {{ `Please get back in the session. Ends in ${getTimeLeft} minutes.` }}
    </div>
    <div v-else-if="sessionHasFinished">
      {{ `Session has completed.` }}
    </div>
    <TimerChecks
      ref="timerchecks"
      :tenMinToStartInSec="tenMinToStartInSec"
      :didNextSessionTenMinCheck="didNextSessionTenMinCheck"
      :nextSessionIsTenMinToStart="nextSessionIsTenMinToStart"
      :oneMinToStartInSec="oneMinToStartInSec"
      :didNextSessionOneMinCheck="didNextSessionOneMinCheck"
      :nextSessionStartInSec="nextSessionStartInSec"
      :didSessionStartedCheck="didSessionStartedCheck"
      :nextSessionEndInSec="nextSessionEndInSec"
      :didSessionFinishedCheck="didSessionFinishedCheck"
      @checkIfSessionStillThere="checkIfSessionStillThere"
    />
  </div>
</template>

<script>
import { mapState } from "vuex";
import { endOfISOWeek } from "date-fns";
import { requestWithAuthentication } from "../config/api";
import TimerChecks from "./TimerChecks";

function initialDataState() {
  return {
    /* Next session querying status */
    gettingNextSession: false,
    gettingNextSessionError: false,

    /* Timer numbers */
    timerInterval: null,
    currentTimeInSec: 0,
  };
}

export default {
  name: "TimerManager",
  data: function () {
    return initialDataState();
  },

  async mounted() {
    await this.getUserNextSession();
  },

  components: {
    TimerChecks,
  },

  computed: {
    ...mapState({
      user: (state) => state.auth.user,

      /* Session objects */
      nextSession: (state) => state.cofocus.nextSession,
      currentSession: (state) => state.cofocus.currentSession,

      /* Next session key times in sec */
      nextSessionStartInSec: (state) => state.cofocus.nextSessionStartInSec,
      nextSessionEndInSec: (state) => state.cofocus.nextSessionEndInSec,
      nextSessionIntervalInSec: (state) =>
        state.cofocus.nextSessionIntervalInSec,

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

      /* Times before and after session start time in seconds (full datetime in seconds) */
      oneMinToStartInSec: (state) => state.cofocus.oneMinToStartInSec,
      tenMinToStartInSec: (state) => state.cofocus.tenMinToStartInSec,

      doneLoadingTimes: (state) => state.cofocus.doneLoadingTimes,
    }),

    getTimeLeft() {
      let timeLeft = this.timeLeft - this.nextSessionIntervalInSec;
      if (this.sessionHasStarted) {
        timeLeft = this.timeLeft;
      }
      console.log("Next session start: ", timeLeft);
      const minutes = Math.floor(timeLeft / 60);
      let seconds = timeLeft % 60;

      if (seconds < 10) {
        seconds = `0${seconds}`;
      }
      console.log("first??: ", `${minutes}:${seconds}`);

      return `${minutes}:${seconds}`;
    },

    // Return difference between current time and goal time in seconds
    timeLeft() {
      return this.nextSessionEndInSec - this.currentTimeInSec;
    },
  },

  methods: {
    async getUserNextSession() {
      // Get everyone's booked sessions for this week from this time forward (no past sessions)
      try {
        if (!this.user || !this.user._id) {
          // return (window.location.href = "/account/login");
          return;
        }
        this.gettingNextSession = true;

        let weekData = this.prepEndOfWeekData();

        const response = await requestWithAuthentication(
          `post`,
          "/api/booking/getUserNextSession",
          weekData
        );

        let nextSession = response.data.result;
        if (response.data.result.NoSessionsThisWeek) {
          return;
        }

        // if (!nextSession) throw new Error("Failed to fetch next session.");

        if (response.data.success) {
          this.gettingNextSession = false;
          this.checkIfSameElseSetNew(nextSession);
        }
      } catch (error) {
        console.log("@gettingNextSession Error: ", error);
        this.gettingNextSession = false;
        this.gettingNextSessionError = true;
      }
    },

    setNextOrCurrentSession(session) {
      let sessionStartInMS = new Date(session.dateTime).valueOf();
      let sessionIntervalInMS = session.sessionInterval * 60 * 1000;
      let nowInMS = Date.now();

      let sessionEndInMS = sessionStartInMS + sessionIntervalInMS;
      let twoMinutes = 2 * 60 * 1000;
      let sessionEndInMSBuffer = sessionEndInMS + twoMinutes;

      if (session) {
        // If session is old, try getting one again
        if (nowInMS >= sessionStartInMS + sessionIntervalInMS) {
          console.log("current session has ended. apparentlyl we got last one");
          this.getUserNextSession();
        }
        // If current session (e.g. between session start && end)
        else if (
          nowInMS >= sessionStartInMS &&
          nowInMS < sessionEndInMSBuffer
        ) {
          this.changeState("nextSession", session);
          this.changeState("currentSession", session);
          this.startCountdownToNextSession();
        }
        // If upcoming session
        else if (nowInMS < sessionStartInMS) {
          this.changeState("nextSession", session);
          this.changeState("currentSession", null);
          this.startCountdownToNextSession();
        }
      } else if (!session) {
        this.changeState("nextSession", null);
        this.changeState("currentSession", null);
      }
    },

    // I can first check if it matches at all
    // And then I can check what should be done with it

    // what is the point, why do I need to do this
    // I need to check if the session is the same
    // - [] AT DIFF INTERVALS, 10, 1, what else??? and on start
    // also when user comes on the page from another tab
    // or comes on from an idle state and moves mouse or smt

    // If it is in fact the same, do nothing, all good
    // If it is not the same, determine case, reset and set new
    // it is so that the user knows what's up for them

    checkIfSameElseSetNew(session) {
      // If previously both were set
      if (
        (this.currentSession && this.nextSession) ||
        (!this.currentSession && this.nextSession)
      ) {
        let nextStartInMS = new Date(this.nextSession.dateTime).valueOf();
        let sessionStartInMS = new Date(session.dateTime).valueOf();
        // Check if times of sessions remain the same
        if (sessionStartInMS == nextStartInMS) {
          // Check if session itself is the same
          if (session._id !== this.nextSession._id) {
            this.resetSessionAndTimer();
            this.setNextOrCurrentSession(session);
          }
        } else {
          this.resetSessionAndTimer();
          this.setNextOrCurrentSession(session);
        }
      }
      // When neither current nor next session are set
      else if (!this.currentSession && !this.nextSession) {
        this.resetSessionAndTimer();
        this.setNextOrCurrentSession(session);
      }
    },

    resetSessionAndTimer() {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
      this.currentTimeInSec = 0;
      this.$store.dispatch("cofocus/resetSessionData");
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

    startCountdownToNextSession() {
      /* Set session start time in seconds */
      let nextSessionStart = this.nextSession.dateTime;
      let nextSessionStartInMS = new Date(nextSessionStart).valueOf();
      let nextSessionStartInSec = Math.floor(nextSessionStartInMS / 1000);
      this.$store.dispatch(
        "cofocus/setNextSessionStartInSec",
        nextSessionStartInSec
      );

      /* Set session interval time in seconds */
      let nextSessionIntervalInMin = this.nextSession.sessionInterval;
      let nextSessionIntervalInSec = nextSessionIntervalInMin * 60;
      this.$store.dispatch(
        "cofocus/setNextSessionIntervalInSec",
        nextSessionIntervalInSec
      );

      /* Set session end time in seconds */
      let nextSessionEndInSec =
        nextSessionStartInSec + nextSessionIntervalInSec;
      this.$store.dispatch(
        "cofocus/setNextSessionEndInSec",
        nextSessionEndInSec
      );

      /* Set session timer checkpoint times */
      let oneMinToStartInSec = nextSessionStartInSec - 60;
      let tenMinToStartInSec = nextSessionStartInSec - 600;
      this.$store.dispatch("cofocus/setOneMinToStart", oneMinToStartInSec);
      this.$store.dispatch("cofocus/setTenMinToStart", tenMinToStartInSec);

      this.startTimer();

      this.$nextTick(() => {
        this.changeState("doneLoadingTimes", true);
      });
    },

    startTimer() {
      // this.timerInterval = setInterval(() => (this.timePassed += 1), 1000);
      this.timerInterval = setInterval(
        () => (this.currentTimeInSec = Math.floor(Date.now() / 1000)),
        1000
      );
    },

    onTimesUp() {
      clearInterval(this.timerInterval);
    },

    async checkIfSessionStillThere() {
        this.getUserNextSession();
      // check if still there
      // if not, reset timer && vuex for timer
      // get next session again OR current session
      // if session id is not matching, then check if time matches
      // if start time is different, cancel initial timers
      // update with new timer
      // and of course, somewhere, update or change the current && next sessions

      // when can it still be a 'current' session?
      // if it started 60m ago, it cannot be
      // if it started 50m ago, it can be
      // if it started 40m ago, it can be
      // so it must be 50 (or the interval of sessions)

      // what else must be true?
      // how often must it happen?

      // this function can also be used

      // so what do I check?

      // I should just query for the next upcoming session
      // should it check for whether that specific session exists as well, still?

      // another variable that can change is that partner can cancel

      // is partner still there?

      // there should be some sort of blockers...
      // if x thing is in process currently, then do not do one of the updates

      // so basically just get next or current session

      // or should I get the same session?
      // basically, unless you actively canceled a session, which would also update
      // the current next session, with this re-usable function
      // then on YOUR end the session should absolutely definitely exist

      // and if it does not, this can be handled on the session page
      // which will notify you, that something went wrong with your session
      // or that your partner has canceled and that we're trying to
      // find you a new partner

      // so ideally, it is a re-usable function
      // it is

      //

      return 1;
    },

    changeState(field, newValue) {
      let dispatchObject = { field, newValue };
      this.$store.dispatch("cofocus/changeSingleState", dispatchObject);
    },
  },

  watch: {
    "$store.state.auth.user": function () {
      if (this.user && this.user._id) {
        this.getUserNextSession();
      }
    },
    timeLeft() {
      if (!this.doneLoadingTimes) {
        return;
      } else {
        console.log("err", this.nextSessionEndInSec);
        let nowInSec = Math.floor(Date.now() / 1000);

        // change various styles with this

        this.$refs.timerchecks.doTenMinCheck(nowInSec);

        this.$refs.timerchecks.doOneMinCheck(nowInSec);

        this.$refs.timerchecks.doSessionStartCheck(nowInSec);

        this.$refs.timerchecks.doSessionEndCheck(nowInSec);
      }

      // If now > starttime && notJoinedYet => 'You're late'

      // If now > starttime && alreadyJoined => 'Please get back to session'

      // If now > starttime && hasJoined && isInSession => 'Session ends in...'

      // If now > endtime => 'Session has finished.'

      // If sessionHasStarted && onePartnerHasArrived && partnerCanceledSession
      // 'It seems your partner has canceled the session.'
      // 'Partner has canceled while you were late' (if >2m)

      // Timeout for that, then set whichever possible new session is next
    },
  },

  // Check if session still exists

  // Check if user still in session, if not -->

  // Check if partner still there, if not -->

  // Recompute this per book & cancel if changes

  // Delete session if no match found by start time? or rematch if possible, and if not then delete

  // checkIfNextSessionStillExists() {},
  // checkIfUserStillInSession() {
  //   // Get back in the session!
  // },

  // if calendar page, actually update

  // set exceptions for 25m && 100m intervals --> if interval == 25 / 50 / 100

  // add check if cofocus or not

  // get from database, get all users and calc the next session
  // get them from -1h from now (for assurance)
  // also get +2h this week end, to account for midnight
  // capture next OR ongoing session
};
</script>