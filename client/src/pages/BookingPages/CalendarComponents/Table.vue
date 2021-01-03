<template>
  <table class="table">
    <div class="thead">
      <div class="tr">
        <div class="th empty"></div>
        <div
          class="th"
          v-for="(eachDate, index) in weekDates"
          :class="isItToday(eachDate.date)"
          :key="index"
          :data-index="index + 1"
          :data-date="eachDate.dateNum"
          :data-year="eachDate.yearNum"
          :data-month="eachDate.monthNum"
        >
          <span class="day"> {{ eachDate.dayNameShort }}</span>
          <span class="date">{{ eachDate.dateNum }}</span>
        </div>
      </div>
    </div>
    <!-- <thead>
      <tr>
        <th class="empty"></th>
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
    </thead> -->
    <tbody class="table-rows">
      <tr
        v-for="(eachHourRow, rowIndex) in calendarData"
        :key="rowIndex"
        :data-rowhour="eachHourRow.slotStartTime"
        :style="getSelectedHeights"
      >
        <td>
          <div v-if="isFullHour(eachHourRow.slotStartTime)" class="hour">
            {{ getRowHour(eachHourRow) }}
          </div>
        </td>
        <td
          v-for="(index, i) in rowNumberForWeekOrDay"
          :key="index"
          class="each-day"
          :class="isPastHour(eachHourRow, i) ? 'past-day' : ''"
          :data-daynum="i"
        >
          <CurrentHourLine
            v-if="
              isCurrentHourSlot(eachHourRow, i) ||
              isCurrentHourSlot(eachHourRow, i) === 0
            "
            :slotLinePercentage="isCurrentHourSlot(eachHourRow, i)"
          />
          <!-- TODO: Set 'attendedSuccessful/not in here too, to display 'MISSED' if necessary -->
          <PastSession
            v-if="
              isPastHour(eachHourRow, i) &&
              userHadMatchedSessionForSlot(eachHourRow, i)
            "
            :boxHeight="getBoxHeights"
            :slotData="eachHourRow.hourRowDays[i]"
            :sessionTime="
              bookedSessionTime(eachHourRow, i, 'userSessionsForSlot')
            "
            :matchedPartnerName="matchedPartnerName(eachHourRow, i)"
            :user="user"
          />
          <PastSlot
            v-if="isPastHour(eachHourRow, i)"
            :slotLinePercentage="isCurrentHourSlot(eachHourRow, i)"
          />
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
              :nextSession="nextSession"
              @refreshNextOrCurrentSession="refreshNextOrCurrentSession"
              @hardRefreshTimerAndNextSession="hardRefreshTimerAndNextSession"
            />
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
            <BookSession
              @refreshNextOrCurrentSession="refreshNextOrCurrentSession"
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
              @refreshNextOrCurrentSession="refreshNextOrCurrentSession"
              @hardRefreshTimerAndNextSession="hardRefreshTimerAndNextSession"
              v-if="eachHourRow.hourRowDays[i].isCanceling"
              :user="user"
              :nextSession="nextSession"
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
      <LastHourRows
        :rowNumberForWeekOrDay="rowNumberForWeekOrDay"
        :boxHeight="getSelectedHeights"
        :currentWeekStart="currentWeekStart"
        :currentSelectedDay="currentSelectedDay"
        :week="week"
        :lastMinInMS="lastMinInMS"
      />
    </tbody>
    <div class="last-line"></div>
    <div class="table-bottom"></div>
  </table>
</template>

<script>
import { format, addMinutes, getMinutes, isToday } from "date-fns";

