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
    },
  },

  watch: {
    timeLeft() {
      if (!this.doneLoadingTimes) {
        return;
      } else {
        let nowInMS = Date.now();

        this.$refs.timerchecks.doTenMinCheck(nowInMS);

        this.$refs.timerchecks.doOneMinCheck(nowInMS);

        this.$refs.timerchecks.doSessionStartCheck(nowInMS);

        this.$refs.timerchecks.doSessionEndCheck(nowInMS);
      }

    },
  },

  // set exceptions for 25m && 100m intervals --> if interval == 25 / 50 / 100

  // add check if cofocus or not
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