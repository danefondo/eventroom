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

      I know the hour
      based on [i] number, I know the day of the week
      based on week start day I can generate which date
      somehow need to list an array of this week's dates

      i can have in LOCAL STORAGE: current selected week start date + day & end AND month AND year
      and then these will be dynamically calculated;
      
      and then through the array matching, I can populate them

      and if v-modeled or value based,
      then it will dynamically update if I load data

      just populate getTimes with more data
      it must have 'bookedPeopleInDateTime'
      it must have 'bookedSessionInDateTime' + metadata if matched, etc.

      that getTimes gets populated at some point
      and then it gets updated

      -->
      <!-- <tr v-for="(each, index) in getTimes" :key="index"> -->
      <tr
        v-for="(each, index) in calendarData"
        :key="index"
        :data-rowhour="each.time"
      >
        <td>{{ each.time }}</td>
        <td
          v-for="(index, i) in rowNumberForWeekOrDay"
          :key="index"
          class="each-day"
          :data-daynum="i"
        >
          <div
            v-if="returnBestBookedToMatch(each, i, 'bookedPeopleOnTime') && !isMatched(each, i)"
            @click="
              week
                ? $emit('select-slot', each.timeRowDays[i])
                : $emit('select-slot', each.timeRowDay)
            "
            class="booked-person event"
          >
            <span>person booked here</span>
            <div>
              <span>{{
                returnBestBookedToMatch(each, i, "bookedPeopleOnTime")
              }}</span>
            </div>
          </div>
          <!-- all YOUR booked sessions, either matched or unmatched-->
          <div
            v-else-if="returnBestBookedToMatch(each, i, 'bookedSessionsOnTime')"
            class="booked-session"
          >
            <span v-if="isMatched(each, i)">{{
              `Matched with ${isMatched(each, i)}`
            }}</span>
            <span v-else>Not yet matched...</span>
            <span>{{
              returnBestBookedToMatch(each, i, "bookedSessionsOnTime")
            }}</span>
          </div>
          <!-- highlight is in two boxes to speed up & avoid week check per time, the millisecond difference really makes a difference, rather than having it in each click, even putting emit to function vs direct makes a difference-->
          <div
            v-else
            @click="
              week
                ? $emit('select-slot', each.timeRowDays[i])
                : $emit('select-slot', each.timeRowDay)
            "
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
  props: [
    "dates",
    "start",
    "end",
    "calendarData",
    "rowNumberForWeekOrDay",
    "week",
    "weekdayNum",
  ],
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
    isMatched(each, i) {
      let matched = null;
      if (this.week) {
        console.log("SESSION", each, i);
        let session = each.timeRowDays[i]["bookedSessionsOnTime"][0];
        if (!session) {
          return;
        }
        let firstPartnerId = session.firstPartnerId;
        let secondPartnerId = session.secondPartnerId;
        let firstPartnerUsername = session.firstPartnerUsername;
        let secondPartnerUsername = session.secondPartnerUsername;

        let partnerUsername;
        if (firstPartnerId && secondPartnerId) {
          if (firstPartnerId == this.user._id) {
            partnerUsername = secondPartnerUsername;
          } else {
            partnerUsername = firstPartnerUsername;
          }
        }
        console.log("partnerUsername", partnerUsername, matched);
        matched = partnerUsername;
      } else {
        let session = each.timeRowDay["bookedSessionsOnTime"][0];
        let firstPartnerId = session.firstPartnerId;
        let secondPartnerId = session.secondPartnerId;
        let firstPartnerUsername = session.firstPartnerUsername;
        let secondPartnerUsername = session.secondPartnerUsername;

        let partnerUsername;
        if (firstPartnerId && secondPartnerId) {
          if (firstPartnerId == this.user._id) {
            partnerUsername = secondPartnerUsername;
          } else {
            partnerUsername = firstPartnerUsername;
          }
        }
        console.log("partnerUsername", partnerUsername, matched);
        matched = partnerUsername;
      }
      console.log("partnerUsername", matched);
      return matched;
    },
    returnBestBookedToMatch(each, i, type) {
      let bestBookedToMatch;
      if (this.week) {
        if (
          each.timeRowDays &&
          each.timeRowDays.length &&
          each.timeRowDays[i] &&
          each.timeRowDays[i][type] &&
          each.timeRowDays[i][type].length
        ) {
          // perform all sorts of check later
          // right now just return the first one
          bestBookedToMatch = each.timeRowDays[i][type][0];
        }
      } else {
        if (each.timeRowDay && each.timeRowDay[type]) {
          // perform all sorts of check later
          // right now just return the first one
          bestBookedToMatch = each.timeRowDay[type][0];
          console.log("bestyBOOKEd", bestBookedToMatch);
        }
      }

      return bestBookedToMatch ? bestBookedToMatch.queryDateTime : null;

      // For single day
      // The options are different
      // It's only...
      // For this row (e.g. time TODAY)
      // is there anyone?

      // and [i] kind of needs to be the day's number from the get go
      // so if !week, then i ? weekdayNum

      // For each calendarData (e.g. per hour)
      // --> Each.time (e.g. hour, e.g. ROW)
      // --> For each row, create 7 days (e.g per 7 times day block, seven iterations)
      // --> In each specific day block, list booked people in the day block
      // Actually list just one, but you can click to see everyone
      // each.timeRowDays[i].bookedPeopleOnTime[0]

      // The one person chosen from the list should be best match, or then
      // the first one, or a random one
    },
    /*getBlockData(each) {
      this.selectEvent(each.startTime, each.endTime, each.date, each.month, each.year)
    },*/

    /*async selectEvent(start, end, date, month, year) {
      console.log(
        "Do you want to add this event? These are the people available for matching in this block.",
        start,
        end,
        date,
        month,
        year
      );

      let [hours, minutes] = start.split(":");
      let rawDateTime = new Date(year, month, date, hours, minutes);
      console.log("rawDateTime", rawDateTime);
      // rawDateTime.setHours(+hours);
      // rawDateTime.setMinutes(minutes);
      rawDateTime.setSeconds("00");
      console.log("fullDatetime", rawDateTime);
      let queryDate = `${year}-${month}-${date}-${start}-${end}`;
      let bookDate = `${year}-${month}-${date}`;
      let bookingData = {
        startTime: start,
        endTime: end,
        date: bookDate,
        queryDate: queryDate,
        rawDateTime: rawDateTime,
      };
      thi("booking/updateBookingData", bookingData);
    },*/
  },
};
</script>
<style scoped>
.each-day:hover .add-highlight {
  display: flex;
}
</style>