import BookSession from "./BookSession";
import CancelSession from "./CancelSession";
import UnmatchedPerson from "./UnmatchedPerson";
import SlotHoverEmpty from "./SlotHoverEmpty";
import UserSession from "./UserSession";
import PastSlot from "./PastSlot";
import PastSession from "./PastSession";
import LastHourRows from "./LastHourRows";
import CurrentHourLine from "./CurrentHourLine";

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
    PastSlot,
    PastSession,
    LastHourRows,
    CurrentHourLine,
  },
  props: [
    "user",
    "selectedToBook",
    "currentlyBooking",
    "selectedInterval",
    "bookingInterval",
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
    "currentWeekStart",
    "currentSelectedDay",
    "week",
    "lastMinInMS",
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
    refreshNextOrCurrentSession() {
      this.$emit("refreshNextOrCurrentSession");
    },

    hardRefreshTimerAndNextSession() {
      this.$emit("hardRefreshTimerAndNextSession");
    },

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

    joinSessionLink(eachHourRow, i) {
      let sessionId =
        eachHourRow.hourRowDays[i]["userSessionsForSlot"][0]["_id"];
      let sessionLink = "/session/" + sessionId;
      return sessionLink;
    },

    isPastHour(eachHourRow, i) {
      let slot = eachHourRow.hourRowDays[i];

      // lastMinInMS is a variable so that the timer could keep past slots
      // up to date by updating it regularly
      let now = this.lastMinInMS ? this.lastMinInMS : Date.now();
      let isPastHour = now > new Date(slot.dateTime).valueOf();

      // In the following cases, make exception to show a
      // session with past start time as a present session
      if (slot.hasCurrentOrNextSession || slot.isSelected) {
        isPastHour = false;
      }

      return isPastHour;
    },

    isItToday(date) {
      console.log(date);
      let today = isToday(date);
      return today ? "todayHead" : "";
    },

    isCurrentHourSlot(eachHourRow, i) {
      let currentPercentage = false;
      if (
        eachHourRow &&
        eachHourRow.hourRowDays &&
        eachHourRow.hourRowDays.length &&
        eachHourRow.hourRowDays[i]
      ) {
        let slot = eachHourRow.hourRowDays[i];
        let time = new Date(slot.dateTime);
        let slotStartInMS = time.valueOf();
        let fifteenMinInMS = this.bookingInterval * 60 * 1000;
        let slotEndInMS = slotStartInMS + fifteenMinInMS;
        let nowInMS = this.lastMinInMS ? this.lastMinInMS : Date.now();

        if (nowInMS >= slotStartInMS && nowInMS < slotEndInMS) {
          let currentTime = new Date(nowInMS);
          let minutes = getMinutes(currentTime);
          let slotStartMinutes = getMinutes(time);
          currentPercentage =
            ((minutes - slotStartMinutes) / this.bookingInterval) * 100;
        }
      }

      return currentPercentage;
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
        let slot = eachHourRow.hourRowDays[i];

        let session = slot["userSessionsForSlot"][0];

        if (session) {
          userHasSessionForSlot = true;
        }
      }

      return userHasSessionForSlot;
    },
    userHadMatchedSessionForSlot(eachHourRow, i) {
      let userHadMatchedSessionForSlot = false;
      if (
        eachHourRow.hourRowDays &&
        eachHourRow.hourRowDays.length &&
        eachHourRow.hourRowDays[i] &&
        eachHourRow.hourRowDays[i]["userSessionsForSlot"] &&
        eachHourRow.hourRowDays[i]["userSessionsForSlot"].length
      ) {
        let slot = eachHourRow.hourRowDays[i]["userSessionsForSlot"];
        let session = slot[0];

        if (session && session.firstPartnerId && session.secondPartnerId) {
          userHadMatchedSessionForSlot = true;
        }
      }

      return userHadMatchedSessionForSlot;
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

    getRowHour(row) {
      let userPrefers24HourFormat = this.user.preferences.calendarPreferences.prefer24HourFormat;
      let time = row.slotStartAmPm;

      if (userPrefers24HourFormat) {
        time = row.slotStartTime;
      }

      return time;
    },
    // getPersonBookedHereString(eachHourRow, i) {
    //   unmatchedSession = eachHourRow.hourRowDays[i]["userSessionsForSlot"][0];
    // },
  },
};
</script>
<style scoped>
.last-line {
  background-color: #f6f6f7;
  height: 1px;
  width: calc(100% - 105px);
  margin-top: 0px;
  margin-left: 81px;
  margin-right: 22px;
  z-index: 20019;
  position: absolute;
}

.table-bottom {
  box-sizing: border-box;
  background-color: #f6f5f7;
  height: 15px;
  width: 100%;
  margin-top: 0px;
  /* margin-left: 80px; */
  margin-right: 22px;
  background-color: white;
  z-index: 20000;
  border: 1px solid #f5f6f7;
  border-top: 0px;
  border-bottom-left-radius: 6px;
  border-bottom-right-radius: 6px;
}

.each-day:hover .highlight-container {
  display: flex;
  /* z-index: 999; */
}

.each-day {
  background-color: transparent;
  position: relative;
}

.past-day {
  /* background-color: #f9f9f9; */
  /* background-color: #f9fafa; */
  background-color: #fff;
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

.todayHead {
  background-color: #ffffff;
  border: 1px solid #f7f7f78c !important;
  border-bottom: 1px solid #e3e7ea !important;
  box-shadow: 0px -4px 5px 0px #f7f7f7;
  border-top: 0px;
  border-top-left-radius: 3px;
  border-top-right-radius: 3px;
}

.selected-close {
  position: absolute;
  right: 5px;
  top: 5px;
  width: 16px;
  height: 16px;
  line-height: 17px;
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

.hour {
  display: flex;
  align-items: baseline;
  justify-content: center;
  position: absolute;
  width: 100%;
  word-spacing: -1px;
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

table tr:first-child td:nth-child(2) {
  border-collapse: separate;
  border-top-left-radius: 10px;
}
</style>
