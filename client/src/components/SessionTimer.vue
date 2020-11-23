<template>
  <div>
    <div
      v-if="nextSessionIsTenMinToStart && !sessionHasStarted"
      class="session-notifier"
    >
      {{ `Hack session starting with Tony Stark in ${getTimeLeft} minutes.` }}
    </div>
    <div
      v-else-if="
        sessionHasStarted && !sessionHasFinished && userIsCurrentlyInSession
      "
      class="session-notifier"
    >
      {{ `Hack sessions ends in ${getTimeLeft} minutes.` }}
    </div>
    <div
      v-else-if="
        sessionHasStarted && !sessionHasFinished && !userIsCurrentlyInSession
      "
      class="session-notifier"
    >
      {{ `Please get back in the session. Ends in ${getTimeLeft} minutes.` }}
    </div>
    <div v-else-if="sessionHasFinished" class="session-notifier">
      {{ `Session has completed.` }}
    </div>
    <TimerChecks
      ref="timerchecks"
      :tenMinToStartInMS="tenMinToStartInMS"
      :didNextSessionTenMinCheck="didNextSessionTenMinCheck"
      :nextSessionIsTenMinToStart="nextSessionIsTenMinToStart"
      :oneMinToStartInMS="oneMinToStartInMS"
      :didNextSessionOneMinCheck="didNextSessionOneMinCheck"
      :nextSessionStartInMS="nextSessionStartInMS"
      :didSessionStartedCheck="didSessionStartedCheck"
      :nextSessionEndInMS="nextSessionEndInMS"
      :didSessionFinishedCheck="didSessionFinishedCheck"
      @checkIfSessionStillThere="checkIfSessionStillThere"
    />
  </div>
</template>


<script>
import TimerChecks from "./TimerChecks";

function initialDataState() {
  return {
    /* Timer numbers */
    timerInterval: null,
    currentTimeInMS: 0,
  };
}

export default {
  name: "SessionTimer",
  props: [
    "nextSessionIsTenMinToStart",
    "sessionHasStarted",
    "sessionHasFinished",
    "userIsCurrentlyInSession",
    "tenMinToStartInMS",
    "didNextSessionTenMinCheck",
    "oneMinToStartInMS",
    "didNextSessionOneMinCheck",
    "nextSessionStartInMS",
    "didSessionStartedCheck",
    "nextSessionEndInMS",
    "didSessionFinishedCheck",
    "nextSessionIntervalInMS",
    "doneLoadingTimes",
  ],
  data: function () {
    return initialDataState();
  },
  components: {
    TimerChecks,
  },
  mounted() {
    this.startTimer();
  },
  computed: {
    getTimeLeft() {
      let timeLeft = this.timeLeft - this.nextSessionIntervalInMS;
      if (this.sessionHasStarted) {
        timeLeft = this.timeLeft;
      }
      //   console.log("Next session start: ", timeLeft);
      const minutes = Math.floor(timeLeft / 1000 / 60);
      let seconds = Math.floor(timeLeft / 1000) % 60;

      if (seconds < 10) {
        seconds = `0${seconds}`;
      }
      //   console.log("getTimeLeft: ", `${minutes}:${seconds}`);

      return `${minutes}:${seconds}`;
    },

    // Return difference between current time and goal time in MS
    timeLeft() {
      return this.nextSessionEndInMS - this.currentTimeInMS;
    },
  },
  methods: {
    startTimer() {
      // this.timerInterval = setInterval(() => (this.timePassed += 1), 1000);
      this.timerInterval = setInterval(
        () => (this.currentTimeInMS = Date.now()),
        1000
      );
    },

    resetSessionAndTimer() {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
      this.currentTimeInMS = 0;
      this.$store.dispatch("cofocus/resetSessionData");
    },

    async checkIfSessionStillThere() {
      this.$emit("checkIfSessionStillThere");
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
  },

  watch: {
    timeLeft() {
      if (!this.doneLoadingTimes) {
        return;
      } else {
        let nowInMS = Date.now();

        // change various styles with this

        this.$refs.timerchecks.doTenMinCheck(nowInMS);

        this.$refs.timerchecks.doOneMinCheck(nowInMS);

        this.$refs.timerchecks.doSessionStartCheck(nowInMS);

        this.$refs.timerchecks.doSessionEndCheck(nowInMS);
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

<style scoped>
.session-notifier {
  background-color: #f7f7fb;
  padding: 20px;
  border-radius: 20px;
  font-weight: 700;
  color: #5600ff;
  width: 275px;
  font-size: 20px;
  margin: 0px auto;
  box-sizing: border-box;
}
</style>