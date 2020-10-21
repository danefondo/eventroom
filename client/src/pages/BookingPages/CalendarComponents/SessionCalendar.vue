<template>
  <div class="calendar">
    <Switcher
      v-if="start && end && currentStart"
      @switchWeek="switchWeek"
      @setToToday="setToToday"
      :start="start"
      :end="end"
      :currentStart="currentStart"
      :week="week"
      @toggleDayWeekView="toggleDayWeekView"
    />
    <Table
      v-if="dates && start && end"
      :dates="dates"
      :start="start"
      :end="end"
      :currentStart="currentStart"
      :calendarData="calendarData"
    />
  </div>
</template>

<script>
import Switcher from "./Switcher";
import Table from "./Table";
import moment from "moment";

export default {
  name: "SessionCalendar",
  //   props: ["eventroom"],
  // If calendar base is ready, avoid re-render wherever possible

  // Pre-get sessions loaded, so that loading next page is FAST.
  data() {
    return {
      // dates: [
      //   {
      //     date: startOfWeek.format("DD"),
      //     day: startOfWeek.format("ddd"),
      //     month: startOfWeek.format("MMM"),
      //     monthInNum: startOfWeek.format("MM"),
      //     year: startOfWeek.format("YYYY"),
      //   },
      // ],
      start: null,
      end: null,
      interval: 60,
      minimumTime: "08:00",
      maximumTime: "16:00",
      height: 70,
      dates: null,
      currentStart: moment().startOf("isoWeek"),
      week: true,
    };
  },
  props: ["bookedSessions"],
  components: {
    Switcher,
    Table,
  },
  mounted() {
    this.initCalendar();
  },
  methods: {
    toggleDayWeekView() {
      this.week = !this.week;
    },
    switchWeek(currentStart) {
      this.currentStart = currentStart;
      this.initCalendar();
    },
    setToToday() {
      this.currentStart = moment().startOf("isoWeek");
      this.initCalendar();
    },
    plotEvents() {},
    initCalendar() {
      let startOfPeriod = this.currentStart;
      let newStart = new moment(startOfPeriod);
      this.dates = this.getDates(newStart);
      this.start = this.dates[0];
      this.end = this.dates[this.dates.length - 1];
    },
    getDates(startOfWeek) {
      const dates = [
        {
          date: startOfWeek.format("DD"),
          day: startOfWeek.format("ddd"),
          month: startOfWeek.format("MMM"),
          monthInNum: startOfWeek.format("MM"),
          year: startOfWeek.format("YYYY"),
        },
      ];
      for (let i = 1; i < 7; i++) {
        const nextDay = startOfWeek.add(1, "d");
        dates.push({
          date: nextDay.format("DD"),
          day: nextDay.format("ddd"),
          month: nextDay.format("MMM"),
          monthInNum: nextDay.format("MM"),
          year: startOfWeek.format("YYYY"),
        });
      }
      return dates;
    },
    getTimes(min, max, interval) {
      const time = moment(min, "HH:mm");
      const maximumTime = moment(max, "HH:mm");
      const times = [];
      do {
        times.push(time.format("HH:mm"));
        time.add(interval, "minutes");
      } while (time.isSameOrBefore(maximumTime));
      return times;
    },
  },
};
</script>

<style>
body {
  /* font-family: Helvetica, "sans-serif"; */
  /* font-family: "Lora", serif; */
}

.calendar {
  background-color: #f6f5f8;
}

.calendar table {
  width: 100%;
  border-collapse: collapse;
  box-sizing: border-box;
}

.calendar table thead {
  background: #fff;
}

.calendar table thead th:first-of-type {
  width: 60px;
}

.calendar table thead th {
  padding: 16px 20px;
  color: #bab9c6;
  font-size: 20px;
}

.calendar table thead th .day {
  font-size: 15px;
  color: #807f97;
}

.calendar table thead th .date {
  color: #b9b8c4;
  font-size: 22px;
}

.calendar table thead tr {
  border: 1px solid #e4e4e4;
  border-bottom: 2px solid #efefef;
}

.calendar table tbody tr {
  height: 70px;
}

.calendar table tbody td {
  position: relative;
  border: 1px solid #f1f1f3;
  text-align: center;
  background-color: white;
  color: #7d7d93;
  font-size: 14px;
  font-weight: bold;
}

.calendar table tbody tr td:first-of-type {
  border: none;
  background: #fafafc;
  border-left: 1px solid #f8f8fa;
  vertical-align: baseline;
}

.calendar .event {
  position: absolute;
  z-index: 2;
  width: calc(90%);
  left: 5%;
  border-radius: 10px;
  background: #eff1f3;
  color: #323554;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  font-size: 14px;
  text-transform: capitalize;
}

.calendar .event img {
  width: 20px;
  height: 20px;
  border-radius: 100%;
  margin: 0 5px;
}

/*
Switcher styles
*/

.calendar .switcher {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 25px 20px;
}

.calendar .switcher .today {
  background: #e5e8ea;
  border-radius: 30px;
  padding: 15px 25px;
  font-size: 14px;
  color: #393954;
  font-weight: bold;
}

.calendar .switcher .date-range {
  display: flex;
  align-items: center;
}

.calendar .switcher .date-range .arrow {
  border-radius: 100%;
  height: 40px;
  width: 40px;
  line-height: 40px;
  text-align: center;
  border: 1px solid #eae9ec;
  cursor: pointer;
  color: #737389;
  font-weight: bold;
}

.calendar .switcher .date-range .current {
  margin: 0 40px;
  font-size: 20px;
  color: #343556;
  font-weight: bold;
}

.calendar .switcher .calendar-view {
  display: flex;
  font-weight: bold;
}

.calendar .switcher .calendar-view > div {
  padding: 10px 25px;
  border: 1px solid #e6e6e6;
  border-left: none;
  border-bottom-left-radius: unset;
  border-top-left-radius: 0px;
  border-radius: 4px;
  font-size: 14px;
}

.calendar .switcher .calendar-view .active {
  background: white;
  color: #3e3d56;
  border: none;
  border-bottom-right-radius: 1px;
  border-top-right-radius: 2px;
  box-shadow: 1px 2px 1px 0px #efefef;
}

.calendar tbody td .add-highlight {
  position: absolute;
  display: none;
  width: 90%;
  background: #59599e;
  top: 10px;
  border-radius: 4px;
  font-size: 20px;
  color: #fff;
  text-align: center;
  left: 0;
  right: 0;
  margin: 0 auto;
}
</style>
