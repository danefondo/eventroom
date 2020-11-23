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
                returnBestBookedToMatch(eachHourRow, i, 'userSessionsForSlot')
              "
              class="booked-session"
            >
              <span v-if="isMatched(eachHourRow, i)">{{
                `Matched with ${isMatched(eachHourRow, i)}`
              }}</span>
              <span v-else>Not yet matched...</span>
              <span>{{
                returnBestBookedToMatch(eachHourRow, i, "userSessionsForSlot")
              }}</span>
            </div>
          </div>
          <div
            class="general-container"
            v-else-if="!isPastHour(eachHourRow, i)"
          >
            <SlotHoverEmpty
              v-if="
                !eachHourRow.hourRowDays[i].isSelected &&
                eachHourRow.hourRowDays[i].isAvailableForBooking &&
                eachHourRow.hourRowDays[i].isAvailableForSelecting
              "
              :boxHeight="getBoxHeights"
              :slotData="eachHourRow.hourRowDays[i]"
            />
            <!--     
              1. If not past day
              2. If user has booked session at time, show that and nothing else
              3. If user has no booked session at time && others that are UNMATCHED are booked for the time, show first in list or best preferences (if many, show faces icons in row)
            -->
            <UserSession
              v-if="
                userHasSessionForSlot(eachHourRow, i) &&
                !eachHourRow.hourRowDays[i].isCanceling
              "
              :nextSessionIsTenMinToStart="nextSessionIsTenMinToStart"
              :boxHeight="getBoxHeights"
              :slotData="eachHourRow.hourRowDays[i]"
              :sessionTime="
                bookedSessionTime(eachHourRow, i, 'userSessionsForSlot')
              "
              :userIsMatchedForSlot="userIsMatchedForSlot(eachHourRow, i)"
              :sessionLink="joinSessionLink(eachHourRow, i)"
              :matchedPartnerName="matchedPartnerName(eachHourRow, i)"
              :user="user"
            />
            <!-- Must only show if not selected -->
            <UnmatchedPerson
              v-else-if="
                unmatchedBookedPeopleExist(eachHourRow, i) &&
                nearByIsNotSelected(eachHourRow, i, true) &&
                eachHourRow.hourRowDays[i].isAvailableForBooking
              "
              :slotData="eachHourRow.hourRowDays[i]"
              :profileImage="
                returnUnmatchedBookedPeople(eachHourRow, i, 'image')
              "
              :profileName="returnUnmatchedBookedPeople(eachHourRow, i, 'name')"
            />
            <!-- all YOUR booked sessions, either matched or unmatched-->

            <!-- <div
              v-if="!eachHourRow.hourRowDays[i].isSelected"
              @click="$emit('select-slot', eachHourRow.hourRowDays[i])"
              :style="getBoxHeights"
              class="highlight-container"
            >
              <div class="highlight-info">Select?</div>
            </div> -->
            <BookSession
              v-if="eachHourRow.hourRowDays[i].isSelected"
              :user="user"
              :slotData="eachHourRow.hourRowDays[i]"
              :boxHeight="getBoxHeights"
              :selectedToBook="selectedToBook"
              :currentlyBooking="currentlyBooking"
              :selectedInterval="selectedInterval"
              :selectedSlotDateTime="selectedSlotDateTime"
              :selectedSlotStartTime="selectedSlotStartTime"
              :selectedSlotDateString="selectedSlotDateString"
              :allUserSessions="allUserSessions"
              :calendarData="calendarData"
              :slotHasPerson="unmatchedBookedPeopleExist(eachHourRow, i)"
              :slotPerson="returnUnmatchedBookedPeople(eachHourRow, i, 'name')"
            />
            <CancelSession
              v-if="eachHourRow.hourRowDays[i].isCanceling"
              :user="user"
              :slotData="eachHourRow.hourRowDays[i]"
              :boxHeight="getBoxHeights"
              :quickCancel="false"
              :sessionTime="
                bookedSessionTime(eachHourRow, i, 'userSessionsForSlot')
              "
            />
          </div>
        </td>
      </tr>
    </tbody>
  </table>
</template>

<script>
import { isBefore, format, addMinutes } from "date-fns";

import BookSession from "./BookSession";
import CancelSession from "./CancelSession";
import UnmatchedPerson from "./UnmatchedPerson";
import SlotHoverEmpty from "./SlotHoverEmpty";
import UserSession from "./UserSession";

