<template>
  <table class="table">
    <thead>
      <tr>
        <th class="empty"></th>
        <!-- renderHTMLDateRow -->
        <th
          v-for="(eachDate, index) in weekDates"
          :key="index"
          :data-index="index + 1"
          :data-date="eachDate.dateNum"
          :data-year="eachDate.yearNum"
          :data-month="eachDate.monthNum"
        >
          <span class="day"> {{ eachDate.dayNameShort }}</span
          ><br /><span class="date">{{ eachDate.dateNum }}</span>
        </th>
      </tr>
    </thead>
    <tbody>
      <!-- renderGrid -->
      <tr
        v-for="(eachHourRow, index) in calendarData"
        :key="index"
        :data-rowhour="eachHourRow.slotStartTime"
        :style="getSelectedHeights"
      >
        <td>
          <div class="hour">{{ eachHourRow.slotStartTime }}</div>
        </td>
        <td
          v-for="(index, i) in rowNumberForWeekOrDay"
          :key="index"
          class="each-day"
          :class="isPastDay(eachHourRow, i) ? 'past-day' : ''"
          :data-daynum="i"
        >
          <div
            :style="getSelectedHeights"
            class="past-container"
            v-if="isPastDay(eachHourRow, i)"
          >
            <div @mousemove="showIsPast" class="past-inner tooltip">
              <span id="tooltip-span"> This hour has passed. </span>
            </div>
            <!-- all YOUR booked sessions, either matched or unmatched-->
            <div
              v-if="
                returnBestBookedToMatch(eachHourRow, i, 'bookedSessionsOnTime')
              "
              class="booked-session"
            >
              <span v-if="isMatched(eachHourRow, i)">{{
                `Matched with ${isMatched(eachHourRow, i)}`
              }}</span>
              <span v-else>Not yet matched...</span>
              <span>{{
                returnBestBookedToMatch(eachHourRow, i, "bookedSessionsOnTime")
              }}</span>
            </div>
          </div>
          <div v-else-if="!isPastDay(eachHourRow, i)">
            <!--     
              1. If not past day
              2. If user has booked session at time, show that and nothing else
              3. If user has no booked session at time && others that are UNMATCHED are booked for the time, show first in list or best preferences (if many, show faces icons in row)
            -->
            <div
              v-if="userHasSessionForSlot(eachHourRow, i)"
              :style="getSelectedHeights"
              class="booked-container"
            >
              <div class="booked-info">
                <div
                  class="selected-close"
                  v-if="!userIsMatchedForSlot(eachHourRow, i)"
                  @click="$emit('cancel-session', eachHourRow.hourRowDays[i])"
                >
                  x
                </div>
                <span class="booked-time">{{
                  bookedSessionTime(eachHourRow, i, "bookedSessionsOnTime")
                }}</span>
                <div v-if="userIsMatchedForSlot(eachHourRow, i)">
                  <span class="booked-title">{{
                    `${matchedPartnerName(eachHourRow, i)}`
                  }}</span>
                  <router-link
                    :to="joinSessionLink(eachHourRow, i)"
                    class="join-session"
                  >
                    Join
                  </router-link>
                  <div
                    class="selected-close"
                    @click="$emit('set-canceling', eachHourRow.hourRowDays[i])"
                  >
                    x
                  </div>
                </div>
                <span v-else class="booked-title-unmatched"
                  >Not yet matched...
                </span>
              </div>
            </div>
            <div
              v-else-if="unmatchedBookedPeopleExist(eachHourRow, i)"
              @click="$emit('select-slot', eachHourRow.hourRowDays[i])"
            >
              <div class="booked-unmatched-container">
                <div class="booked-unmatched-info">
                  <div class="calendar-profile-icon"></div>
                  <span class="unmatched-title">{{
                    returnUnmatchedBookedPeople(eachHourRow, i)
                  }}</span>
                </div>
              </div>
            </div>
            <!-- all YOUR booked sessions, either matched or unmatched-->

            <div
              v-else-if="!eachHourRow.hourRowDays[i].isSelected"
              @click="$emit('select-slot', eachHourRow.hourRowDays[i])"
              :style="getSelectedHeights"
              class="highlight-container"
            >
              <div class="highlight-info">Select?</div>
            </div>
            <div
              v-if="eachHourRow.hourRowDays[i].isSelected"
              :style="getSelectedHeights"
              class="selected-container"
            >
              <div class="selected-info">
                Selected
                <div
                  class="selected-book"
                  @click="$emit('book-slot', eachHourRow.hourRowDays[i])"
                >
                  Book
                </div>
                <div
                  class="selected-close"
                  @click="$emit('cancel-slot', eachHourRow.hourRowDays[i])"
                >
                  x
                </div>
              </div>
            </div>
            <div
              v-if="eachHourRow.hourRowDays[i].isCanceling"
              :style="getSelectedHeights"
              class="cancel-container"
            >
              <div class="cancel-info">
                <span class="cancel-time">{{
                  bookedSessionTime(eachHourRow, i, "bookedSessionsOnTime")
                }}</span>
                <div>
                  <span class="cancel-title">Cancel session?</span>
                  <div
                    @click="$emit('exit-canceling', eachHourRow.hourRowDays[i])"
                    class="cancel-buttons"
                  >
                    No
                  </div>
                  <div
                    @click="$emit('cancel-session', eachHourRow.hourRowDays[i])"
                    class="cancel-buttons cancel-button"
                  >
                    Yes
                  </div>
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

