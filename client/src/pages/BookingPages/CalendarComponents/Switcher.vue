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
    "currentWeekStart",
    "currentSelectedDay",
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
        let captionDateNum = getDate(this.currentSelectedDay);
        // let captionMonthNumb = format(this.currentSelectedDay, 'LLLL', { locale: ru });
        let captionMonthNum = format(this.currentSelectedDay, "LLLL");
        caption = `${captionMonthNum} ${captionDateNum}`;
      }
      return caption;
    },
  },
  methods: {
    toggleDayWeek(dayOrWeek) {
      // prevent toggle if already same
      if (
        (dayOrWeek == "week" && this.week) ||
        (dayOrWeek == "day" && !this.week)
      ) {
        return;
      } else {
        this.$emit("toggleDayWeekView");
      }
    },
    switchWeek(prevNext) {
      let week = this.currentWeekStart;
      console.log("switchWeekBEFORE", week);
      if (prevNext === "forward") {
        week = addWeeks(week, 1);
      } else {
        week = subWeeks(week, 1);
      }
      console.log("switchWeekAFTERE", week);
      this.$emit("switchWeek", week);
    },
    switchDay(prevNext) {
      let selectedDay = this.currentSelectedDay;
      console.log("switchDayBEFORE", selectedDay);

      if (prevNext === "forward") {
        selectedDay = addDays(selectedDay, 1);
      } else {
        selectedDay = subDays(selectedDay, 1);
      }
      console.log("switchDayAFTER", selectedDay);
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
