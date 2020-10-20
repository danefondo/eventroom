<template>
  <table class="table">
    <thead>
      <tr>
        <th class="empty"></th>
        <!-- renderHTMLDateRow -->
        <th
          v-for="(eachDate, index) in dates"
          :key="index"
          :data-index="index + 1"
          :data-date="eachDate.date"
          :data-year="eachDate.year"
          :data-month="eachDate.monthInNum"
        >
          <span class="day"> {{ eachDate.day }}</span
          ><br /><span class="date">{{ eachDate.date }}</span>
        </th>
      </tr>
    </thead>
    <tbody>
      <!-- renderGrid 
      rows times hours, max 24 hours
        per row, load 7 days

      each row has hour
      each day has number from 1-7 per row

      with that info, figure out how to assign each its date-info

      how to load same in right order by some array of objects?

      each box can have an hour, and a number from 1-7
      any box can only be one of the 7 days
      if I know current week start date (example:19, monday)
      then I know end date (example: 25, sunday)

      i can have in LOCAL STORAGE: current selected week start date + day & end AND month AND year
      and then these will be dynamically calculated;
      
      and then through the array matching, I can populate them

      and if v-modeled or value based,
      then it will dynamically update if I load data
      -->
      <tr v-for="(each, index) in getTimes" :key="index">
        <td>{{ each }}</td>
        <td v-for="(i, index) in 7" :key="index" class="each-day">
          <div
            @click="getBlockData($event)"
            :style="getHeights"
            class="add-highlight"
          >
            This one?
          </div>
        </td>
      </tr>
    </tbody>
  </table>
</template>

<script>
import moment from "moment";
import { mapState } from "vuex";

export default {
  name: "Table",
  props: ["dates", "start", "end"],
  data() {
    return {
      interval: 60,
      minimumTime: "08:00",
      maximumTime: "16:00",
      height: 70,
    };
  },
  computed: {
    ...mapState({
      user: (state) => state.auth.user,
    }),
    calendarCaption() {
      let caption = `${this.start.month}, ${this.start.date} - `;
      if (this.start.month == this.end.month) {
        caption += this.end.date;
      } else {
        caption += `${this.end.month}, ${this.end.date}`;
      }
      return caption;
    },
    getTimes() {
      // EITHER PASS OR USE LOCAL/DB DATA FOR MIN, MAX, INTERVAL
      let min = this.minimumTime;
      let max = this.maximumTime;
      const time = moment(min, "HH:mm");
      const maxTime = moment(max, "HH:mm");
      const times = [];
      do {
        times.push(time.format("HH:mm"));
        time.add(this.interval, "minutes");
      } while (time.isSameOrBefore(maxTime));
      console.log("times", times);
      return times;
    },
    getHeights() {
      let height = this.height - 20;
      let heights = `line-height:${this.height}px; height:${height}px;`;
      return heights;
    },
  },
  methods: {
    getNodeIndex(elm) {
      return [...elm.parentNode.children].indexOf(elm);
    },
    plotEvents() {},
    getBlockData($event) {
      console.log("EVENT", $event);
      console.log("parent td?", $event.path[1]);
      let block = $event.target;
      console.log("block", block);
      let parent = block.closest("td");
      console.log("parent", parent);

      let ColumnIndex = this.getNodeIndex(parent);
      console.log("ColumnIndex", ColumnIndex);

      let parentTR = block.closest("tr");
      console.log("parentTR", parentTR);
      let RowIndex = this.getNodeIndex(parentTR);
      console.log("RowIndex", RowIndex);

      let monthBox = document.querySelectorAll("thead tr th")[ColumnIndex];
      console.log("month", monthBox);

      let month = monthBox.dataset.month;
      console.log("month", month);

      let year = monthBox.dataset.year;
      let date = monthBox.dataset.date;

      console.log("year", year);
      console.log("date", date);

      let startBox = document.querySelectorAll("tbody tr")[RowIndex];
      console.log("startBox", startBox);

      let endBox = document.querySelectorAll("tbody tr")[RowIndex + 1];
      console.log("endBox", endBox);

      let start = startBox.querySelectorAll("td")[0];

      let end = endBox.querySelectorAll("td")[0];

      console.log("start", start);
      console.log("end", end);

      let startText = start.textContent;
      let endText = end.textContent;

      console.log("startText", startText);
      console.log("endText", endText);

      // Later here preferences will also be picked
      // --> This data will be available in local data, maybe even global?

      this.selectEvent(startText, endText, date, month, year);
      // const column = $(this).parents("td").index();
      // const row = $(this).parents("tr").index();
      // const month = $("thead tr th").eq(column).data("month");
      // const year = $("thead tr th").eq(column).data("year");
      // const date = $("thead tr th").eq(column).data("date");
      // const start = $("tbody tr").eq(row).find("td").eq(0).text();
      // const end = $("tbody tr")
      //   .eq(row + 1)
      //   .find("td")
      //   .eq(0)
      //   .text();
      // this.selectEvent(start, end, date, month, year);
    },

    async selectEvent(start, end, date, month, year) {
      console.log(
        "Do you want to add this event? These are the people available for matching in this block.",
        start,
        end,
        date,
        month,
        year
      );

      let bookDate = `${year}-${month}-${date}`;
      let bookingData = {
        startTime: start,
        endTime: end,
        date: bookDate,
      };
      await this.$store.dispatch("booking/updateBookingData", bookingData);
    },
  },
};
</script>
<style scoped>
.each-day:hover .add-highlight {
  display: flex;
}
</style>