export default {
  name: "Table",
  data() {
    return {
      interval: 50,
      height: 105 / 4,
      selectedHeight: 105,
      boxHeight: 105,
    };
  },
  components: {
    BookSession,
    CancelSession,
    UnmatchedPerson,
    SlotHoverEmpty,
    UserSession,
  },
  props: [
    "user",
    "selectedToBook",
    "currentlyBooking",
    "selectedInterval",
    "selectedSlotDateTime",
    "selectedSlotStartTime",
    "selectedSlotDateString",
    "rowNumberForWeekOrDay",
    "weekDates",
    "minimumTime",
    "maximumTime",
    "calendarData",
    "allUserSessions",
    "nextSession",
    "currentSession",
    "nextSessionIsTenMinToStart",
  ],
  computed: {
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
            // this handles case for other people's booked sessions
            // show when selection is itself, because then selection must be
            // that very session
            // show when it is one after it
            // do not show if there is something 15, 30, 45 after (or it'd be overlapping)
            // do not show if there is something 15, 30, 45 before
            // show
            // because this particular nearby checks it by sending itself, its own slot
            // and this slot is one where there is supposedly a person
            // then that is why you do not here count this slot time start itself
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

    // let sessionEndTime = addMinutes(sessionStartTime, sessionInterval);

    joinSessionLink(eachHourRow, i) {
      let sessionId =
        eachHourRow.hourRowDays[i]["userSessionsForSlot"][0]["_id"];
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

      if (slot.hasCurrentOrNextSession) {
        isPastHour = false;
      }

      return isPastHour;
    },

    userHasSessionForSlot(eachHourRow, i) {
      let userHasSessionForSlot = false;
      if (
        eachHourRow.hourRowDays &&
        eachHourRow.hourRowDays.length &&
        eachHourRow.hourRowDays[i] &&
        eachHourRow.hourRowDays[i]["userSessionsForSlot"] &&
        eachHourRow.hourRowDays[i]["userSessionsForSlot"].length
      ) {
        let slot = eachHourRow.hourRowDays[i]["userSessionsForSlot"];
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

      session = eachHourRow.hourRowDays[i]["userSessionsForSlot"][0];

      if (!session) return null;

      if (session.firstPartnerId && session.secondPartnerId) {
        matched = true;
      }
      return matched;
    },
    matchedPartnerName(eachHourRow, i) {
      let session = null;
      let partnerUsername = null;

      session = eachHourRow.hourRowDays[i]["userSessionsForSlot"][0];

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
      let session = eachHourRow.hourRowDays[i]["userSessionsForSlot"][0];
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
      let session = eachHourRow.hourRowDays[i]["peopleSessionsForSlot"][0];
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

      matchedSession = eachHourRow.hourRowDays[i]["userSessionsForSlot"][0];

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
        eachHourRow.hourRowDays[i]["peopleSessionsForSlot"] &&
        eachHourRow.hourRowDays[i]["peopleSessionsForSlot"].length
      ) {
        let peopleSessionsForSlot =
          eachHourRow.hourRowDays[i]["peopleSessionsForSlot"];

        // Check that unmatched; if even one is found, good enough
        peopleSessionsForSlot.forEach((person) => {
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
        eachHourRow.hourRowDays[i]["peopleSessionsForSlot"] &&
        eachHourRow.hourRowDays[i]["peopleSessionsForSlot"].length
      ) {
        // perform all sorts of check later
        // right now just return the first one
        let peopleSessionsForSlot =
          eachHourRow.hourRowDays[i]["peopleSessionsForSlot"];

        peopleSessionsForSlot.forEach((person) => {
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

        if (isNameOrImage == "name") {
          unmatchedPersonData = unmatchedPersonObject.name;
        } else if (isNameOrImage == "image") {
          unmatchedPersonData = unmatchedPersonObject.image;
        }
      }

      return unmatchedPersonData;
    },
    getPersonBookedHere(eachHourRow, i) {
      let unmatchedSession = null;
      let partnerUsername = null;

      unmatchedSession = eachHourRow.hourRowDays[i]["peopleSessionsForSlot"][0];

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
    //   unmatchedSession = eachHourRow.hourRowDays[i]["userSessionsForSlot"][0];
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

/* .general-container {
  pointer-events: auto;
} */

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

/* Per 4, the 1st */
table tr:nth-child(4n + 1) td {
  /* background-color: blue; */
  /* border-bottom-color: #f7f7f7; */
  /* border-bottom-style: dashed; */
}

/* Per 4, the 2nd */
table tr:nth-child(4n + 2) td {
  /* background-color: red; */
  /* border-bottom-color: #f7f7f7; */
  border-top-color: #f7f7f7;
  /* border-top-color: transparent; */
  /* border-bottom-style: dashed; */
}

/* Per 4, the 3rd */
table tr:nth-child(4n + 3) td {
  /* background-color: yellow; */
  /* border-bottom-color: #f7f7f7; */
  border-top-color: #f7f7f7;
  /* border-top-color: transparent; */
  /* border-bottom-style: dashed; */
}

/* Per 4, the 4th */
table tr:nth-child(4n + 4) td {
  /* background-color: yellow; */
  /* border-bottom-color: #f7f7f7; */
  border-top-color: #f7f7f7;
  /* border-top-color: transparent; */
  /* border-bottom-style: dashed; */
}
</style>
