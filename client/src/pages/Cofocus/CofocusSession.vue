<template>
  <div></div>
</template>

<script>
// import axios from "axios";
import { mapState } from "vuex";
import { requestWithAuthentication } from "../../config/api";

export default {
  name: "CofocusSession",
  data() {
    return {
      failedToAddTimeStamp: false,
    };
  },
  computed: {
    ...mapState({
      hasJoinedDuringSession: (state) => state.cofocus.hasJoinedDuringSession,
    }),
  },
  mounted() {
    // this.getProfileDataByUserId();
  },
  methods: {
    async registerJoinTimestamp(joinTimestamp) {
      try {
        const response = await requestWithAuthentication(
          `post`,
          "/api/session/registerJoinTimestamp",
          joinTimestamp
        );

        let session = response.data.result;
        if (!session) throw new Error("Failed to update session.");

        if (response.data.success) {
          if (!this.hasJoinedDuringSession) {
            this.changeState("hasJoinedDuringSession", true);
          }
          this.changeState("isCurrentlyInSession", true);
          console.log("Added timestamp to:", session);
        }
      } catch (error) {
        console.log("error: ", error);
        this.failedToAddTimeStamp = true;
      }
    },
    async registerLeaveTimestamp(leaveTimestamp) {
      try {
        const response = await requestWithAuthentication(
          `post`,
          "/api/session/registerLeaveTimestamp",
          leaveTimestamp
        );

        let session = response.data.result;
        if (!session) throw new Error("Failed to update session.");

        if (response.data.success) {
          this.changeState("isCurrentlyInSession", false);
          console.log("Added leave timestamp to:", session);
        }
      } catch (error) {
        console.log("error: ", error);
        this.failedToAddTimeStamp = true;
      }
    },

    changeState(field, newValue) {
      let dispatchObject = { field, newValue };
      this.$store.dispatch("cofocus/changeSingleState", dispatchObject);
    },
  },
};
</script>

<style scoped>
</style>