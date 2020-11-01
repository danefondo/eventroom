<template>
  <div class="media-buttons timer">
    <div class="tooltip_container">
      <div class="timer-button" @click="toggleTimer">
        <IconBase
          icon-name="timer"
          :iconColor="
            timerOpen ? getSecondColor('timer') : getLightColor('timer')
          "
          viewBox="0 0 24 24"
          width="32"
          height="32"
          ><IconTimer
        /></IconBase>
      </div>
      <div class="tooltip tooltip--top tooltip--middle">
        <span class="tooltip_tip">{{
          timerOpen ? "Close timer" : "Open timer"
        }}</span>
        <span class="tooltip_shortcut">T</span>
      </div>
    </div>
    <div v-if="timerOpen" class="timer-container">
      <div v-if="timerStarted" class="timer-clock">{{ getTimeLeft }}</div>
      <!-- <input class="timer-input" maxlength="4" v-model="timerHours"></div> -->
      <input
        v-if="!timerStarted"
        type="number"
        class="timer-input"
        maxlength="4"
        v-model.number="timerMinutes"
      />
      <input
        v-if="!timerStarted"
        type="number"
        class="timer-input"
        maxlength="2"
        v-model.number="timerSeconds"
      />
      <div
        class="timer-icon"
        v-if="timerStarted && !timerPaused"
        @click="pauseTimer"
      >
        <IconBase
          icon-name="pause"
          :iconColor="getSecondColor('timer')"
          viewBox="0 0 128 128"
          width="24"
          height="24"
          ><IconPause
        /></IconBase>
      </div>
      <div
        class="timer-icon"
        v-if="timerStarted && timerPaused"
        @click="resumeTimer"
      >
        <IconBase
          icon-name="play"
          :iconColor="getSecondColor('timer')"
          viewBox="0 0 128 128"
          width="22.5"
          height="22.5"
          ><IconPlay
        /></IconBase>
      </div>
      <!-- <div class="timer-control-button">Stop</div>
      <div class="timer-control-button">Start</div> -->
      <div
        v-if="!timerStarted"
        class="timer-control-button start"
        @click="startTimer"
      >
        Start
      </div>
      <div class="timer-control-button reset" @click="resetTimer">Reset</div>
      <div
        v-if="timerContainerExpanded"
        class="timer-control-button quick-time"
        @click="setAndStartTimerCustom(30)"
      >
        30s
      </div>
      <div
        v-if="timerContainerExpanded"
        class="timer-control-button quick-time"
        @click="setAndStartTimerCustom(60)"
      >
        1m
      </div>
      <div
        v-if="timerContainerExpanded"
        class="timer-control-button quick-time"
        @click="setAndStartTimerCustom(300)"
      >
        5m
      </div>
      <div
        class="timer-expand"
        @click="timerContainerExpanded = !timerContainerExpanded"
      >
        <IconBase
          icon-name="arrow-double"
          :class="timerContainerExpanded ? 'rotate180' : ''"
          :iconColor="getLightSecondColor('timer')"
          viewBox="0 0 128 128"
          width="18"
          height="18"
          ><IconRightArrowDouble
        /></IconBase>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";

import IconBase from "../../../components/IconBase";
import IconTimer from "../../../components/SVG/IconTimer";

import IconPause from "../../../components/SVG/IconPause";
import IconPlay from "../../../components/SVG/IconPlay";
import IconRightArrowDouble from "../../../components/SVG/IconRightArrowDouble";

// import { addSeconds } from "date-fns";

