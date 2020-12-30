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
import { bookOneSlot } from "../CalendarUtilities/calendarSocketHandlers";

export default {
  name: "BookSession",
  props: [
    "slotHasPerson",
    "slotPerson",
    "user",
    "currentUserData",
    "slotDateTime",
    "boxHeight",
    "selectedToBook",
    "currentlyBooking",
  ],
  computed: {
    matchedUserData() {
      return this.$store.getters["calendar/getBestMatchForDatetime"](this.slotDateTime);
    }
  },

  methods: {
    async bookSession() { // eslint-disable-line no-unused-vars
      let errors = {};
      console.log("@carel", this.currentlyBooking, this.selectedToBook.length);
      if (this.currentlyBooking) return;
      if (this.selectedToBook.length < 1) return;
      try {
        this.$store.dispatch("booking/setCurrentlyBooking", true);
        console.log("STARTING BOOKING");
        const sendData = {
          userData: this.currentUserData,
          matchedUserData: this.matchedUserData,
          dateTime: Number(this.slotDateTime)
        }
        console.log("@BookSession sendData: ", sendData);
        
        const bookingResult = await bookOneSlot(sendData);
        console.log("@booksession bookingResult: ", bookingResult);
        if (bookingResult) {
          this.handleSuccessfulBooking(sendData);
        } else {
          console.log("@booksession invalid response: ", bookingResult);
          errors.FailedToBookSession = true;
          throw { errors: errors };
        }
      } catch (error) {
        console.log("errorBooking", error);
        this.$store.dispatch("booking/setCurrentlyBooking", false);
      }
    },

    handleSuccessfulBooking(sendData) {
      this.$emit("refreshNextOrCurrentSession");

      // Add to calendar after booking
      this.$store.dispatch("calendar/setMatchForDatetime", {
        user: sendData.matchedUserData,
        dateTime: sendData.dateTime
      });

      this.$store.dispatch("booking/setCurrentlyBooking", false);

      this.$nextTick(() => {
        this.$store.dispatch("calendar/updateCalendarSlotAvailability", 0);
        // Must be last or component is destroyed before
        this.cancelSlot();
      });
    },

    /* Clear single selection */
    cancelSlot() {
      const updateData = {
        slotDateTime: this.slotDateTime,
        newSlotState: false,
        field: "isSelected",
      }
      
      this.$store.dispatch("calendar/updateOneSlotByDateTime", updateData);

      this.$nextTick(function () {
        // Must be last or component is destroyed before
        this.$store.dispatch("booking/cancelSlot", this.slotDateTime);
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
