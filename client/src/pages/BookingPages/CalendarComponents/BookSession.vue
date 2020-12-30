<template>
  <div :style="boxHeight" class="selected-container">
    <div class="selected-info">
      Selected
      <span v-if="slotHasPerson" class="unmatched-title book-person">{{
        slotPerson.name
      }}</span>
      <div class="selected-book" @click="bookSession">Book</div>
      <div class="selected-close" @click="cancelSlot">x</div>
    </div>
  </div>
</template>

<script>
import { bookSlots } from "../CalendarUtilities/calendarSocketHandlers";
import { convertBookSession } from "../CalendarUtilities/dataconverter";

export default {
  name: "BookSession",
  props: [
    "slotHasPerson",
    "slotPerson",
    "user",
    "slotData",
    "boxHeight",
    "selectedToBook",
    "currentlyBooking",
    "selectedInterval",
    "selectedSlotDateTime",
    "selectedSlotStartTime",
    "selectedSlotDateString",
    "allUserSessions",
    "calendarData",
  ],

  methods: {
    async bookSession() { // eslint-disable-line no-unused-vars
      let errors = {};
      console.log("@carel", this.currentlyBooking, this.selectedToBook.length);
      if (this.currentlyBooking) return;
      if (this.selectedToBook.length < 1) return;
      try {
        this.$store.dispatch("booking/setCurrentlyBooking", true);
        console.log("here");
        const sendData = {
          datetimes: [this.selectedSlotDateTime.valueOf()],
          ID: this.user._id,
          preferences: null,
          preferenceData: null,
          metaData: {
            profileImageUrl: this.user.profileImageUrl,
            username: this.user.username,
            displayName: this.user.displayName,
          }
        }
        
        const sessions = await bookSlots(sendData);
        console.log("@booksession received sessions: ", sessions);
        if (sessions && sessions.length === 1) {
          console.log("converted session: ", convertBookSession(sessions[0], this.user));
          this.handleSuccessfulBooking(convertBookSession(sessions[0]));
          return;
        } else {
          console.log("@booksession invalid response: ", sessions);
          errors.FailedToBookSession = true;
          throw { errors: errors };
        }
      } catch (error) {
        console.log("errorBooking", error);
        this.$store.dispatch("booking/setCurrentlyBooking", false);
      }
    },

    handleSuccessfulBooking(session) {
      this.$emit("refreshNextOrCurrentSession");
      console.log("@handlesuccessfulbooking session: ", typeof(session), session);
      let pushData = {
        session,
        userId: this.user._id,
      };

      // Add to calendar after booking
      this.$store.dispatch("calendar/pushOneCalendarSession", pushData);

      this.$store.dispatch("booking/setCurrentlyBooking", false);

      this.$nextTick(() => {
        this.pushBookingUpdateToOthers(session); // TODO to remove since unnecessary and handled already
        this.$store.dispatch("calendar/updateCalendarSlotAvailability", 0);

        // Must be last or component is destroyed before
        this.cancelSlot();
      });
    },

    pushBookingUpdateToOthers(session) {
      //   Prepare data for socket
      let sessions = [];
      sessions.push(session);

      let sessionInfo = {
        userId: this.user._id,
        sessions: sessions,
        roomType: "cofocus",
      };

      this.$socket.emit("pushSessionsToOthers", sessionInfo);
    },

    /* Clear single selection */
    cancelSlot() {
      let slot = JSON.parse(JSON.stringify(this.slotData));

      let updateData = {
        targetSlot: slot,
        newSlotState: false,
        all: false,
        field: 0,
      };

      this.$store.dispatch("calendar/updateCalendarSelectedSlots", updateData);

      slot.isSelected = false;

      this.$nextTick(function () {
        // Must be last or component is destroyed before
        this.$store.dispatch("calendar/cancelSlot", slot);
        this.$store.dispatch("calendar/updateCalendarSlotAvailability", 1);
      });
    },
  },
};
</script>
<style scoped>
.selected-container {
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  width: 100%;

  z-index: 999;
}

.selected-info {
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
  /* left: 40px; */
  left: 45px;
  font-size: 18px;
  color: #343556;

  z-index: 999;
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

.selected-book:hover {
  background-color: #b4b8b9;
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
</style>
