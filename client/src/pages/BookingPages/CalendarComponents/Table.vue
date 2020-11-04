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
      <!-- renderGrid
      
      somehow
      must add some sort of class
      or disable selecting
      if there is a session in 'interval' distance

      likewise in the backend
      there must be a check

      to prevent any overlapping sessions ever being booked

      must somehow calculate that no sessions before slot by interval
      and no sessions after slot by interval



      
       -->
      <tr
        v-for="(eachHourRow, rowIndex) in calendarData"
        :key="rowIndex"
        :data-rowhour="eachHourRow.slotStartTime"
        :style="getSelectedHeights"
      >
        <td>
          <div v-if="isFullHour(eachHourRow.slotStartTime)" class="hour">
            {{ eachHourRow.slotStartTime }}
          </div>
        </td>
        <td
          v-for="(index, i) in rowNumberForWeekOrDay"
          :key="index"
          class="each-day"
          :class="isPastHour(eachHourRow, i) ? 'past-day' : ''"
          :data-daynum="i"
        >
          <div
            :style="getSelectedHeights"
            class="past-container"
            v-if="isPastHour(eachHourRow, i)"
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
          <div class="general-container" v-else-if="!isPastHour(eachHourRow, i)">
            <div
              v-if="
                !eachHourRow.hourRowDays[i].isSelected &&
                eachHourRow.hourRowDays[i].isAvailableForBooking &&
                nearByIsNotSelected(eachHourRow, i)
              "
              @click="$emit('select-slot', eachHourRow.hourRowDays[i])"
              :style="getBoxHeights"
              class="highlight-container"
            >
              <div class="highlight-info">Select?</div>
            </div>
            <!--     
              1. If not past day
              2. If user has booked session at time, show that and nothing else
              3. If user has no booked session at time && others that are UNMATCHED are booked for the time, show first in list or best preferences (if many, show faces icons in row)
            -->
            <div
              v-if="
                userHasSessionForSlot(eachHourRow, i) &&
                !eachHourRow.hourRowDays[i].isCanceling
              "
              :style="getBoxHeights"
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
              v-else-if="
                unmatchedBookedPeopleExist(eachHourRow, i) &&
                nearByIsNotSelected(eachHourRow, i, true) &&
                eachHourRow.hourRowDays[i].isAvailableForBooking
              "
              @click="$emit('select-slot', eachHourRow.hourRowDays[i])"
            >
              <div class="booked-unmatched-container">
                <div class="booked-unmatched-info">
                  <img
                    loading="lazy"
                    v-if="returnUnmatchedBookedPeople(eachHourRow, i, 'image')"
                    :src="returnUnmatchedBookedPeople(eachHourRow, i, 'image')"
                    class="calendar-profile-icon"
                  />
                  <div v-else class="calendar-profile-icon borderless">
                    <IconBase
                      icon-name="profile"
                      iconColor="#aeaeae"
                      viewBox="0 0 311.541 311.541"
                      width="27"
                      height="27"
                      ><IconProfile
                    /></IconBase>
                  </div>
                  <span class="unmatched-title">{{
                    returnUnmatchedBookedPeople(eachHourRow, i, "name")
                  }}</span>
                </div>
              </div>
            </div>
            <!-- all YOUR booked sessions, either matched or unmatched-->

            <!-- <div
              v-if="!eachHourRow.hourRowDays[i].isSelected"
              @click="$emit('select-slot', eachHourRow.hourRowDays[i])"
              :style="getBoxHeights"
              class="highlight-container"
            >
              <div class="highlight-info">Select?</div>
            </div> -->
            <div
              v-if="
                eachHourRow.hourRowDays[i].isSelected &&
                !unmatchedBookedPeopleExist(eachHourRow, i)
              "
              :style="getBoxHeights"
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
              v-else-if="
                eachHourRow.hourRowDays[i].isSelected &&
                unmatchedBookedPeopleExist(eachHourRow, i)
              "
              :style="getBoxHeights"
              class="selected-container"
            >
              <div class="selected-info">
                Selected
                <span class="unmatched-title book-person">{{
                  returnUnmatchedBookedPeople(eachHourRow, i, "name")
                }}</span>
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
              :style="getBoxHeights"
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

