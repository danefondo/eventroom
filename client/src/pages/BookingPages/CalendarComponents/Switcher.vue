<template>
  <div class="switcher">
    <div @click="setToToday" class="today">Today</div>
    <div class="date-range">
      <div @click="switchWeek('back')" class="arrow">&larr;</div>
      <div class="current">{{ calendarCaption }}</div>
      <div @click="switchWeek('forward')" class="arrow">&#8594;</div>
    </div>
    <div class="calendar-view">
      <div @click="toggleDayWeek" :class="week ? 'active' : ''">Week</div>
      <div @click="toggleDayWeek" :class="!week ? 'active' : ''">Day</div>
    </div>
  </div>
</template>

<script>
export default {
  name: "Switcher",
  props: ["currentStart", "start", "end", "week"],
  computed: {
    calendarCaption() {
      let caption = `${this.start.month}, ${this.start.date} - `;
      if (this.start.month == this.end.month) {
        caption += this.end.date;
      } else {
        caption += `${this.end.month}, ${this.end.date}`;
      }
      return caption;
    },
  },
  methods: {
    toggleDayWeek() {
      this.$emit("toggleDayWeekView");
    },
    switchWeek(prevNext) {
      let start = this.currentStart;
      if (prevNext === "forward") {
        start.add("1", "week");
      } else {
        start.subtract("1", "week");
      }
      this.$emit("switchWeek", start);
    },
    setToToday() {
      this.$emit("setToToday");
    }
  },
};
</script>
<style scoped>
</style>
