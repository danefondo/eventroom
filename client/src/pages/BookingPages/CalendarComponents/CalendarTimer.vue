<template>
  <div class="session-notifier">
    <div>
      <div>
        {{ `Hack session starting with Tony Stark in ${getTimeLeft} minutes.` }}
      </div>
    </div>
  </div>
</template>

<script>
/*

No more shitty product experiences.
Enough is enough.
Welcome to Cofocus.
Elegance. Simplicity. Fun.

 */

const TIME_LIMIT = 120;

export default {
  name: "CalendarTimer",
  data() {
    return {
      timer: "",

      timerInterval: null,
      timePassed: 0,
    };
  },
  computed: {
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
      return TIME_LIMIT - this.timePassed;
    },
  },
  async mounted() {
    this.startTimer();
  },
  methods: {
    startTimer() {
      this.timerInterval = setInterval(() => (this.timePassed += 1), 1000);
    },
    onTimesUp() {
      clearInterval(this.timerInterval);
    },
  },
  watch: {
    timeLeft(newValue) {
      if (newValue === 0) {
        this.onTimesUp();
      }
    },
  },
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