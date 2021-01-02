<template>
  <div class="switcher">
    <div @click="setToToday" class="today">Today</div>
    <div class="date-range">
      <div v-if="week" @click="switchWeek('back')" class="arrow">&larr;</div>
      <div v-if="!week" @click="switchDay('back')" class="arrow">&larr;</div>
      <div class="current">{{ calendarCaption }}</div>
      <div v-if="week" @click="switchWeek('forward')" class="arrow">
        &#8594;
      </div>
      <div v-if="!week" @click="switchDay('forward')" class="arrow">
        &#8594;
      </div>
    </div>
    <div class="calendar-view">
      <div
        @click="toggleDayWeek('week')"
        class="switch week"
        :class="week ? 'active' : ''"
      >
        Week
      </div>
      <div
        @click="toggleDayWeek('day')"
        class="switch day"
        :class="!week ? 'active' : ''"
      >
        Day
      </div>
    </div>
  </div>
</template>

<script>
import {
  getDate,
  format,
  addDays,
  subDays,
  addWeeks,
  subWeeks,
} from "date-fns";

export default {
  name: "Switcher",
  props: [
    "currentWeekStartMS",
    "currentDayStartMS",
    "weekStartDay",
    "weekEndDay",
    "week",
  ],
  computed: {
    calendarCaption() {
      let caption;
      if (this.week) {
        caption = `${this.weekStartDay.monthNameShort}, ${this.weekStartDay.dateNum} - `;
        if (
          this.weekStartDay.monthNameShort == this.weekEndDay.monthNameShort
        ) {
          caption += this.weekEndDay.dateNum;
        } else {
          caption += `${this.weekEndDay.monthNameShort}, ${this.weekEndDay.dateNum}`;
        }
      } else {
        let captionDateNum = getDate(this.currentDayStartMS);
        // let captionMonthNumb = format(this.currentDayStart, 'LLLL', { locale: ru });
        let captionMonthNum = format(this.currentDayStartMS, "LLLL");
        caption = `${captionMonthNum} ${captionDateNum}`;
      }
      return caption;
    },
  },
  methods: {
    toggleDayWeek(dayOrWeek) {
      // prevent toggle if already same
      console.log("test1");
      if (
        (dayOrWeek == "week" && this.week) ||
        (dayOrWeek == "day" && !this.week)
      ) {
        console.log("failtest");
        return;
      } else {
        console.log("testprogress");
        this.$emit("toggleDayWeekView");
      }
    },
    switchWeek(prevNext) {
      let week = this.currentWeekStartMS;
      if (prevNext === "forward") {
        week = addWeeks(week, 1);
      } else {
        week = subWeeks(week, 1);
      }
      this.$emit("switchWeek", week);
    },
    switchDay(prevNext) {
      let selectedDay = this.currentDayStartMS;

      if (prevNext === "forward") {
        selectedDay = addDays(selectedDay, 1);
      } else {
        selectedDay = subDays(selectedDay, 1);
      }
      this.$emit("switchDay", selectedDay);
    },
    setToToday() {
      this.$emit("setToToday");
    },
  },
};
</script>
<style scoped>
.switch {
  cursor: pointer;
}

.day {
}

.week.active {
  border: 3px solid blue;
}
</style>
