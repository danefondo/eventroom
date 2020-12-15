<template>
  <div class="modal">
    <div class="modal-body">
      <div class="selectedToBook">
        <div
          class="sessionToBook"
          v-for="(slotDateTime, index) in selectedToBook"
          :key="index"
        >
          <div class="session-header">
            <!-- TODO -->
            {{ `${getSlotDayNameShort(slotDateTime)}` }} 
          </div>
          <div class="session-header">
            <!-- TODO -->
            {{ `${getSlotTime(slotDateTime)}` }}
          </div>
        </div>
      </div>
      <!-- <form>
        <input
          class="booking-input"
          autocomplete="off"
          name="title"
          type="text"
          v-model="slotName"
          placeholder="Event title"
        /><br />
        <input
          class="booking-input"
          name="date"
          type="date"
          v-model="slotDateString"
          placeholder="Date"
        /><br />
        <input
          class="booking-input"
          name="start-time"
          type="time"
          v-model="slotStartTime"
          placeholder="Start time"
        /><br />
        <div class="all-users"></div>
      </form> -->
      <button
        class="bookSession"
        :class="currentlyBooking ? 'not-allowed' : ''"
        :disabled="currentlyBooking == true"
        @click="bookManySessions"
      >
        {{ returnBookButtonText }}
      </button>
      <div class="cancelBooking" @click="cancelBooking">Cancel</div>
    </div>
  </div>
</template>

<script>
import { format } from "date-fns";

import { bookManySlots } from "../CalendarUtilities/calendarSocketHandlers";
// import { convertBooker } from "../CalendarUtilities/dataconverter";

export default {
  name: "Booker",
  props: [
    "selectedToBook",
    "currentlyBooking",
    "user",
    "boxHeight",
    "sessionTime",
    "selectedSlotName",
  ],
  computed: {
    // slotName: {
    //   get() {
    //     return this.selectedSlotName;
    //   },
    //   set(value) {
    //     this.$store.dispatch("booking/setSelectedSlotName", value);
    //   },
    // },

    returnBookButtonText() {
      let bookText = "";
      if (this.currentlyBooking) {
        bookText = "Booking...";
      } else if (!this.currentlyBooking && this.selectedToBook.length > 1) {
        bookText = "Book sessions";
      } else if (!this.currentlyBooking && this.selectedToBook.length < 2) {
        bookText = "Book session";
      }
      return bookText;
    },
  },
  methods: {
    async bookManySessions() { // eslint-disable-line no-unused-vars
      let errors = {};
      if (this.currentlyBooking) return;
      if (this.selectedToBook.length < 1) return;
      try {
        this.$store.dispatch("booking/setCurrentlyBooking", true);
        
        let dateTimes = []
        // Prepare selected to book data
        for (let i=0; i<this.selectedToBook.length; i++) {
          dateTimes.push((new Date(this.selectedToBook[i].dateTime).valueOf()));
        }
        const sendData = {
          ID: this.user._id,
          dateTimes,
          preferences: null,
          preferenceData: null,
          metaData: {
            profileImageUrl: this.user.profileImageUrl,
            username: this.user.username,
            displayName: this.user.displayName,
          }
        }
        
        const sessions = await bookManySlots(sendData);

        if (!sessions) {
          errors.FailedToBookSession = true;
          throw { errors: errors };
        } else {
          // const pushSessions = convertBooker(sessions, this.user);
          // const pushData = {
          //   sessions: pushSessions,
          //   userId: this.user._id,
          // };
          // // console.log("@PUSHDATA FROM RESPONSE", pushData);
          // /* ====== ADD TO CALENDAR AFTER BOOKING ====== */
          // this.$store.dispatch("calendar/pushManyCalendarSessions", pushData);

          this.$emit("refreshNextOrCurrentSession");

          this.$store.dispatch("booking/setCurrentlyBooking", false);

          this.$nextTick(function () {
            this.$store.dispatch("calendar/updateCalendarSlotAvailability", 0);
            this.cancelBooking();
          });
        }
      } catch (error) {
        console.log("errorBooking", error);
        this.$store.dispatch("booking/setCurrentlyBooking", false);
      }
    },



    /* Clear all current selections */
    cancelBooking() {
      const updateData = {
        slotDateTimeArray: this.selectedToBook,
        newSlotState: false,
        field: "isSelected",
      }
      this.$store.dispatch("calendar/updateManySlotsByDateTime", updateData);

      this.$store.dispatch("booking/clearAllSelections");

      this.$nextTick(function () {
        this.$store.dispatch("calendar/updateCalendarSlotAvailability", 1);
      });
    },
    getSlotDayNameShort(slotDateTime) {
      return format(slotDateTime, "eee");
    },
    getSlotTime(slotDateTime) {
      return format(slotDateTime, "HH-mm");
    }
  },
};
</script>
<style scoped>
.modal {
  /* position: fixed; */
  /* width: 22%; */
  height: 100vh;
  /* top: 0;
  right: -22%;
  right: 17%; */
  z-index: 3;
  /* background: #fff; */
  align-items: center;
  justify-content: center;
  display: flex;
}

/** BOOKING MODAL */
.bookSession,
.cancelBooking {
  font-size: 20px;
  margin-top: 15px;
  margin-left: 5px;
  margin-right: 5px;
  letter-spacing: 0.5px;
  background-color: #f7f7fb;
  padding: 6px 14px;
  font-weight: 700;
  border-radius: 360px;
  cursor: pointer;
  transition: 0.1s ease;
  text-align: center;
  outline: none;
  border-color: unset;
  border: none;
  box-sizing: border-box;
  width: 250px;
}

.bookSession {
  color: #5600ff;
}

.not-allowed {
  cursor: not-allowed !important;
}

.cancelBooking {
  margin-top: 7px;
  padding: 4px 15px;
  font-size: 18px;
}

.bookSession:hover,
.cancelBooking:hover {
  background-color: #b7bcc194;
}

.booking-input {
  border: 1px solid #eee;
  border-radius: 3px;
  width: 250px;
  caret-color: #666;
  padding: 8px 14px;
  font-size: 17px;
  font-family: "Nunito", sans-serif;
  transition: 0.2s ease;
  box-sizing: border-box;
  outline: none;
  margin-bottom: 5px;
}

.booking-input:hover {
  border-color: #ccc;
}
</style>