export default {
  name: "RoomBottomLeftBar",
  data() {
    return {
      errors: false,
      timerContainerExpanded: false,

      timerMinutes: 0,
      timerSeconds: 0,

      timerStarted: false,

      timerPaused: false,

      timerInterval: null,
      timePassed: 0,

      countdownTime: 30,

      //   timerEndsTime: 0,

      pausedTimerTime: 0,
      //   toolbarConfiguration: [],
      //   toolOpened: false,
      //   openedComponent: "",
    };
  },
  computed: {
    ...mapState({
      timerOpen: (state) => state.toolbar.timerConfig.timerOpen,
      timerNewValue: (state) => state.toolbar.timerConfig.setNewValue,
      eventroom: (state) => state.eventroom.eventroomData,
    }),
    getMicColor() {
      return "#1F3058";
    },
    getCoreColor() {
      return "#323b50";
    },
    getMicSecondColor() {
      return "#323b50";
    },

    getTimeLeft() {
      const timeLeft = this.timeLeft;
      const minutes = Math.floor(timeLeft / 60);
      let seconds = timeLeft % 60;

      if (seconds < 10) {
        seconds = `0${seconds}`;
      }

      return `${minutes}:${seconds}`;
    },

    timeLeft() {
      return this.countdownTime - this.timePassed;

      // date based setup is, when does current time reach 'Goal time'
      //   return this.timerEndsTime - this.timePassed;
    },
    // TIME LEFT MUST BE seconds left UNTIL 0
    // right now, you set to 30, and remove time passed actively

    // the alternative is
    // time left is
    // timePassedInSeconds - new Date().valueOf();

    // WTF NEEDS TO BE IN FUCKING DATE TIME AND WTF NEEDS TO BE SOLID
    // WTF IS TIMER TIMER,
    // WHY DOES IT SAY TIME LEFT IF THERE IS ALSO A GET TIME LEFT WTF????????
  },
  components: {
    IconBase,
    IconTimer,
    IconPause,
    IconPlay,
    IconRightArrowDouble,
  },
  //   props: ["moreThanOneAndLessThanThreeInSession"],
  methods: {
    toggleTimer() {
      this.$store.dispatch("toolbar/toggleTimer");
    },
    getActiveColor(icon) {
      console.log("icon", icon);
      return "blue";
    },
    getLightColor(icon) {
      console.log("icon", icon);
      return "#323c4f4a";
    },
    getLightSecondColor(icon) {
      console.log("icon", icon);
      return "#323c4f75";
    },
    getColor(icon) {
      console.log("icon", icon);
      return "#fff";
    },
    getSecondColor(icon) {
      console.log("icon", icon);
      return "#323b50";
    },
    resetTimer(received = false) {
      clearInterval(this.timerInterval);
      this.countdownTime = 0;
      this.timerMinutes = 0;
      this.timerSeconds = 0;
      this.timePassed = 0;
      this.timerPaused = false;
      this.timerStarted = false;
      this.timerContainerExpanded = false;
      if (!received) {
        this.$socket.emit("resetTimer", this.eventroom.eventroomId);
      }
    },
    pauseTimer(received = false) {
      // this.pausedTimerTime = this.countdownTime;
      clearInterval(this.timerInterval);
      this.timerPaused = true;
      this.$socket.emit("pauseTimer", this.eventroom.eventroomId);
      if (!received) {
        this.$socket.emit("pauseTimer", this.eventroom.eventroomId);
      }
    },
    resumeTimer(received = false) {
      this.timerPaused = false;
      this.timerInterval = setInterval(() => (this.timePassed += 1), 1000);
      //   this.timerInterval = setInterval(
      //     () => (this.timePassed = Date.now()),
      //     1000
      //   );
      if (!received) {
        this.$socket.emit("resumeTimer", this.eventroom.eventroomId);
      }
    },
    setAndStartTimerCustom(seconds, received = false) {
      this.resetTimer();
      this.timerMinutes = 0;
      this.timerSeconds = 0;
      this.timePassed = 0;
      this.countdownTime = seconds;
      this.timerInterval = setInterval(() => (this.timePassed += 1), 1000);
      //   this.timerEndsTime = Date.now() + this.countdownTime;
      //   this.timerInterval = setInterval(
      //     () => (this.timePassed = Date.now()),
      //     1000
      //   );
      this.timerStarted = true;
      this.timerPaused = false;
      this.timerContainerExpanded = false;
      let data = {
        roomId: this.eventroom.eventroomId,
        time: seconds,
      };
      if (!received) {
        this.$socket.emit("setAndStartTimerCustom", data);
      }
    },
    startTimer() {
      // prevent if zero
      this.countdownTime = this.timerMinutes * 60 + this.timerSeconds;
      //   this.timerEndsTime = Date.now() + this.countdownTime;
      this.timerInterval = setInterval(() => (this.timePassed += 1), 1000);
      //   this.timerInterval = setInterval(
      //     () => (this.timePassed = Date.now()),
      //     1000
      //   );

      this.timerStarted = true;
      this.timerPaused = false;
      this.timerContainerExpanded = false;
      this.$socket.emit("setAndStartTimerCustom", {
        roomId: this.roomId,
        time: this.countdownTime,
      });
    },

    onTimesUp() {
      // Have indicator that time is up or something
      // Also indicators and other sounds for
      // When time is soon to be up
      this.resetTimer();
    },

    // updateTimerForOthers() {
    //     let timeToPass = 0;
    // },
    // computeTimeToRun() {

    // },
  },
  watch: {
    timeLeft(newValue) {
      if (newValue === 0) {
        this.resetTimer();
      }
    },
    "$store.state.toolbar.timerConfig.resetTimer": function () {
      this.resetTimer(true);
    },

    "$store.state.toolbar.timerConfig.pauseTimer": function () {
      this.pauseTimer(true);
    },

    "$store.state.toolbar.timerConfig.resumeTimer": function () {
      this.resumeTimer(true);
    },

    "$store.state.toolbar.timerConfig.setNewValue": function () {
      this.setAndStartTimerCustom(this.timerNewValue, true);
    },
  },
  // 1. Check if any existing timers
  // 2. At beginning, check if any timers running, if expired, nullify, if not, set it

  // 3. local time zone time, convert to utc, socket and return and convert to local
  // 4. then e.g. 50m until x time, and then it might be 49.59-58 once arrives on other side

  // if timer is paused, then calculate a new timezone time when played again

  // so I must send to the other person new Date().valueOf(),

  // let timerToPass(new Date(), countdownTime)
  // timerToPass = timerToPass.valueOf();

  // on receive => countdownTime = passedTime - newTime().valueOf();
  // passedTime is just certain amount of seconds from now (unless already passed)
  // and if you subtract current time from it, then you get seconds to countdown

  // the countdown must always happen, basically currentTime + added seconds
  // I must countdown to addedSeconds + now
  // e.g.
};
</script>
<style scoped>
/* Only for debugging */
* {
  box-sizing: border-box;
}

