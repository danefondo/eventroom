<template>
  <div>
    <div
      v-if="(nextSessionIsTenMinToStart || sessionHasStarted) && getTimeLeft"
      class="session-notifier"
    >
      <TimerTenToStartMessage
        v-if="nextSessionIsTenMinToStart && !sessionHasStarted"
        :timeLeft="getTimeLeft"
        :sessionIsMatched="sessionIsMatched"
      />
      <TimerOngoingMessage
        v-else-if="sessionHasStarted && !sessionHasFinished"
        :isCurrentlyInSession="isCurrentlyInSession"
        :hasJoinedDuringSession="hasJoinedDuringSession"
        :timeLeft="getTimeLeft"
        :sessionIsMatched="sessionIsMatched"
        :sessionStartedTwoMinAgo="sessionStartedTwoMinAgo"
      />
      <TimerFinishedMessage
        v-else-if="sessionHasStarted && sessionHasFinished"
      />
      <TimerSessionSnippet
        v-if="nextSessionIsTenMinToStart && nextSession && !sessionHasFinished"
        :sessionIsMatched="sessionIsMatched"
        :nextSession="nextSession"
      />
    </div>
    <TimerChecks
      ref="timerchecks"
      :tenMinToStartInMS="tenMinToStartInMS"
      :didTwoMinIntoSessionCheck="didTwoMinIntoSessionCheck"
      :sessionStartedTwoMinAgo="sessionStartedTwoMinAgo"
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
import TimerTenToStartMessage from "./TimerMessages/TimerTenToStartMessage";
import TimerOngoingMessage from "./TimerMessages/TimerOngoingMessage";
import TimerFinishedMessage from "./TimerMessages/TimerFinishedMessage";
import TimerSessionSnippet from "./TimerSessionSnippet";

function initialDataState() {
  return {
    /* Timer numbers */
    timerInterval: null,
    currentTimeInMS: 0,
    timeLeft: null,
  };
}

export default {
  name: "SessionTimer",
  props: [
    "nextSessionIsTenMinToStart",
    "sessionStartedTwoMinAgo",
    "didTwoMinIntoSessionCheck",
    "sessionHasStarted",
    "sessionHasFinished",
    "isCurrentlyInSession",
    "hasJoinedDuringSession",
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
    "nextSession",
    "userId",
  ],
  data: function () {
    return initialDataState();
  },
  components: {
    TimerChecks,
    TimerTenToStartMessage,
    TimerOngoingMessage,
    TimerFinishedMessage,
    TimerSessionSnippet,
  },
  mounted() {
    this.startTimer();
  },
  computed: {
    getTimeLeft() {
      return this.computeTimeLeft();
    },

    // Return difference between current time and goal time in MS
    // timeLeft() {
    //   return this.nextSessionEndInMS - this.currentTimeInMS;
    // },

    sessionIsMatched() {
      console.log("@sessionIsMatched, nextSession: ", this.nextSession);
      let matched = false;
      if (this.nextSession.firstPartnerId && this.nextSession.secondPartnerId) {
        matched = true;
      }
      return matched;
    },
  },
  methods: {
    startTimer() {
      this.timerInterval = setInterval(this.setTime, 1000);
      this.changeState("timerHasBeenStarted", true);
    },

    setTime() {
      this.performTimeChecks();
      this.currentTimeInMS = Date.now();
      // Return difference between current time and goal time in MS
      let time = null;
      if (this.sessionHasStarted) {
        // If started, countdown till end of session
        this.timeLeft = this.nextSessionEndInMS - this.currentTimeInMS;
        time = this.computeTimeLeft();
        time = `Session ends in ${time}`;
      } else {
        // If not started, countdown till start of session
        this.timeLeft = this.nextSessionStartInMS - this.currentTimeInMS;
        time = this.computeTimeLeft();
        time = `Session starts in ${time}`;
      }

      if (time) {
        window.document.title = time;
      }
    },

    performTimeChecks() {
      if (!this.doneLoadingTimes) {
        return;
      } else {
        let nowInMS = Date.now();

        this.$refs.timerchecks.doTenMinCheck(nowInMS);

        this.$refs.timerchecks.doOneMinCheck(nowInMS);

        this.$refs.timerchecks.doSessionStartCheck(nowInMS);

        this.$refs.timerchecks.doTwoMinIntoSessionCheck(nowInMS);

        this.$refs.timerchecks.doSessionEndCheck(nowInMS);
      }
    },

    /*
    
    initially, you get literal milliseconds left until the 
    end of the session
    but that is not obviously what i want to be showing for some time
    e.g. i do not want to be showing time left until end of session for some time

    e.g. until session has not started, I want to show time left until session start time
    */

    computeTimeLeft() {
      if (!this.timeLeft) return;
      // Value is negative initially? <-- someone smarter look into this thx
      if (this.timeLeft < 0) return;
      const minutes = Math.floor(this.timeLeft / 1000 / 60);
      let seconds = Math.floor(this.timeLeft / 1000) % 60;

      if (seconds < 10) {
        seconds = `0${seconds}`;
      }

      let timeString = `${minutes}:${seconds}`;
      return timeString;
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

    changeState(field, newValue) {
      let dispatchObject = { field, newValue };
      this.$store.dispatch("cofocus/changeSingleState", dispatchObject);
    },
  },

  // set exceptions for 25m && 100m intervals --> if interval == 25 / 50 / 100

  // add check if cofocus or not
};
</script>

<style scoped>
.session-notifier {
  background-color: #f9f9fa;
  padding: 25px 30px;
  border-radius: 3px;
  font-weight: 700;
  color: #5600ff;
  width: 300px;
  font-size: 20px;
  line-height: 23px;
  margin: 0px auto;
  box-sizing: border-box;
  border: 1px solid #f1f1f1;
  margin-top: 60px;
}
</style>