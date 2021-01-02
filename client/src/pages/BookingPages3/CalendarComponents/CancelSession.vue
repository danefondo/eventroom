<template>
  <div v-if="quickCancel" @click="cancelSession" class="selected-close">x</div>
  <div v-else :style="boxHeight" class="cancel-container">
    <div class="cancel-info">
      <span class="cancel-time">{{ sessionTime }}</span>
      <div>
        <span class="cancel-title">Cancel session?</span>
        <div @click="exitIsCanceling" class="cancel-buttons">No</div>
        <div @click="cancelSession" class="cancel-buttons cancel-button">
          Yes
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { cancelOneSlot } from "../CalendarUtilities/calendarSocketHandlers";

export default {
  name: "CancelSession",
  props: [
    "quickCancel",
    "currentUserData",
    "calendarData",
    "user",
    "slotDateTime",
    "boxHeight",
    "sessionTime",
  ],
  computed: {
    matchedUserData() {
      return this.$store.getters["calendar/getBestMatchForDatetime"](this.slotDateTime);
    }
  },
  methods: {
    async cancelSession() {
      let errors = {};
      console.log("@cancelsession matchedUserData: ", this.matchedUserData);

      try {
        const sendData = {
          userData: this.currentUserData,
          matchedUserData: this.matchedUserData,
          dateTime: Number(this.slotDateTime)
        }
        console.log("@Cancelsession sendData: ", sendData);

        const cancelResult = await cancelOneSlot(sendData);
        if (cancelResult) {
          this.$emit("refreshNextOrCurrentSession");
          this.$emit("handleSuccessfulCancel", this.slotDateTime);
        } else {
          console.log("@cancelSession invalid response: ", cancelResult);
          errors.FailedToCancelSessions = true;
          throw { errors: errors };
        }
      } catch (error) {
        console.log("errorBooking", error);
        this.$store.dispatch("booking/setCurrentlyBooking", false);
      }
    },   
  },
};
</script>

<style scoped>
.cancel-container {
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  width: 100%;
  z-index: 999;
}

.cancel-info {
  background-color: #fafafc;
  flex-direction: column;
  justify-content: space-around;
  height: 88%;
  border: 1px solid #d8d8d833;
  width: 95%;
  display: flex;
  align-items: center;
  border-radius: 4px;
  position: relative;
}

.cancel-time {
  color: #c0c0d0;
  /* background-color: #dcdfe0; */
  padding: 1px 6px;
  border-radius: 360px;
  font-size: 12px !important;
  font-weight: bold;
  color: #b7b7ca;
  margin-right: auto;
  left: 0;
  font-weight: 800;
  position: absolute;
  top: 11px;
  left: 6px;
  font-weight: 800;
  left: 8px;
}

.cancel-title {
  font-weight: 700;
  text-transform: capitalize;
  position: absolute;
  color: #5600ffe0;
  left: 0;
  right: 0;
  top: 29px;
  font-size: 18px;
}

/* .cancel-title {
  color: #6c7592;
  color: #5c6992; 
  color: #53568a; 
  color: #4b4f8c; 
  color: #eaeaef;
} */

.cancel-buttons {
  position: absolute;
  left: 10px;
  right: 10px;
  bottom: 5px;
  padding: 2px 12px;
  border-radius: 360px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  background-color: #bfc0d0;
  background-color: #fbeaee;
  color: #5600ff;
  font-size: 17px;
  outline: none;
  border: none;
  bottom: 9px;
  top: unset;
  background-color: #eaedfb;
  font-size: 16px;
  padding: 4px 12px;
  left: 7px;
  width: 27.5%;
}

.cancel-buttons:hover {
  background-color: #b4b8b9;
}

.cancel-button {
  position: absolute;
  left: 10px;
  right: 10px;
  bottom: 5px;
  padding: 2px 12px;
  border-radius: 360px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  background-color: #bfc0d0;
  background-color: #fbeaee;
  color: #5600ff;
  font-size: 17px;
  outline: none;
  border: none;
  bottom: 9px;
  top: unset;
  background-color: #eaedfb;
  font-size: 16px;
  padding: 4px 12px;
  left: 7px;
  right: 7px;
  left: unset;
  background-color: #fbeaef;
  color: #5600ff;
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
