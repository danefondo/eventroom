<template>
  <div class="modal">
    <div class="modal-body">
      <div class="selectedToBook">
        <div
          class="sessionToBook"
          v-for="(slot, index) in selectedToBook"
          :key="index"
        >
          <div class="session-header">
            {{ `${slot.dayNameShort}` }}
          </div>
          <div class="session-header">
            {{ `${slot.slotStartTime}-${slot.slotEndTime}` }}
          </div>
        </div>
      </div>
      <form>
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
      </form>
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
import { requestWithAuthentication } from "../../../config/api";
import { bookManySlots } from "../CalendarUtilities/calendarSocketHandlers";
import { convertBooker } from "../CalendarUtilities/dataconverter";

export default {
  name: "Booker",
  props: [
    "selectedToBook",
    "currentlyBooking",
    "user",
    "slotData",
    "boxHeight",
    "sessionTime",
    "selectedSlotName",
    "selectedInterval",
    "selectedSlotDateString",
    "selectedSlotStartTime",
  ],
  computed: {
    slotName: {
      get() {
        return this.selectedSlotName;
      },
      set(value) {
        this.$store.dispatch("booking/setSelectedSlotName", value);
      },
    },
    slotDateString: {
      get() {
        return this.selectedSlotDateString;
      },
      set(value) {
        this.$store.dispatch("booking/setSelectedSlotDateString", value);
      },
    },
    slotStartTime: {
      get() {
        return this.selectedSlotStartTime;
      },
      set(value) {
        this.$store.dispatch("booking/setSelectedSlotStartTime", value);
      },
    },
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
    async bookManySessionsCarel() { // eslint-disable-line no-unused-vars
      let errors = {};
      if (this.currentlyBooking) return;
      if (this.selectedToBook.length < 1) return;
      try {
        this.$store.dispatch("booking/setCurrentlyBooking", true);
        
        let datetimes = []
        // Prepare selected to book data
        for (let i=0; i<this.selectedToBook.length; i++) {
          datetimes.push((new Date(this.selectedToBook[i].dateTime).valueOf()));
        }
        const sendData = {
          ID: this.user._id,
          datetimes,
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
          const pushSessions = convertBooker(sessions, this.user);
          const pushData = {
            sessions: pushSessions,
            userId: this.user._id,
          };
          // console.log("@PUSHDATA FROM RESPONSE", pushData);
          /* ====== ADD TO CALENDAR AFTER BOOKING ====== */
          this.$store.dispatch("calendar/pushManyCalendarSessions", pushData);

          this.$emit("refreshNextOrCurrentSession");

          this.$store.dispatch("booking/setCurrentlyBooking", false);

          this.$nextTick(function () {
            this.pushBookingUpdateToOthers(sessions); // TODO to remove since unnecessary and handled already
            this.$store.dispatch("calendar/updateCalendarSlotAvailability", 0);
            this.cancelBooking();
          });
        }
      } catch (error) {
        console.log("errorBooking", error);
        this.$store.dispatch("booking/setCurrentlyBooking", false);
      }
    },

    async bookManySessions() {
      let errors = {};
      if (this.currentlyBooking) return;
      if (this.selectedToBook.length < 1) return;
      try {
        this.$store.dispatch("booking/setCurrentlyBooking", true);

        let sessionsToBook = [];
        let sessionTimes = [];
        // Prepare selected to book data
        this.selectedToBook.forEach((toBook) => {
          let toBookTime = new Date("" + toBook.dateTime);
          let slotData = {
            sessionInterval: this.selectedInterval,
            dateTime: toBookTime,
          };

          sessionTimes.push(toBookTime);
          sessionsToBook.push(slotData);
        });

        // console.log("BEFORE SEND 1 sessiontimes:", sessionTimes);
        // console.log("BEFORE SEND 2 sessionsToBook:", sessionsToBook);

        sessionsToBook = JSON.parse(JSON.stringify(sessionsToBook));

        // Could just use userId in the backend to
        // grab the rest of the user's data
        let sendData = {
          slotsToBookArray: sessionsToBook,
          slotsToBookTimesArray: sessionTimes,
          userId: this.user._id,
          username: this.user.username,
          firstName: this.user.firstName,
          lastName: this.user.lastName,
          displayName: this.user.displayName,
          profileImageUrl: this.user.profileImageUrl,
        };

        // console.log("BEFORE SEND 3 sendData:", sendData);

        const response = await requestWithAuthentication(
          `post`,
          `api/booking/bookManySessionSlots`,
          sendData
        );
        let sessions = response.data.result;
        if (!sessions) {
          errors.FailedToBookSession = true;
          throw { errors: errors };
        }

        if (response.data.success) {
          let pushData = {
            sessions,
            userId: this.user._id,
          };
          // console.log("@PUSHDATA FROM RESPONSE", pushData);
          /* ====== ADD TO CALENDAR AFTER BOOKING ====== */
          this.$store.dispatch("calendar/pushManyCalendarSessions", pushData);

          this.$emit("refreshNextOrCurrentSession");

          this.$store.dispatch("booking/setCurrentlyBooking", false);

          this.$nextTick(function () {
            this.pushBookingUpdateToOthers(sessions);
            this.$store.dispatch("calendar/updateCalendarSlotAvailability", 0);
            this.cancelBooking();
          });
        }
      } catch (error) {
        console.log("errorBooking", error);
        this.$store.dispatch("booking/setCurrentlyBooking", false);
      }
    },

    pushBookingUpdateToOthers(sessions) {
      let sessionsInfo = {
        userId: this.user._id,
        sessions: sessions,
        roomType: "cofocus",
      };
      this.$socket.emit("pushSessionsToOthers", sessionsInfo);
    },

    /* Clear all current selections */
    cancelBooking() {
      this.selectedToBook.forEach((slotData) => {
        let slot = JSON.parse(JSON.stringify(slotData));

        let updateData = {
          targetSlot: slot,
          newSlotState: false,
          all: true,
          field: 0,
        };

        this.$store.dispatch(
          "calendar/updateCalendarSelectedSlots",
          updateData
        );
      });

      this.$store.dispatch("calendar/clearAllSelections");

      this.$nextTick(function () {
        this.$store.dispatch("calendar/updateCalendarSlotAvailability", 1);
      });
    },
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
