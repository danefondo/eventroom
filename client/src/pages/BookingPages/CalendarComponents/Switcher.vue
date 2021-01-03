<template>
  <div class="switcher">
    <div @click="setToToday" class="today">Today</div>
    <RefreshButton
      :currentlyRefreshingData="currentlyRefreshingData"
      @refreshCalendarData="refreshCalendarData"
    />
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
    <PreferencesButton :currentlyRefreshingData="currentlyRefreshingData" />
  </div>
</template>

<script>
import RefreshButton from "../../../components/RefreshButton";
import PreferencesButton from "../../../components/PreferencesButton";

import {
  getDate,
  format,
  addDays,
  subDays,
  addWeeks,
  subWeeks,
  isSameWeek,
  startOfISOWeek,
} from "date-fns";

export default {
  name: "Switcher",
  props: [
    "currentWeekStart",
    "originalWeekStart",
    "currentSelectedDay",
    "weekStartDay",
    "weekEndDay",
    "week",
    "currentlyRefreshingData",
  ],
  components: {
    RefreshButton,
    PreferencesButton,
  },
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
    refreshCalendarData() {
      this.$emit("refreshCalendarData");
    },

    async toggleDayWeek(dayOrWeek) {
      // prevent toggle if already same
      if (
        (dayOrWeek == "week" && this.week) ||
        (dayOrWeek == "day" && !this.week)
      ) {
        return;
      } else {
        // Day mode does not work without awaiting dispatch
        await this.$store.dispatch("calendar/toggleWeekOrDay");
        // If week == current week, set currentDay to today
        this.setNewCurrentDay();
        let number = this.week ? 7 : 1;
        this.$store.dispatch("calendar/setRowNumberForWeekOrDay", number);
        await this.$emit("initCalendar");
      }
    },

    async setNewCurrentDay() {
      // if new week start = current time week start
      // --> then set today as selected day
      // else if any other week, set start of week as day
      let newWeekStart = this.currentWeekStart;
      let todayWeekStart = startOfISOWeek(new Date());
      let checkIfSameWeek = isSameWeek(newWeekStart, todayWeekStart);
      if (checkIfSameWeek) {
        this.$store.dispatch("calendar/setCurrentSelectedDayAsToday");
      } else {
        this.$store.dispatch("calendar/setCurrentSelectedDayAsStartOfWeek");
      }
    },

    async switchWeek(prevNext) {
      let week = this.currentWeekStart;
      if (prevNext === "forward") {
        week = addWeeks(week, 1);
      } else {
        week = subWeeks(week, 1);
      }

      this.$store.dispatch("calendar/setCurrentWeekStart", week);
      this.setNewCurrentDay();

      await this.$emit("initCalendar");
    },

    async switchDay(prevNext) {
      let selectedDay = this.currentSelectedDay;

      if (prevNext === "forward") {
        selectedDay = addDays(selectedDay, 1);
      } else {
        selectedDay = subDays(selectedDay, 1);
      }

      this.$store.dispatch("calendar/setCurrentSelectedDay", selectedDay);

      // In case week changes, set up current week to match day's week
      let isoWeekStart = startOfISOWeek(this.currentSelectedDay);
      isoWeekStart = new Date(isoWeekStart);
      this.$store.dispatch("calendar/setCurrentWeekStart", isoWeekStart);

      await this.$emit("initCalendar");
    },

    async setToToday() {
      this.$store.dispatch("calendar/setCurrentWeekStartToThisWeekStart");
      this.$store.dispatch("calendar/setCurrentSelectedDayAsToday");
      await this.$emit("initCalendar");
    },

    // If week has changed, update affected data
    async changeWeekIfNecessary() {
      let refreshedStart = startOfISOWeek(new Date());
      let originalStart = this.originalWeekStart;
      let selectedWeek = this.currentWeekStart;

      /**
       * If the new current week is different from
       * the original week set on load, set new
       * original week and update start of week date.
       */
      if (!isSameWeek(refreshedStart, originalStart)) {
        this.$store.dispatch("calendar/changeOriginalWeekStart");
        this.$store.dispatch("calendar/setCurrentSelectedDayAsStartOfWeek");

        /**
         * If current week selection is the same
         * as the initial original week set on load,
         * update week / day to the new one.
         * Otherwise assume user is intentionally
         * currently viewing another week.
         */
        if (isSameWeek(selectedWeek, originalStart)) {
          if (this.week) {
            this.switchWeek(refreshedStart);
          } else {
            this.switchDay(refreshedStart);
          }
          // When a week is actually swapped, update scroll position
          this.$emit("scrollToCurrentHour");
        }
      }
    },
  },
};
</script>