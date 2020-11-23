<template>
  <div></div>
</template>

<script>
export default {
  name: "TimerChecks",
  props: [
    "tenMinToStartInMS",
    "didNextSessionTenMinCheck",
    "nextSessionIsTenMinToStart",
    "oneMinToStartInMS",
    "didNextSessionOneMinCheck",
    "nextSessionStartInMS",
    "didSessionStartedCheck",
    "nextSessionEndInMS",
    "didSessionFinishedCheck",
  ],
  methods: {
    doTenMinCheck(nowInMS) {
      if (
        nowInMS >= this.tenMinToStartInMS &&
        !this.didNextSessionTenMinCheck &&
        !this.nextSessionIsTenMinToStart
      ) {
        this.changeState("nextSessionIsTenMinToStart", true);
        this.changeState("didNextSessionTenMinCheck", true);

        this.$emit("checkIfSessionStillThere");
      }
    },

    doOneMinCheck(nowInMS) {
      if (
        nowInMS >= this.oneMinToStartInMS &&
        !this.didNextSessionOneMinCheck
      ) {
        this.changeState("didNextSessionOneMinCheck", true);

        this.$emit("checkIfSessionStillThere");
      }
    },

    doSessionStartCheck(nowInMS) {
      if (
        nowInMS >= this.nextSessionStartInMS &&
        !this.didSessionStartedCheck
      ) {
        this.changeState("sessionHasStarted", true);
        this.changeState("didSessionStartedCheck", true);

        this.$emit("checkIfSessionStillThere");
      }
    },

    doSessionEndCheck(nowInMS) {
      // console.log("now, end", nowInMS, this.nextSessionEndInMS);
      if (
        this.nextSessionEndInMS &&
        nowInMS >= this.nextSessionEndInMS &&
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