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