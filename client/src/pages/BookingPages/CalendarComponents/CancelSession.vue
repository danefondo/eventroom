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
import { requestWithAuthentication } from "../../../config/api";

export default {
  name: "CancelSession",
  props: [
    "quickCancel",
    "calendarData",
    "user",
    "slotData",
    "boxHeight",
    "sessionTime",
  ],

  methods: {
    async cancelSession() {
      let errors = {};
      let localSession = this.slotData["userSessionsForSlot"][0];

      try {
        let sendData = {
          userId: this.user._id,
          sessionId: localSession._id,
        };
        console.log("@cancelSession, sendData: ", sendData);
        const response = await requestWithAuthentication(
          `post`,
          `api/booking/cancelSession`,
          sendData
        );
        console.log("@cancelSession, response: ", response);
        let session = response.data.result;
        if (!session) {
          errors.FailedToCancelSession = true;
          throw { errors: errors };
        }

        if (response.data.success) {
          this.handleSuccessfulCancel(session, localSession);

          this.exitIsCanceling();

          this.$nextTick(function () {
            console.log("are you running?");
            this.$store.dispatch("calendar/updateCalendarSlotAvailability", 0);
            // this.$store.dispatch("calendar/updateCalendarSlotAvailability", 1);
          });
        }
      } catch (error) {
        console.log("@cancelSession, error: ", error);
      }
    },

    // Remove from user sessions.
    // If had a partner, add to people sessions

    handleSuccessfulCancel(session, localSession) {
      // For cancel receiver to quickly filter to the right session
      let sessionIsEmpty = false;

      let cancelData = {
        sessionId: localSession._id,
        sessionDateTime: localSession.dateTime,
      };

      if (session._id && session._id == localSession._id) {
        cancelData.session = session;
      } else if (session == 1) {
        sessionIsEmpty = true;
      }

      this.updateCalendarDataAfterCancel(cancelData);

      this.pushCancelUpdateToOthers(localSession, sessionIsEmpty, session);
    },

    pushCancelUpdateToOthers(localSession, sessionIsEmpty, session) {
      let updateCanceledSession = {
        sessionId: localSession._id,
        sessionDateTime: localSession.dateTime,
        cancelerId: this.user._id,
        session: session,
      };

      if (sessionIsEmpty) {
        updateCanceledSession.sessionIsEmptyAndToBeDeleted = sessionIsEmpty;
      }

      let sessions = [];
      sessions.push(updateCanceledSession);
      let sessionInfo = {
        userId: this.user._id,
        sessions: sessions,
        roomType: "cofocus",
      };
      console.log("Pushing canceled sessions to others");
      this.$socket.emit("pushCanceledSessionsToOthers", sessionInfo);
    },

    exitIsCanceling() {
      let slot = JSON.parse(JSON.stringify(this.slotData));

      let updateData = {
        targetSlot: slot,
        newSlotState: false,
        all: false,
        field: 1,
      };

      this.$store.dispatch("calendar/updateCalendarSelectedSlots", updateData);
      slot.isCanceling = false;
      this.$store.dispatch("booking/exitIsCanceling", slot);

      this.$nextTick(function () {
        this.$store.dispatch("calendar/updateCalendarSlotAvailability", 1);
      });
    },

    updateCalendarDataAfterCancel(dataFromCancel) {
      /* ====== REMOVE AFFECTED USER SESSIONS ====== */
      let removeInfo = {
        sessionId: dataFromCancel.sessionId,
        sessionDateTime: dataFromCancel.sessionDateTime,
      };
      this.$store.dispatch(
        "calendar/removeInfoFromCalendarAfterCancel",
        removeInfo
      );

      console.log("CANCEL SESSION: ", dataFromCancel.session);
      if (dataFromCancel.session) {
        /* ====== ADD REMAINS TO OTHER PEOPLE SESSIONS ====== */
        let pushInfo = { session: dataFromCancel.session };
        this.$store.dispatch(
          "calendar/pushInfoToCalendarAfterCancel",
          pushInfo
        );
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