import IconBase from "../../../components/IconBase";
import IconProfile from "../../../components/SVG/IconProfile";

export default {
  name: "Table",
  props: ["weekDates", "calendarData", "rowNumberForWeekOrDay", "allSessions"],
  data() {
    return {
      interval: 60,
      minimumTime: "00:00",
      maximumTime: "23:00",
      height: 105 / 4,
      selectedHeight: 105,
      boxHeight: 105,
    };
  },
  computed: {
    ...mapState({
      user: (state) => state.auth.user,
      selectedToBook: (state) => state.booking.selectedToBook,
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
    getBoxHeights() {
      let height = this.boxHeight;
      height = `height:${height}px;`;
      return height;
    },
  },
  components: {
    IconBase,
    IconProfile,
  },
  methods: {
    isFullHour(time) {
      let minutes = time.split(":")[1];
      // console.log("minutes", minutes);
      if (minutes == "00") {
        return true;
      } else {
        return false;
      }
    },
    nearByIsNotSelected(eachHourRow, i, exceptSelf = false) {
      let FIFTEEN_MINUTES = 900000; // milliseconds
      let hourRowDay = eachHourRow.hourRowDays[i];
      if (hourRowDay) {
        const slotStartTime = hourRowDay.dateTime;
        const slotStartInMS = slotStartTime.valueOf();

        let fifteenBefore = slotStartInMS - FIFTEEN_MINUTES;
        let thirtyBefore = slotStartInMS - FIFTEEN_MINUTES * 2;
        let fortyFiveBefore = slotStartInMS - FIFTEEN_MINUTES * 3;

        let fifteenAfter = slotStartInMS + FIFTEEN_MINUTES;
        let thirtyAfter = slotStartInMS + FIFTEEN_MINUTES * 2;
        let fortyFiveAfter = slotStartInMS + FIFTEEN_MINUTES * 3;

        for (let i = 0; i < this.selectedToBook.length; i++) {
          let selectedStartTime = new Date(this.selectedToBook[i].dateTime);
          let selectedStartTimeInMS = selectedStartTime.valueOf();

          if (exceptSelf) {
            if (
              selectedStartTimeInMS == fifteenBefore ||
              selectedStartTimeInMS == thirtyBefore ||
              selectedStartTimeInMS == fortyFiveBefore
            ) {
              return false;
            }
          } else {
            if (
              selectedStartTimeInMS == fifteenBefore ||
              selectedStartTimeInMS == thirtyBefore ||
              selectedStartTimeInMS == fortyFiveBefore ||
              selectedStartTimeInMS == fifteenAfter ||
              selectedStartTimeInMS == thirtyAfter ||
              selectedStartTimeInMS == fortyFiveAfter ||
              selectedStartTimeInMS == slotStartInMS
            ) {
              return false;
            }
          }
        }
      }
      return true;
    },

    // if (
    //   (isBefore(slotStartTime, sessionStartTime) &&
    //     isBefore(sessionStartTime, slotEndTime)) ||
    //   isEqual(slotStartTime, sessionStartTime) ||
    //   isEqual(slotEndTime, sessionEndTime) ||
    //   isBefore(slotStartTime, sessionEndTime)
    // ) {
    //   return false;
    // }

    // const slotEndTime = addMinutes(slotStartTime, this.interval);

    // let sessionInterval = this.allSessions[i].sessionInterval;
    // let sessionEndTime = addMinutes(sessionStartTime, sessionInterval);

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
    isPastHour(eachHourRow, i) {
      let slot = eachHourRow.hourRowDays[i];

      let now = new Date();
      let isPastHour = isBefore(slot.dateTime, now);

      // slot start is before this moment
      // need to check if session currently happening in slot / sessions nearby?
      // then show

      return isPastHour;
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
      // console.log("@isMatched, session: ", matchedSession);

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
      // console.log("partnerUsername", partnerUsername);
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
    returnUnmatchedBookedPeople(eachHourRow, i, isNameOrImage) {
      let unmatchedPerson = null;
      let unmatchedPersonName = null;
      let unmatchedPersonImageUrl = null;
      let unmatchedPersonObject = null;
      let unmatchedPersonData = null;
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
        unmatchedPersonImageUrl =
          unmatchedPerson.firstPartnerProfileImageUrl ||
          unmatchedPerson.secondPartnerProfileImageUrl;

        unmatchedPersonObject = {
          name: unmatchedPersonName,
          image: unmatchedPersonImageUrl,
        };
      }
      if (isNameOrImage == "name") {
        unmatchedPersonData = unmatchedPersonObject.name;
      } else if (isNameOrImage == "image") {
        unmatchedPersonData = unmatchedPersonObject.image;
      }

      return unmatchedPersonData;
    },
    getPersonBookedHere(eachHourRow, i) {
      let unmatchedSession = null;
      let partnerUsername = null;

      unmatchedSession = eachHourRow.hourRowDays[i]["bookedPeopleOnTime"][0];

      if (!unmatchedSession) return;
      // console.log("@getPersonBookedHere, session: ", unmatchedSession);

      if (unmatchedSession.firstPartnerId || unmatchedSession.secondPartnerId) {
        partnerUsername =
          unmatchedSession.firstPartnerUsername ||
          unmatchedSession.secondPartnerUsername;
      }
      // console.log("partnerUsername", partnerUsername);
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
  /* z-index: 999; */
}

.each-day {
  background-color: transparent;
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

  z-index: 999;
}

.booked-unmatched-container {
  height: calc(105px / 4);
  margin-top: 5px;

  z-index: unset;
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
  /* width: 25px !important;
  height: 25px !important; */
  width: 27px !important;
  height: 27px !important;
  border-radius: 360px;
  position: absolute;
  left: 7px;
  border: 1px solid #a1a4ae;

  z-index: 999;
}

.booked-info {
  flex-direction: column;
  justify-content: space-around;
  height: 88%;
  /* background-color: #f7f7fb; */
  background-color: #f7f7fbad;
  background-color: #fafafc;
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

/* .general-container {
  pointer-events: auto;
} */

.highlight-container {
  display: none;
  align-items: center;
  justify-content: center;
  position: absolute;
  width: 100%;
  cursor: default;
  pointer-events: none;

  /* z-index: 999; */
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
  pointer-events: auto;
}

.unmatched-title {
  position: absolute;
  /* left: 40px; */
  left: 45px;
  font-size: 18px;
  color: #343556;

  z-index: 999;
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
  z-index: 999;
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
  width: 27.5%;
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

.book-person {
  top: 30px;
  left: 12px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  box-sizing: border-box;
  width: 100px;
  text-align: left;
}

/* Per 4, the 1st */
table tr:nth-child(4n+1) td {
  /* background-color: blue; */
  /* border-bottom-color: #f7f7f7; */
  /* border-bottom-style: dashed; */
}

/* Per 4, the 2nd */
table tr:nth-child(4n+2) td {
  /* background-color: red; */
  /* border-bottom-color: #f7f7f7; */
  border-top-color: #f7f7f7;
  /* border-bottom-style: dashed; */
}

/* Per 4, the 3rd */
table tr:nth-child(4n+3) td {
  /* background-color: yellow; */
  /* border-bottom-color: #f7f7f7; */
  border-top-color: #f7f7f7;
  /* border-bottom-style: dashed; */
}

/* Per 4, the 4th */
table tr:nth-child(4n+4) td {
  /* background-color: yellow; */
  /* border-bottom-color: #f7f7f7; */
  border-top-color: #f7f7f7;
  /* border-bottom-style: dashed; */
}

</style>