.rotate180 {
  -webkit-transform: rotate(180deg);
  transform: rotate(180deg);
}

.timer {
  position: absolute;
  left: 5px;
}

.timer-icon {
  height: 32px;
  display: flex;
  align-items: center;
  padding: 2px 7px;
  margin: 0px 3px;
  border-radius: 4px;
  cursor: pointer;
}

.timer-icon:hover {
  background-color: #f3f2f2;
}

.timer-expand {
  height: 32px;
  display: flex;
  align-items: center;
  padding: 2px 7px;
  margin: 0px 3px;
  border-radius: 4px;
  cursor: pointer;
  margin-left: 14px;
  margin-right: 0px;
}

.timer-expand:hover {
  background-color: #f3f2f2;
}

.media-buttons {
  display: flex;
  flex-direction: row;
  align-items: center;
}

.timer-button {
  border: 1px solid #ececec;
  border-radius: 4px;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 46px;
  width: 46px;
  cursor: pointer;
  position: relative;
  box-sizing: border-box;
}

.timer-button:hover {
  background-color: #f3f2f2;
}

.timer-container {
  display: flex;
  border: 1px solid #ececec;
  padding: 5px 10px;
  border-radius: 4px;
  height: 46px;
  align-items: center;
  box-sizing: border-box;
  color: #323b50;
}

.timer-clock {
  font-size: 22px;
  padding: 0px 7px;
  margin-right: 4px;
  height: 32px;
  display: flex;
  align-items: center;
}

.timer-input {
  font-size: 22px;
  padding: 0px 2px;
  margin-right: 4px;
  height: 32px;
  display: flex;
  align-items: center;
  width: 38px;
  border: 1px solid #efefef;
  text-align: center;
  border-radius: 2px;
  outline: none;
  color: #323c4f;
}

.timer-control-button {
  padding: 0px 7px;
  margin: 0px 1px;
}

.reset,
.start,
.quick-time {
  font-weight: 600;
  cursor: pointer;
  padding: 8px 7px;
  border-radius: 4px;
}

.reset:hover,
.start:hover,
.quick-time {
  background-color: #f7f7f7;
}

/*! CSS Used from: Embedded */
.tooltip {
  background: #040d1e;
  display: var(--tooltip-display);
  border-radius: 4px;
  color: white;
  filter: var(--tooltip-filter, none);
  flex-direction: row;
  flex-shrink: 0;
  font-weight: normal;
  font-size: 12px;
  padding: 6px 12px;
  position: absolute;
  text-align: center;
  transform: translate(var(--translateX, 0), var(--translateY, 0));
  white-space: nowrap;
  z-index: 900;
}
.tooltip::before {
  background: #040d1e;
  display: block;
  position: absolute;
  content: "";
  height: 8px;
  width: 8px;
  z-index: 1;
}
.tooltip--top {
  --translateY: calc(-100% - 8px);
  top: 0;
}
.tooltip--top::before {
  bottom: 0;
  transform: rotate(45deg) translate(-50%, 50%);
  transform-origin: left bottom;
}
.tooltip--top.tooltip--middle {
  --translateX: -50%;
  left: 50%;
}
.tooltip--top.tooltip--middle::before {
  left: 50%;
}
.tooltip_container {
  --tooltip-display: none;
  display: inline-flex;
  position: relative;
  margin-right: 10px;
}
@media (hover: hover) {
  .tooltip_container:hover {
    --tooltip-display: flex;
  }
}
.tooltip_shortcut {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
  color: #adb6d1;
  margin-left: 8px;
  padding: 1px 5px;
  text-transform: uppercase;
}
</style>
