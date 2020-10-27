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
        :style="getSelectedHeights"
      >
        <td>
          <div class="hour">{{ each.time }}</div>
        </td>
        <td
          v-for="(index, i) in rowNumberForWeekOrDay"
          :key="index"
          class="each-day"
          :class="isPastDay(each, i) ? 'past-day' : ''"
          :data-daynum="i"
        >
          <div
            :style="getSelectedHeights"
            class="past-container"
            v-if="isPastDay(each, i)"
          >
            <div @mousemove="showIsPast" class="past-inner tooltip">
              <span id="tooltip-span"> This hour has passed. </span>
            </div>
            <!-- all YOUR booked sessions, either matched or unmatched-->
            <div
              v-if="returnBestBookedToMatch(each, i, 'bookedSessionsOnTime')"
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
          </div>
          <div v-else-if="!isPastDay(each, i)">
            <!--     
              1. If not past day
              2. If user has booked session at time, show that and nothing else
              3. If user has no booked session at time && others that are UNMATCHED are booked for the time, show first in list or best preferences (if many, show faces icons in row)
            -->
            <div
              v-if="userHasSessionForSlot(each, i)"
              :style="getSelectedHeights"
              class="booked-container"
            >
              <div class="booked-info">
                <span class="booked-time">{{
                  bookedSessionTime(each, i, "bookedSessionsOnTime")
                }}</span>
                <div v-if="userIsMatchedForSlot(each, i)">
                  <span class="booked-title">{{
                    `${matchedPartnerName(each, i)}`
                  }}</span>
                  <div
                    class="join-session"
                    @click="$emit('cancel-slot', each.timeRowDays[i])"
                  >
                    Join
                  </div>
                </div>
                <span v-else class="booked-title-unmatched"
                  >Not yet matched...</span
                >
              </div>
            </div>
            <div
              v-else-if="unmatchedBookedPeopleExist(each, i)"
              @click="$emit('select-slot', each.timeRowDays[i])"
            >
              <div class="booked-unmatched-container">
                <div class="booked-unmatched-info">
                  <div class="calendar-profile-icon"></div>
                  <span class="unmatched-title">{{
                    returnUnmatchedBookedPeople(each, i)
                  }}</span>
                </div>
              </div>
            </div>
            <!-- all YOUR booked sessions, either matched or unmatched-->

            <div
              v-else-if="!each.timeRowDays[i].isSelected"
              @click="$emit('select-slot', each.timeRowDays[i])"
              :style="getSelectedHeights"
              class="highlight-container"
            >
              <div class="highlight-info">Select?</div>
            </div>
            <div
              v-if="each.timeRowDays[i].isSelected"
              :style="getSelectedHeights"
              class="selected-container"
            >
              <div class="selected-info">
                Selected
                <div
                  class="selected-book"
                  @click="$emit('cancel-slot', each.timeRowDays[i])"
                >
                  Book
                </div>
                <div
                  class="selected-close"
                  @click="$emit('cancel-slot', each.timeRowDays[i])"
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
      maximumTime: "23:00",
      height: 100,
      selectedHeight: 100,
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
    isPastDay(each, i) {
      // is day box time before current moment
      let isPastDay = false;
      each.timeRowDays[i].startTime;
      let startHour = each.timeRowDays[i].startTime.split(":")[0];
      let dayBoxDate = new Date(
        each.timeRowDays[i].year,
        each.timeRowDays[i].month - 1,
        each.timeRowDays[i].date,
        startHour
      );

      let now = new Date();
      isPastDay = isBefore(dayBoxDate, now);

      return isPastDay;
    },
    userHasSessionForSlot(each, i) {
      // if (
      //   each.timeRowDays &&
      //   each.timeRowDays.length &&
      //   each.timeRowDays[i] &&
      //   each.timeRowDays[i][type] &&
      //   each.timeRowDays[i][type].length
      // ) {}
      let userHasSessionForSlot = false;

      let slot = each.timeRowDays[i]["bookedSessionsOnTime"];
      let session = slot[0];

      if (session) {
        userHasSessionForSlot = true;
      }

      return userHasSessionForSlot;
    },
    userIsMatchedForSlot(each, i) {
      let session = null;
      let matched = false;

      session = each.timeRowDays[i]["bookedSessionsOnTime"][0];

      if (!session) return null;

      if (session.firstPartnerId && session.secondPartnerId) {
        matched = true;
      }
      return matched;
    },
    matchedPartnerName(each, i) {
      let session = null;
      let partnerUsername = null;

      session = each.timeRowDays[i]["bookedSessionsOnTime"][0];

      if (!session) return null;

      // If first is user itself, make the partner the other one
      if (session.firstPartnerId == this.user._id) {
        partnerUsername = session.secondPartnerUsername;
      }
      // If second is user itself, make the partner the other one
      else if (session.secondPartnerId == this.user._id) {
        partnerUsername = session.firstPartnerUsername;
      }
      return partnerUsername;
    },
    bookedSessionTime(each, i) {
      let session = each.timeRowDays[i]["bookedSessionsOnTime"][0];
      let sessionTime = session.queryDateTime;
      if (sessionTime) {
        let datesArray = sessionTime.split("-");
        sessionTime = datesArray[3] + "-" + datesArray[4];
      }

      return sessionTime ? sessionTime : null;
    },
    bookedPersonTime(each, i) {
      let session = each.timeRowDays[i]["bookedPeopleOnTime"][0];
      let sessionTime = session.queryDateTime;

      return sessionTime ? sessionTime : null;
    },
    isMatched(each, i) {
      let matchedSession = null;
      let partnerUsername = null;

      matchedSession = each.timeRowDays[i]["bookedSessionsOnTime"][0];

      if (!matchedSession) return;
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

    returnBestBookedToMatch(each, i, type) {
      let bestBookedToMatch;
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

      return bestBookedToMatch ? bestBookedToMatch.queryDateTime : null;

      // The one person chosen from the list should be best match, or then
      // the first one, or a random one
    },
    unmatchedBookedPeopleExist(each, i) {
      let unmatchedBookedPeople = false;
      if (
        each.timeRowDays &&
        each.timeRowDays.length &&
        each.timeRowDays[i] &&
        each.timeRowDays[i]["bookedPeopleOnTime"] &&
        each.timeRowDays[i]["bookedPeopleOnTime"].length &&
        each.timeRowDays[i]["bookedPeopleOnTime"].length > 0
      ) {
        let bookedPeople = each.timeRowDays[i]["bookedPeopleOnTime"];

        // Check that unmatched; if even one is found, good enough
        bookedPeople.forEach((person) => {
          if (
            (person.firstPartnerId || person.secondPartnerId) &&
            (!person.firstPartnerId || !person.secondPartnerId) &&
            !unmatchedBookedPeople
          ) {
            unmatchedBookedPeople = true;
          }
        });
      }
      return unmatchedBookedPeople;
    },
    returnUnmatchedBookedPeople(each, i) {
      let unmatchedPerson = null;
      let unmatchedPersonName = null;
      if (
        each.timeRowDays &&
        each.timeRowDays.length &&
        each.timeRowDays[i] &&
        each.timeRowDays[i]["bookedPeopleOnTime"] &&
        each.timeRowDays[i]["bookedPeopleOnTime"].length
      ) {
        // perform all sorts of check later
        // right now just return the first one
        let bookedPeople = each.timeRowDays[i]["bookedPeopleOnTime"];

        bookedPeople.forEach((person) => {
          if (
            (person.firstPartnerId || person.secondPartnerId) &&
            (!person.firstPartnerId || !person.secondPartnerId) &&
            !unmatchedPerson
          ) {
            unmatchedPerson = person;
          }
        });
        // go over and pick first that is not matched

        // WHEN ADDING TO LIST, DO NOT EVEN ADD THEM IF
      }
      if (unmatchedPerson) {
        unmatchedPersonName =
          unmatchedPerson.firstPartnerUsername ||
          unmatchedPerson.secondPartnerUsername;
      }

      return unmatchedPersonName;
    },
    getPersonBookedHere(each, i) {
      let unmatchedSession = null;
      let partnerUsername = null;

      unmatchedSession = each.timeRowDays[i]["bookedPeopleOnTime"][0];

      if (!unmatchedSession) return;
      console.log("@getPersonBookedHere, session: ", unmatchedSession);

      if (unmatchedSession.firstPartnerId || unmatchedSession.secondPartnerId) {
        partnerUsername =
          unmatchedSession.firstPartnerUsername ||
          unmatchedSession.secondPartnerUsername;
      }
      console.log("partnerUsername", partnerUsername);
      return partnerUsername;
    },
    // getPersonBookedHereString(each, i) {
    //   unmatchedSession = each.timeRowDays[i]["bookedSessionsOnTime"][0];
    // },
  },
};
</script>
<style scoped>
.each-day:hover .highlight-container {
  display: flex;
}

