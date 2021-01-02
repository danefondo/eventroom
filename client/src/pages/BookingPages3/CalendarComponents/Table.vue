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
        v-for="(rowArray, rowIndex) in calendarDateTimes"
        :key="rowIndex"
        :data-rowhour="getRowStartTime(rowIndex)"
        :style="getSelectedHeights"
      >
        <td>
          <div v-if="isFullHour(rowIndex)" class="hour">
            {{ getRowStartTime(rowIndex) }}
          </div>
        </td>
        <td
          v-for="(dateTimeMS, columnIndex) in rowArray"
          :key="columnIndex"
          class="each-day"
          :class="isPastHour(dateTimeMS) ? 'past-day' : ''"
          :data-daynum="columnIndex"
        >
          <PastSession
            v-if="
              isPastHour(dateTimeMS) &&
              userHadMatchedSessionForSlot(dateTimeMS)
            "
            :boxHeight="getBoxHeights"
            :slotDateTime="dateTimeMS"
            :sessionTime="formatSessionTime(dateTimeMS)"
            :matchedPartnerName="matchedPartnerName(dateTimeMS)"
            :user="user"
          />
          <PastSlot
            v-if="
              isPastHour(dateTimeMS) &&
              !userHadMatchedSessionForSlot(dateTimeMS)
            "
          />
          <div
            class="general-container"
            v-else-if="!isPastHour(dateTimeMS)"
          >
            <SlotHoverEmpty
              v-if="
                !calendarData[dateTimeMS].isSelected &&
                calendarData[dateTimeMS].isAvailableForBooking &&
                calendarData[dateTimeMS].isAvailableForSelecting
              "
              :boxHeight="getBoxHeights"
              :slotDateTime="dateTimeMS"
              @unselectedSlotSelected="unselectedSlotSelected"
            />
            <UserSession
              v-if="
                userHasBookedSlot(dateTimeMS) &&
                !calendarData[dateTimeMS].isCanceling
              "
              :nextSessionIsTenMinToStart="nextSessionIsTenMinToStart"
              :boxHeight="getBoxHeights"
              :slotDateTime="dateTimeMS"
              :sessionTime="formatSessionTime(dateTimeMS)"
              :userIsMatchedForSlot="userIsMatchedForSlot(dateTimeMS)"
              :sessionLink="joinSessionLink(dateTimeMS)"
              :matchedPartnerName="matchedPartnerName(dateTimeMS)"
              :user="user"
              :currentUserData="currentUserData"
              @refreshNextOrCurrentSession="refreshNextOrCurrentSession"
              @setIsCanceling="setIsCanceling"
              @handleSuccessfulCancel="handleSuccessfulCancel"
            />
            <!-- Must only show if not selected -->
            <UnmatchedPerson
              v-else-if="
                matchablePeopleExist(dateTimeMS) &&
                !slotBeforeIsSelected(dateTimeMS) &&
                calendarData[dateTimeMS].isAvailableForBooking
              "
              :slotDateTime="dateTimeMS"
              :profileImage="returnBestMatchProfileImageUrl(dateTimeMS)"
              :profileName="returnBestMatchName(dateTimeMS)"
              @unselectedSlotSelected="unselectedSlotSelected"
            />
            <BookSession
              v-if="calendarData[dateTimeMS].isSelected"
              :user="user"
              :currentUserData="currentUserData"
              :slotDateTime="dateTimeMS"
              :boxHeight="getBoxHeights"
              :selectedToBook="selectedToBook"
              :currentlyBooking="currentlyBooking"
              :slotHasPerson="matchablePeopleExist(dateTimeMS)"
              :slotPerson="returnBestMatchName(dateTimeMS)"
              @handleSuccessfulBooking="handleSuccessfulBooking"
              @cancelSlot="cancelSlot"
              @refreshNextOrCurrentSession="refreshNextOrCurrentSession"
            />
            <CancelSession
              v-if="calendarData[dateTimeMS].isCanceling"
              :user="user"
              :currentUserData="currentUserData"
              :slotDateTime="dateTimeMS"
              :boxHeight="getBoxHeights"
              :quickCancel="false"
              :sessionTime="formatSessionTime(dateTimeMS)"
              @refreshNextOrCurrentSession="refreshNextOrCurrentSession"
              @handleSuccessfulCancel="handleSuccessfulCancel"
            />
          </div>
        </td>
      </tr>
      <LastHourRows
        :rowNumberForWeekOrDay="rowNumberForWeekOrDay"
        :boxHeight="getSelectedHeights"
        :currentWeekStartMS="currentWeekStartMS"
        :currentDayStartMS="currentDayStartMS"
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

import StoreMatchController from "../../../store/calendar/controllers/storeMatchController";
import StoreSelectionController from "../../../store/calendar/controllers/storeSelectionController";
import { SLOT_INTERVAL_MINUTES, SLOT_INTERVAL_MS, ONE_DAY_MS } from "../constants";


