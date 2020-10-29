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
      <tr
        v-for="(each, index) in calendarData"
        :key="index"
        :data-rowhour="each.time"
      >
        <div class="hour">{{ each.time }}</div>
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
            <!-- all YOUR booked sessions, either matched or unmatched-->
            <div
              v-if="returnBestBookedToMatch(each, 'bookedSessionsOnTime')"
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
              v-if="userHasSessionForSlot(each)"
              :style="getSelectedHeights"
              class="booked-container"
            >
              <div class="booked-info">
                <span v-if="userIsMatchedForSlot(each)" class="booked-title">{{
                  `Matched with ${matchedPartnerName(each)}`
                }}</span>
                <span v-else class="booked-title">Not yet matched...</span>
                <span>{{
                  bookedSessionTime(each, "bookedSessionsOnTime")
                }}</span>
              </div>
            </div>

            <div
              v-else-if="unmatchedBookedPeopleExist(each)"
              @click="$emit('select-slot', each.timeRowDay)"
              class="booked-person event"
            >
              <div class="booked-unmatched-container">
                <div class="booked-unmatched-info">
                  <div class="calendar-profile-icon"></div>
                  <span class="unmatched-title">{{
                    returnUnmatchedBookedPeople(each)
                  }}</span>
                </div>
              </div>
              <div>
                <span>{{ bookedPersonTime(each) }}</span>
              </div>
            </div>
            <!-- all YOUR booked sessions, either matched or unmatched-->

            <div
              v-else-if="!each.timeRowDay.isSelected"
              @click="$emit('select-slot', each.timeRowDay)"
              :style="getSelectedHeights"
              class="highlight-container"
            >
              <div class="highlight-info">Select?</div>
            </div>
            <div
              v-if="each.timeRowDay.isSelected"
              :style="getSelectedHeights"
              class="selected-container"
            >
              <div class="selected-info">
                Selected?
                <div
                  class="selected-book"
                  @click="$emit('cancel-slot', each.timeRowDay)"
                >
                  Book
                </div>
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
import { mapState } from "vuex";

import { isBefore } from "date-fns";

export default {
  name: "Table",
  props: ["dates", "calendarData", "rowNumberForWeekOrDay"],
  data() {
    return {
      interval: 60,
      minimumTime: "08:00",
      maximumTime: "16:00",
      height: 90,
      selectedHeight: 90,
    };
  },
  computed: {
    ...mapState({
      user: (state) => state.auth.user,
    }),
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
      // is day box time before current time
      let isPastDay = false;

      each.timeRowDays[0].startHour;
      let startHour = each.timeRowDays[0].startHour.split(":")[0];
      let dayBoxDate = new Date(
        each.timeRowDays[0].year,
        each.timeRowDays[0].month - 1,
        each.timeRowDays[0].date,
        startHour
      );
      let now = new Date();
      isPastDay = isBefore(dayBoxDate, now);

      return isPastDay;
    },

    userHasSessionForSlot(each) {
      // if (
      //   each.timeRowDays &&
      //   each.timeRowDays.length &&
      //   each.timeRowDays[i] &&
      //   each.timeRowDays[i][type] &&
      //   each.timeRowDays[i][type].length
      // ) {}
      let userHasSessionForSlot = false;

      let slot = each.timeRowDay["bookedSessionsOnTime"];
      let session = slot[0];

      if (session) {
        userHasSessionForSlot = true;
      }

      return userHasSessionForSlot;
    },
    userIsMatchedForSlot(each) {
      let session = null;
      let matched = false;

      session = each.timeRowDay["bookedSessionsOnTime"][0];

      if (!session) return null;

      if (session.firstPartnerId && session.secondPartnerId) {
        matched = true;
      }
      return matched;
    },
    matchedPartnerName(each) {
      let session = null;
      let partnerUsername = null;

      session = each.timeRowDay["bookedSessionsOnTime"][0];

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
    bookedSessionTime(each) {
      let session = each.timeRowDay["bookedSessionsOnTime"][0];
      let sessionTime = session.dateTime;

      return sessionTime ? sessionTime : null;
    },
    bookedPersonTime(each) {
      let session = each.timeRowDay["bookedPeopleOnTime"][0];
      let sessionTime = session.dateTime;

      return sessionTime ? sessionTime : null;
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
      return bestBookedToMatch ? bestBookedToMatch.dateTime : null;
    },

    unmatchedBookedPeopleExist(each) {
      let unmatchedBookedPeople = false;
      if (
        each.timeRowDay &&
        each.timeRowDay["bookedPeopleOnTime"] &&
        each.timeRowDay["bookedPeopleOnTime"].length &&
        each.timeRowDay["bookedPeopleOnTime"].length > 0
      ) {
        let bookedPeople = each.timeRowDay["bookedPeopleOnTime"];

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
    returnUnmatchedBookedPeople(each) {
      let unmatchedPerson = null;
      let unmatchedPersonName = null;
      if (
        each.timeRowDay &&
        each.timeRowDay["bookedPeopleOnTime"] &&
        each.timeRowDay["bookedPeopleOnTime"].length
      ) {
        // perform all sorts of check later
        // right now just return the first one
        let bookedPeople = each.timeRowDay["bookedPeopleOnTime"];

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
    getPersonBookedHere(each) {
      let unmatchedSession = null;
      let partnerUsername = null;

      unmatchedSession = each.timeRowDay["bookedPeopleOnTime"][0];

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

.each-day {
  background-color: white !important;
  border: 1px solid #f1f1f3 !important;
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
  margin-top: 1px;
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
}

.booked-title {
  color: #343556;
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

.hour {
  display: flex;
  align-items: baseline;
  justify-content: center;
  position: absolute;
  width: 100%;
}
</style>
