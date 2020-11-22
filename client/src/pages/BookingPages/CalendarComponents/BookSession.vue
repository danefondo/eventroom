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
import { requestWithAuthentication } from "../../../config/api";

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
    /* Book single session */
    async bookSession() {
      let errors = {};
      if (this.currentlyBooking) return;
      if (this.selectedToBook.length < 1) return;
      try {
        this.$store.dispatch("booking/setCurrentlyBooking", true);
        let sendData = {
          sessionInterval: this.selectedInterval,
          dateTime: this.selectedSlotDateTime,
        };
        sendData.userId = this.user._id;
        sendData.username = this.user.username;
        sendData.firstName = this.user.firstName;
        sendData.lastName = this.user.lastName;
        sendData.displayName = this.user.displayName;
        sendData.profileImageUrl = this.user.profileImageUrl;
        console.log("@bookSession, sendData: ", sendData);
        const response = await requestWithAuthentication(
          `post`,
          `api/booking/bookSessionSlot`,
          sendData
        );
        console.log("@bookSession, response: ", response);
        let session = response.data.result;
        if (!session) {
          errors.FailedToBookSession = true;
          throw { errors: errors };
        }
        console.log("@SESSION FROM RESPONSE", session);

        if (response.data.success) {
          let pushData = {
            session,
            userId: this.user._id,
          };
          console.log("@PUSHDATA FROM RESPONSE", pushData);
          /* ====== ADD TO CALENDAR AFTER BOOKING ====== */
          this.$store.dispatch("calendar/pushOneCalendarSession", pushData);

          //   Prepare data for socket
          let sessions = [];
          sessions.push(session);

          console.log("SESSIONS IN RESPONSE", sessions);

          let sessionInfo = {
            userId: this.user._id,
            sessions: sessions,
            roomType: "cofocus",
          };

          this.$socket.emit("pushSessionsToOthers", sessionInfo);

          this.$store.dispatch("booking/setCurrentlyBooking", false);

          this.$nextTick(function () {
            this.$store.dispatch("calendar/updateCalendarSlotAvailability", 0);
          });

          this.cancelSlot();
        }
      } catch (error) {
        console.log("errorBooking", error);
        this.$store.dispatch("booking/setCurrentlyBooking", false);
      }
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
      this.$store.dispatch("calendar/cancelSlot", slot);

      this.$nextTick(function () {
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
