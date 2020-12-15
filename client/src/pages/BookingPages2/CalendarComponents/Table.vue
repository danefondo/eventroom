<template>
  <table class="table">
    <thead>
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
    </thead>
    <tbody>
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
          <PastSession
            v-if="
              isPastHour(eachHourRow, i) &&
              !eachHourRow.hourRowDays[i].hasPastSession &&
              userHadMatchedSessionForSlot(eachHourRow, i)
            "
            :boxHeight="getBoxHeights"
            :slotDateTime="eachHourRow.hourRowDays[i].dateTime"
            :sessionTime="
              bookedSessionTime(eachHourRow, i, 'userSessionsForSlot')
            "
            :matchedPartnerName="matchedPartnerName(eachHourRow, i)"
            :user="user"
          />
          <PastSlot
            v-if="
              isPastHour(eachHourRow, i) &&
              !eachHourRow.hourRowDays[i].hasPastSession &&
              !userHadMatchedSessionForSlot(eachHourRow, i)
            "
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
              :slotDateTime="eachHourRow.hourRowDays[i].dateTime"
            />
            <UserSession
              v-if="
                userHasSessionForSlot(eachHourRow, i) &&
                !eachHourRow.hourRowDays[i].isCanceling
              "
              :nextSessionIsTenMinToStart="nextSessionIsTenMinToStart"
              :boxHeight="getBoxHeights"
              :slotDateTime="eachHourRow.hourRowDays[i].dateTime"
              :sessionTime="
                bookedSessionTime(eachHourRow, i, 'userSessionsForSlot')
              "
              :userIsMatchedForSlot="userIsMatchedForSlot(eachHourRow, i)"
              :sessionLink="joinSessionLink(eachHourRow, i)"
              :matchedPartnerName="matchedPartnerName(eachHourRow, i)"
              :user="user"
              @refreshNextOrCurrentSession="refreshNextOrCurrentSession"
            />
            <!-- Must only show if not selected -->
            <UnmatchedPerson
              v-else-if="
                matchablePeopleExist(eachHourRow, i) &&
                nearByIsNotSelected(eachHourRow, i) &&
                eachHourRow.hourRowDays[i].isAvailableForBooking
              "
              :slotDateTime="eachHourRow.hourRowDays[i].dateTime"
              :profileImage="
                returnUnmatchedBookedPeople(eachHourRow, i, 'image')
              "
              :profileName="returnUnmatchedBookedPeople(eachHourRow, i, 'name')"
            />
            <BookSession
              @refreshNextOrCurrentSession="refreshNextOrCurrentSession"
              v-if="eachHourRow.hourRowDays[i].isSelected"
              :user="user"
              :slotDateTime="eachHourRow.hourRowDays[i].dateTime"
              :boxHeight="getBoxHeights"
              :selectedToBook="selectedToBook"
              :currentlyBooking="currentlyBooking"
              :slotHasPerson="matchablePeopleExist(eachHourRow, i)"
              :slotPerson="returnUnmatchedBookedPeople(eachHourRow, i, 'name')"
            />
            <CancelSession
              @refreshNextOrCurrentSession="refreshNextOrCurrentSession"
              v-if="eachHourRow.hourRowDays[i].isCanceling"
              :user="user"
              :slotDateTime="eachHourRow.hourRowDays[i].dateTime"
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
      />
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
import PastSlot from "./PastSlot";
import PastSession from "./PastSession";
import LastHourRows from "./LastHourRows";

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
  },
  props: [
    "user",
    "selectedToBook",
    "currentlyBooking",
    "rowNumberForWeekOrDay",
    "weekDates",
    "calendarData",
    "nextSession",
    "currentSession",
    "nextSessionIsTenMinToStart",
    "currentWeekStart",
    "currentSelectedDay",
    "week",
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

    isFullHour(time) {
      let minutes = time.split(":")[1];
      // console.log("minutes", minutes);
      return minutes == "00"
    },

    nearByIsNotSelected(eachHourRow, i) {
      const FIFTEEN_MINUTES = 900000; // milliseconds
      let hourRowDay = eachHourRow.hourRowDays[i];
      if (hourRowDay) {
        const slotStartInMS = hourRowDay.dateTime.valueOf();
        /*
        this handles case for other people's booked sessions
        show when selection is itself, because then selection must be
        that very session
        show when it is one after it
        do not show if there is something 15, 30, 45 after (or it'd be overlapping)
        do not show if there is something 15, 30, 45 before
        show
        because this particular nearby checks it by sending itself, its own slot
        and this slot is one where there is supposedly a person
        then that is why you do not here count this slot time start itself
        */
        for (let i = 0; i < this.selectedToBook.length; i++) {
          let selectedStartTimeInMS = this.selectedToBook[i].dateTime.valueOf();
          if (
            selectedStartTimeInMS >= slotStartInMS - 3*FIFTEEN_MINUTES &&
            selectedStartTimeInMS < slotStartInMS
          ) {
            return false;
          }
        }
      }
      return true;
    },

    joinSessionLink(eachHourRow, i) {
      const dateTimeMS = eachHourRow.hourRowDays[i].dateTime.valueOf();
      const userValue = eachHourRow.hourRowDays[i][dateTimeMS];
      if (userValue) {
        return "/session/" + userValue.sessionID;
      } 
      return "/session/";
    },

    isPastHour(eachHourRow, i) {
      let slot = eachHourRow.hourRowDays[i];

      let now = new Date();
      let isPastHour = isBefore(slot.dateTime, now);

      // slot start is before this moment
      // need to check if session currently happening in slot / sessions nearby?
      // then show

      if (
        slot.hasCurrentOrNextSession ||
        slot.isSelected ||
        !slot.isAvailableForSelecting
      ) {
        isPastHour = false;
      }

      return isPastHour;
    },

    userHasSessionForSlot(eachHourRow, i) {
      return this.userIsMatchedForSlot(eachHourRow, i);
    },
    userHadMatchedSessionForSlot(eachHourRow, i) {
      return this.userIsMatchedForSlot(eachHourRow, i);
    },
    userIsMatchedForSlot(eachHourRow, i) {
      const dateTimeMS = eachHourRow.hourRowDays[i].dateTime.valueOf();
      const userValue = eachHourRow.hourRowDays[i][dateTimeMS];
      if (userValue) {
        return true;
      }
      return false;
    },

    matchedPartnerName(eachHourRow, i) {
      const dateTimeMS = eachHourRow.hourRowDays[i].dateTime.valueOf();
      const userValue = eachHourRow.hourRowDays[i][dateTimeMS];
      if (userValue) {
        return userValue.metadata.displayName;
      }
      return null;
    },
    bookedSessionTime(eachHourRow, i) {
      if (this.userIsMatchedForSlot(eachHourRow, i)) {
        const sessionTime = eachHourRow.hourRowDays[i].dateTime;
        const sessionEndTime = addMinutes(sessionTime, this.interval);
        return format(sessionTime, "HH:mm")+"-"+format(sessionEndTime, "HH:mm");
      }
      return null;
    },
    matchablePeopleExist(eachHourRow, i) {
      if (
        eachHourRow.hourRowDays[i].matchPoolUsersForSlot && 
        eachHourRow.hourRowDays[i].matchPoolUsersForSlot.length
      ) {
        return true;
      }
      return false;
    },
    returnUnmatchedBookedPeople(eachHourRow, i, isNameOrImage) {
      if (this.matchablePeopleExist(eachHourRow, i)) {
        if (isNameOrImage == "name") {
          return eachHourRow.hourRowDays[i].matchPoolUsersForSlot[0].metadata.displayName;
        } else if (isNameOrImage == "image") {
          return eachHourRow.hourRowDays[i].matchPoolUsersForSlot[0].metadata.profileImageUrl;
        } 
      }
      return null;
    },
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
