<template>
  <div>
    <tr
      v-for="(hour, hourIndex) in lastRowHours"
      :key="hourIndex + hour"
      :data-rowhour="hour"
      :style="boxHeight"
    >
      <td></td>
      <td
        v-for="(rowNum, rowNumIndex) in rowNumberForWeekOrDay"
        :key="rowNumIndex + hour"
        class="each-day"
        :class="isPastLastHour(hour, rowNum) ? 'past-day' : ''"
        :data-daynum="rowNum"
      >
        <PastSlot v-if="isPastLastHour(hour, rowNum)" />
      </td>
    </tr>
  </div>
</template>

<script>
import { setDay, setHours, setMinutes, addDays, isToday } from "date-fns";
import PastSlot from "./PastSlot";

export default {
  name: "LastHourRows",
  data() {
    return {
      // Else, when midnight hits, monday column has two gaps (0:15, 0:30)
      // whereas tuesday already shows 0:00 as past, e.g. a gap in experience
      lastRowHours: ["00:00", "00:00", "00:00"],
      // lastRowHours: ["00:00", "00:15", "00:30"],
    };
  },
  props: [
    "rowNumberForWeekOrDay",
    "boxHeight",
    "week",
    "currentWeekStart",
    "currentSelectedDay",
    "lastMinInMS",
  ],
  components: {
    PastSlot,
  },
  // set timer interval to update what's in the past and what's not
  methods: {
    isPastLastHour(hour, i) {
      let isPastLastHour = false;
      let date = null;
      if (this.week) {
        // date-fns starts with sunday
        if (i == 6) {
          i = 0;
        } else {
          i = i + 1;
        }

        date = new Date(this.currentWeekStart); // current selected week start
        date = setDay(date, i, { weekStartsOn: 1 });
        if (!isToday(date)) {
          date = addDays(date, 1); // add date to go to next day
        }
      } else {
        date = new Date(this.currentSelectedDay);
        date = addDays(date, 1); // add date to go to next day
      }

      const time = hour.split(":"); // 00:00, 00:15, 00:30
      date = setHours(date, time[0]);
      date = setMinutes(date, time[1]);

      let dateInMS = date.valueOf();

      // lastMinInMS is a variable so that the timer could keep past slots
      // up to date by updating it regularly
      let now = this.lastMinInMS ? this.lastMinInMS : Date.now();

      if (now > dateInMS) {
        isPastLastHour = true;
      }

      return isPastLastHour;
    },
  },
};
</script>
<style scoped>
.each-day:hover .highlight-container {
  display: flex;
  /* z-index: 999; */
}

.each-day {
  background-color: transparent;
}

.past-day {
  /* background-color: #f9f9f9; */
  /* background-color: #f9fafa; */
  background-color: #fff;
}
</style>