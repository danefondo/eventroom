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
        this.$store.dispatch("calendar/removeSelectionsInThePast");
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
        
        sendData.preferences = this.user.preferences;
        // console.log("@bookSession, sendData: ", sendData);
        const response = await requestWithAuthentication(
          `post`,
          `api/booking/bookSessionSlot`,
          sendData
        );
        // console.log("@bookSession, response: ", response);
        let session = response.data.result;
        if (!session) {
          errors.FailedToBookSession = true;
          throw { errors: errors };
        }
        // console.log("@SESSION FROM RESPONSE", session);

        if (response.data.success) {
          this.handleSuccessfulBooking(session);
        }
      } catch (error) {
        console.log("errorBooking", error);
        this.$store.dispatch("booking/setCurrentlyBooking", false);
      }
    },

    handleSuccessfulBooking(session) {
      this.$emit("refreshNextOrCurrentSession");

      let pushData = {
        session,
        userId: this.user._id,
      };

      // Add to calendar after booking
      this.$store.dispatch("calendar/pushOneCalendarSession", pushData);

      this.$store.dispatch("booking/setCurrentlyBooking", false);

      this.$nextTick(() => {
        this.pushBookingUpdateToOthers(session);
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