import { isBefore, format, addMinutes } from "date-fns";

export default {
  name: "Table",
  props: ["weekDates", "calendarData", "rowNumberForWeekOrDay"],
  data() {
    return {
      interval: 60,
      minimumTime: "00:00",
      maximumTime: "23:00",
      height: 100,
      selectedHeight: 100,
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
  },
  methods: {
    joinSessionLink(eachHourRow, i) {
      let sessionId =
        eachHourRow.hourRowDays[i]["bookedSessionsOnTime"][0]["_id"];
      let sessionLink = "/session/" + sessionId;
      return sessionLink;
    },
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
    isPastDay(eachHourRow, i) {
      // is day box time before current time
      let isPastDay = false;
      let hourRowDays = eachHourRow.hourRowDays[i];
      let slotStartTime = hourRowDays.slotStartTime.split(":")[0];
      let dayBoxDate = new Date(
        hourRowDays.yearNum,
        hourRowDays.monthNum - 1,
        hourRowDays.dateNum,
        slotStartTime
      );

      let now = new Date();
      isPastDay = isBefore(dayBoxDate, now);

      return isPastDay;
    },
    userHasSessionForSlot(eachHourRow, i) {
      let userHasSessionForSlot = false;
      if (
        eachHourRow.hourRowDays &&
        eachHourRow.hourRowDays.length &&
        eachHourRow.hourRowDays[i] &&
        eachHourRow.hourRowDays[i]["bookedSessionsOnTime"] &&
        eachHourRow.hourRowDays[i]["bookedSessionsOnTime"].length
      ) {
        let slot = eachHourRow.hourRowDays[i]["bookedSessionsOnTime"];
        let session = slot[0];

        if (session) {
          userHasSessionForSlot = true;
        }
      }

      return userHasSessionForSlot;
    },
    userIsMatchedForSlot(eachHourRow, i) {
      let session = null;
      let matched = false;

      session = eachHourRow.hourRowDays[i]["bookedSessionsOnTime"][0];

      if (!session) return null;

      if (session.firstPartnerId && session.secondPartnerId) {
        matched = true;
      }
      return matched;
    },
    matchedPartnerName(eachHourRow, i) {
      let session = null;
      let partnerUsername = null;

      session = eachHourRow.hourRowDays[i]["bookedSessionsOnTime"][0];

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
    bookedSessionTime(eachHourRow, i) {
      let sessionTime = null;
      let session = eachHourRow.hourRowDays[i]["bookedSessionsOnTime"][0];
      if (session) {
        sessionTime = new Date(session.dateTime);
        if (sessionTime) {
          let sessionEndTime = addMinutes(sessionTime, this.interval);
          console.log("sestime", sessionTime);
          sessionTime = format(sessionTime, "HH:mm");
          sessionEndTime = format(sessionEndTime, "HH:mm");
          sessionTime = sessionTime + "-" + sessionEndTime;
        }
      }

      return sessionTime;
    },
    bookedPersonTime(eachHourRow, i) {
      let session = eachHourRow.hourRowDays[i]["bookedPeopleOnTime"][0];
      let sessionTime = new Date(session.dateTime);
      if (sessionTime) {
        let sessionEndTime = addMinutes(sessionTime, this.interval);
        sessionTime = format(sessionTime, "HH:mm");
        sessionEndTime = format(sessionEndTime, "HH:mm");
        sessionTime = sessionTime + "-" + sessionEndTime;
      }
      return sessionTime ? sessionTime : null;
    },
    isMatched(eachHourRow, i) {
      let matchedSession = null;
      let partnerUsername = null;

      matchedSession = eachHourRow.hourRowDays[i]["bookedSessionsOnTime"][0];

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

    returnBestBookedToMatch(eachHourRow, i, type) {
      let bestBookedToMatch;
      if (
        eachHourRow.hourRowDays &&
        eachHourRow.hourRowDays.length &&
        eachHourRow.hourRowDays[i] &&
        eachHourRow.hourRowDays[i][type] &&
        eachHourRow.hourRowDays[i][type].length
      ) {
        // perform all sorts of check later
        // right now just return the first one
        bestBookedToMatch = eachHourRow.hourRowDays[i][type][0];
      }

      return bestBookedToMatch ? bestBookedToMatch.dateTime : null;

      // The one person chosen from the list should be best match, or then
      // the first one, or a random one
    },
    unmatchedBookedPeopleExist(eachHourRow, i) {
      let unmatchedBookedPeople = false;
      if (
        eachHourRow.hourRowDays &&
        eachHourRow.hourRowDays.length &&
        eachHourRow.hourRowDays[i] &&
        eachHourRow.hourRowDays[i]["bookedPeopleOnTime"] &&
        eachHourRow.hourRowDays[i]["bookedPeopleOnTime"].length &&
        eachHourRow.hourRowDays[i]["bookedPeopleOnTime"].length > 0
      ) {
        let bookedPeople = eachHourRow.hourRowDays[i]["bookedPeopleOnTime"];

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
    returnUnmatchedBookedPeople(eachHourRow, i) {
      let unmatchedPerson = null;
      let unmatchedPersonName = null;
      if (
        eachHourRow.hourRowDays &&
        eachHourRow.hourRowDays.length &&
        eachHourRow.hourRowDays[i] &&
        eachHourRow.hourRowDays[i]["bookedPeopleOnTime"] &&
        eachHourRow.hourRowDays[i]["bookedPeopleOnTime"].length
      ) {
        // perform all sorts of check later
        // right now just return the first one
        let bookedPeople = eachHourRow.hourRowDays[i]["bookedPeopleOnTime"];

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
    getPersonBookedHere(eachHourRow, i) {
      let unmatchedSession = null;
      let partnerUsername = null;

      unmatchedSession = eachHourRow.hourRowDays[i]["bookedPeopleOnTime"][0];

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
    // getPersonBookedHereString(eachHourRow, i) {
    //   unmatchedSession = eachHourRow.hourRowDays[i]["bookedSessionsOnTime"][0];
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
  outline: none;
  border: none;
}

.join-session:hover,
.selected-book:hover {
  background-color: #b4b8b9;
}

.cancel-container {
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  width: 100%;
}

.cancel-session {
  position: absolute;
  left: 10px;
  right: 10px;
  bottom: 5px;
  padding: 2px 12px;
  border-radius: 360px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  background-color: #bfc0d0;
  background-color: #fbeaee;
  color: #5600ff;
  font-size: 17px;
  outline: none;
  border: none;
}

.cancel-session {
  bottom: 6px;
  top: unset;
  background-color: #fbeaef;
  font-size: 16px;
  padding: 6px 12px;
  left: 7px;
  right: 7px;
}

.cancel-info {
  background-color: #fafafc;
  flex-direction: column;
  justify-content: space-around;
  height: 88%;
  border: 1px solid #d8d8d833;
  width: 95%;
  display: flex;
  align-items: center;
  border-radius: 4px;
  position: relative;
}

.cancel-time {
  color: #c0c0d0;
  /* background-color: #dcdfe0; */
  padding: 1px 6px;
  border-radius: 360px;
  font-size: 12px !important;
  font-weight: bold;
  color: #b7b7ca;
  margin-right: auto;
  left: 0;
  font-weight: 800;
  position: absolute;
  top: 11px;
  left: 6px;
  font-weight: 800;
  left: 8px;
}

.cancel-title {
  font-weight: 700;
  text-transform: capitalize;
  position: absolute;
  color: #5600ffe0;
  left: 0;
  right: 0;
  top: 29px;
  font-size: 18px;
}

.cancel-buttons {
  position: absolute;
  left: 10px;
  right: 10px;
  bottom: 5px;
  padding: 2px 12px;
  border-radius: 360px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  background-color: #bfc0d0;
  background-color: #fbeaee;
  color: #5600ff;
  font-size: 17px;
  outline: none;
  border: none;
  bottom: 9px;
  top: unset;
  background-color: #eaedfb;
  font-size: 16px;
  padding: 4px 12px;
  left: 7px;
  width: 46px;
}

.cancel-button {
  position: absolute;
  left: 10px;
  right: 10px;
  bottom: 5px;
  padding: 2px 12px;
  border-radius: 360px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  background-color: #bfc0d0;
  background-color: #fbeaee;
  color: #5600ff;
  font-size: 17px;
  outline: none;
  border: none;
  bottom: 9px;
  top: unset;
  background-color: #eaedfb;
  font-size: 16px;
  padding: 4px 12px;
  left: 7px;
  width: 46px;
  right: 7px;
  left: unset;
  background-color: #fbeaef;
  color: #5600ff;
}

.cancel-buttons:hover {
  background-color: #b4b8b9;
}

/* .cancel-title {
  color: #6c7592;
  color: #5c6992; 
  color: #53568a; 
  color: #4b4f8c; 
} */

/* #eaeaef */

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

.cancelSelectContainer {
  position: relative;
}
</style>
