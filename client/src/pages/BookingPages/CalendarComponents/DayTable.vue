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
      <!-- renderGrid -->
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
          :class="isPastDay(each) ? 'past-day' : ''"
          :data-daynum="i"
        >
          <div class="past-container" v-if="isPastDay(each)">
            <div @mousemove="showIsPast" class="past-inner tooltip">
              <span id="tooltip-span"> This hour has passed. </span>
            </div>
            <div
              v-if="unmatchedBookedPeople(each)"
              @click="$emit('select-slot', each.timeRowDay)"
              class="booked-person event"
            >
              <span>person booked here</span>
              <div>
                <span>{{
                  returnBestBookedToMatch(each, "bookedPeopleOnTime")
                }}</span>
              </div>
            </div>
            <!-- all YOUR booked sessions, either matched or unmatched-->
            <div
              v-else-if="returnBestBookedToMatch(each, 'bookedSessionsOnTime')"
              class="booked-session"
            >
              <span v-if="isMatched(each)">{{
                `Matched with ${isMatched(each, i)}`
              }}</span>
              <span v-else>Not yet matched...</span>
              <span>{{
                returnBestBookedToMatch(each, "bookedSessionsOnTime")
              }}</span>
            </div>
          </div>
          <div v-else-if="!isPastDay(each)">
            <div
              v-if="unmatchedBookedPeople(each)"
              @click="$emit('select-slot', each.timeRowDay)"
              class="booked-person event"
            >
              <span>person booked here</span>
              <div>
                <span>{{
                  returnBestBookedToMatch(each, "bookedPeopleOnTime")
                }}</span>
              </div>
            </div>
            <!-- all YOUR booked sessions, either matched or unmatched-->
            <div
              v-else-if="returnBestBookedToMatch(each, 'bookedSessionsOnTime')"
              class="booked-session"
            >
              <span v-if="isMatched(each)">{{
                `Matched with ${isMatched(each, i)}`
              }}</span>
              <span v-else>Not yet matched...</span>
              <span>{{
                returnBestBookedToMatch(each, "bookedSessionsOnTime")
              }}</span>
            </div>
            <div
              v-else-if="!each.timeRowDay.isSelected"
              @click="$emit('select-slot', each.timeRowDay)"
              :style="getHeights"
              class="add-highlight"
            >
              This one?
            </div>
            <div
              v-if="each.timeRowDay.isSelected"
              :style="getSelectedHeights"
              class="selected-container"
            >
              <div class="selected-info">
                Selected?
                <div class="selected-book">Book</div>
                <div
                  class="selected-close"
                  @click="$emit('cancel-slot', each.timeRowDay)"
                >
                  x
                </div>
              </div>
            </div>
          </div>
        </td>
      </tr>
    </tbody>
  </table>
</template>

<script>
import moment from "moment";
import { mapState } from "vuex";

import { isBefore } from "date-fns";

export default {
  name: "Table",
  props: [
    "dates",
    "start",
    "end",
    "calendarData",
    "rowNumberForWeekOrDay",
    "weekdayNum",
  ],
  data() {
    return {
      interval: 60,
      minimumTime: "08:00",
      maximumTime: "16:00",
      height: 70,
      selectedHeight: 70,
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
    getSelectedHeights() {
      let height = this.height;
      height = `height:${height}px;`;
      return height;
    },
    // isPastDay() {
    //   return (each, i) => this.checkIfPastDay(each, i);
    // },
    // isThisSelected() {

    // }
  },
  methods: {
    showIsPast(e) {
      // if (!document.hidden) {
      let tooltip = e.target.children[0];
      if (tooltip) {
        var x = e.clientX,
          y = e.clientY;
        tooltip.style.top = y + 20 + "px";
        tooltip.style.left = x + 20 + "px";
      }
      // }
    },
    // checkIfPastDay(each, i) {
    isPastDay(each) {
      // is day box time before current moment
      let isPastDay = false;

      each.timeRowDay.startTime;
      let startHour = each.timeRowDay.startTime.split(":")[0];
      let dayBoxDate = new Date(
        each.timeRowDay.year,
        each.timeRowDay.month - 1,
        each.timeRowDay.date,
        startHour
      );
      let now = new Date();
      isPastDay = isBefore(dayBoxDate, now);

      return isPastDay;
    },
    isMatched(each) {
      let matchedSession = null;
      let partnerUsername = null;

      matchedSession = each.timeRowDay["bookedSessionsOnTime"][0];

      if (!matchedSession) return console.log("@isMatched: Missing session.");
      console.log("@isMatched, session: ", matchedSession);

      // Both must have value for there to be a possibility of match
      if (matchedSession.firstPartnerId && matchedSession.secondPartnerId) {
        // If first is user itself, make the partner the other one
        if (matchedSession.firstPartnerId == this.user._id) {
          partnerUsername = matchedSession.secondPartnerUsername;
        }
        // If second is user itself, make the partner the other one
        else if (matchedSession.secondPartnerId == this.user._id) {
          partnerUsername = matchedSession.firstPartnerUsername;
        }
      }
      console.log("partnerUsername", partnerUsername);
      return partnerUsername;
    },

    returnBestBookedToMatch(each, type) {
      let bestBookedToMatch;

      if (each.timeRowDay && each.timeRowDay[type]) {
        // perform all sorts of check later
        // right now just return the first one
        bestBookedToMatch = each.timeRowDay[type][0];
      }
      return bestBookedToMatch ? bestBookedToMatch.queryDateTime : null;
    },
    unmatchedBookedPeople(each) {
      if (
        !this.isPastDay(each) &&
        this.returnBestBookedToMatch(each, "bookedPeopleOnTime") &&
        !this.isMatched(each)
      ) {
        return true;
      } else {
        return false;
      }
    },
  },
};
</script>
<style scoped>
.each-day:hover .add-highlight {
  display: flex;
}

.past-day {
  background-color: #fbfbfb;
}

.selected-container {
  display: flex;
  align-items: center;
  justify-content: center;
}

.selected-info {
  background-color: #eef1f3;
  border-radius: 4px;
  height: 95%;
  width: 95%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.selected-close {
  position: absolute;
  right: 5px;
  top: 5px;
  width: 16px;
  height: 16px;
  border-radius: 360px;
  display: flex;
  box-sizing: border-box;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  text-align: center;
}

.selected-close:hover {
  background-color: #dcdfe0;
}

.selected-book {
  position: absolute;
  left: 5px;
  bottom: 5px;
  padding: 1px 13px;
  border-radius: 360px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  background-color: #dcdfe0;
  color: #5600ff;
  font-size: 17px;
}

.selected-book:hover {
  background-color: #b4b8b9;
}

.past-container {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 70px;
  cursor: default;
}

.past-inner {
  background-color: #eef1f3;
  border-radius: 4px;
  height: 95%;
  width: 95%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  cursor: default;
}

.tooltip {
  text-decoration: none;
  position: relative;
}
.tooltip span {
  display: none;
  z-index: 9999;
  background-color: white;
  padding: 4px 8px;
  border-radius: 360px;
}
.tooltip:hover span {
  display: block;
  position: fixed;
  overflow: hidden;
}
</style>