.past-day {
  background-color: #fbfbfb;
}

/* .calendar tbody td .highlight-container {
  position: absolute;
  display: none;
  width: 95%;
  height: 95%;
  background: #59599e;
  border-radius: 4px;
  font-size: 20px;
  color: #fff;
  text-align: center;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  margin: auto;
} */

.booked-unmatched-container,
.selected-container,
.booked-container {
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  width: 100%;
}

.booked-unmatched-container {
  height: 35px;
  margin-top: 5px;
}

.booked-unmatched-info,
.selected-info,
.booked-info {
  background-color: #eef1f3;
  border-radius: 4px;
  height: 95%;
  width: 95%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.booked-unmatched-info {
  /* background-color: #eaedfb; */
  background-color: #fafafc;
  border: 1px solid #d8d8d833;
}

.calendar-profile-icon {
  width: 25px !important;
  height: 25px !important;
  background-color: blue;
  border-radius: 360px;
  position: absolute;
  left: 7px;
}

.booked-info {
  flex-direction: column;
  justify-content: space-around;
  height: 88%;
  /* background-color: #f7f7fb; */
  background-color: #f7f7fbad;
  /* border: 1px solid #a3a3ff33; */
  border: 1px solid #d8d8d833;
}

.booked-title,
.booked-title-unmatched {
  color: #343556de;
  position: absolute;
  top: 23px;
  left: 10px;
  /* color: #5600ff; */
  font-size: 18px;
  font-weight: 700;
  text-transform: capitalize;
}

.booked-title-unmatched {
  color: #343556bf;
  text-transform: none;
  text-align: left;
}

.booked-time {
  /* background-color: #dcdfe0; */
  padding: 1px 6px;
  /* padding-right: 22px; */
  border-radius: 360px;
  /* border-top-left-radius: 10px; */
  /* border-bottom-right-radius: 32px; */
  font-size: 13px !important;
  font-weight: bold;
  /* color: #5600ff;
  color: #310090cc; */
  color: #b7b7ca;
  margin-right: auto;
  /* margin-top: -5px; */
  font-weight: 800;
  /* margin-left: 8px; */
  position: absolute;
  top: 8px;
  left: 6px;
  /* background-color: #f6f2ff; */
  /* background-color: #ebecfb; */
}

.highlight-container {
  display: none;
  align-items: center;
  justify-content: center;
  position: absolute;
  width: 100%;
  cursor: default;
}

.highlight-info {
  background-color: #eef1f3;
  border-radius: 4px;
  height: 95%;
  width: 95%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.unmatched-title {
  position: absolute;
  left: 40px;
  font-size: 18px;
  color: #343556;
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

/* .selected-book {
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
} */

.join-session,
.selected-book {
  position: absolute;
  left: 10px;
  bottom: 5px;
  padding: 2px 12px;
  border-radius: 360px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  background-color: #ebecfb;
  color: #5600ff;
  font-size: 17px;
}

.join-session:hover,
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

.hour {
  display: flex;
  align-items: baseline;
  justify-content: center;
  position: absolute;
  width: 100%;
}
</style>