export default {
  name: "Table",
  data() {
    return {
      interval: 50,
      height: 105 / 4,
      selectedHeight: 105,
      boxHeight: 105,
      tableRowCount: 24*60/SLOT_INTERVAL_MINUTES,
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
    "currentUserData",
    "allUserMatches",
    "selectedToBook",
    "currentlyBooking",
    "rowNumberForWeekOrDay",
    "weekDates",
    "calendarData",
    "nextSession",
    "currentSession",
    "nextSessionIsTenMinToStart",
    "currentWeekStartMS",
    "currentDayStartMS",
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
    tableColumnCount() {
      return this.week ? 7 : 1;
    },
    calendarStartDateMS() {
      return this.week ? this.currentWeekStartMS : this.currentDayStartMS;
    },
    /* 
      this contains all the slot start times in ms as precalculated values,
      the calendar is rendered by iterating over this array
    */
    calendarDateTimes() {
      let calendarArray = []
      const nrColumns = this.week ? 7 : 1;
      const nrRows = 24*60/SLOT_INTERVAL_MS;
      const startDateMS = this.calendarStartDateMS;
      for (let i=0; i<nrRows; i++) {
        let tempArray = [];
        for (let j=0; j<nrColumns; j++) {
          tempArray.push(calendarStartDateMS + j*ONE_DAY_MS + i*SLOT_INTERVAL_MS);
        }
        calendarArray.push(tempArray);
      }
      return calendarArray;
    },
  },
  methods: {
    refreshNextOrCurrentSession() {
      this.$emit("refreshNextOrCurrentSession");
    },

    isFullHour(rowIndex) {
      return rowIndex % (60/SLOT_INTERVAL_MINUTES) === 0;
    },

    /** 
     * returns true, if a selected slot is less than 45 min before dateTimeMS provided in argument
     */
    slotBeforeIsSelected(dateTimeMS) {
      const FIFTEEN_MINUTES = 900000; // milliseconds
      for (let i=0; i<this.selectedToBook.length; i++) {
        if (this.selectedToBook[i] >= dateTimeMS) { // sorted!
          return false;
        }
        if (this.selectedToBook[i] >= dateTimeMS - 3*FIFTEEN_MINUTES) {
          return true
        }
      }
    },

    joinSessionLink(dateTimeMS) {
      const userValue = this.$store.getters["matches/getMatchedUserForDateTime"](dateTimeMS);
      if (userValue && userValue.sessionID) {
        return "/session/" + userValue.sessionID;
      } 
      return "/session/";
    },

    isPastHour(dateTimeMS) {
      if (
        dateTimeMS > Date.now() ||
        calendarData[dateTimeMS].hasCurrentOrNextSession ||
        calendarData[dateTimeMS].isSelected ||
        !calendarData[dateTimeMS].isAvailableForSelecting
      ) {
        return false;
      }
      return true;
    },

    userHasBookedSlot(dateTimeMS) {
      return this.$store.getters["matches/isBookedForDateTime"](dateTimeMS);
    },
    userHadMatchedSessionForSlot(dateTimeMS) { // eslint-disable-line no-unused-vars
      return false; // TODO
    },
    userIsMatchedForSlot(dateTimeMS) {
      return this.$store.getters["matches/isMatchedForDateTime"](dateTimeMS);
    },

    matchedPartnerName(dateTimeMS) {
      return this.$store.getters["matches/getMatchedUserName"](dateTimeMS);
    },
    formatSessionTime(dateTimeMS) {
      return format(dateTimeMS, "HH:mm")+"-"+format(dateTimeMS+SLOT_INTERVAL_MS, "HH:mm");
    },
    matchablePeopleExist(dateTimeMS) {
      return this.$store.getters["calendar/matchableUsersExist"](dateTimeMS);
    },
    returnBestMatchName(dateTimeMS) {
      return this.$store.getters["calendar/getBestMatchName"](dateTimeMS);
    },
    returnBestMatchProfileImageUrl(dateTimeMS) {  
      return this.$store.getters["calendar/getBestMatchProfileImageUrl"](dateTimeMS);
    },
    /* Returns HH:mm format for the row */
    getRowStartTime(rowIndex) {
      return format(this.currentWeekStart+rowIndex*SLOT_INTERVAL_MS, "HH:mm");
    },
    /* ======== vuex handlers ======== */
    unselectedSlotSelected(dateTimeMS) {
      StoreSelectionController.selectUnselectedSlot(dateTimeMS);
    },
    setIsCanceling(obj) {
      StoreSelectionController.setIsCanceling(obj.dateTimeMS, obj.value);
    },
    cancelSlot(dateTimeMS) {
      StoreSelectionController.cancelSelection(dateTimeMS);
    },
    handleSuccessfulBooking(data) {
      StoreMatchController.handleSuccessfulBooking(data);
    },
    handleSuccessfulCancel(data) {
      StoreMatchController.handleSuccessfulCancel(data);
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
