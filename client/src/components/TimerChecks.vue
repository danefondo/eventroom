<template>
  <div></div>
</template>

<script>
export default {
  name: "TimerChecks",
  props: [
    "tenMinToStartInSec",
    "didNextSessionTenMinCheck",
    "nextSessionIsTenMinToStart",
    "oneMinToStartInSec",
    "didNextSessionOneMinCheck",
    "nextSessionStartInSec",
    "didSessionStartedCheck",
    "nextSessionEndInSec",
    "didSessionFinishedCheck",
  ],
  methods: {
    doTenMinCheck(nowInSec) {
      if (
        nowInSec >= this.tenMinToStartInSec &&
        !this.didNextSessionTenMinCheck &&
        !this.nextSessionIsTenMinToStart
      ) {
        this.changeState("nextSessionIsTenMinToStart", true);
        this.changeState("didNextSessionTenMinCheck", true);

        this.$emit("checkIfSessionStillThere");
      }
    },

    doOneMinCheck(nowInSec) {
      if (
        nowInSec >= this.oneMinToStartInSec &&
        !this.didNextSessionOneMinCheck
      ) {
        this.changeState("didNextSessionOneMinCheck", true);

        this.$emit("checkIfSessionStillThere");
      }
    },

    doSessionStartCheck(nowInSec) {
      if (
        nowInSec >= this.nextSessionStartInSec &&
        !this.didSessionStartedCheck
      ) {
        this.changeState("sessionHasStarted", true);
        this.changeState("didSessionStartedCheck", true);

        this.$emit("checkIfSessionStillThere");
      }
    },

    doSessionEndCheck(nowInSec) {
      console.log("now, end", nowInSec, this.nextSessionEndInSec);
      if (
        this.nextSessionEndInSec &&
        nowInSec >= this.nextSessionEndInSec &&
        !this.didSessionFinishedCheck
      ) {
        clearInterval(this.timerInterval);

        this.changeState("sessionHasFinished", true);
        this.changeState("didSessionFinishedCheck", true);

        this.$emit("checkIfSessionStillThere");
      }
    },

    changeState(field, newValue) {
      let dispatchObject = { field, newValue };
      this.$store.dispatch("cofocus/changeSingleState", dispatchObject);
    },
  },
};
</script>