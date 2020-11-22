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
      user: (state) => state.auth.user,
      isAuthenticated: (state) => state.auth.authenticationStatus,
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
          console.log("Added leave timestamp to:", session);
        }
      } catch (error) {
        console.log("error: ", error);
        this.failedToAddTimeStamp = true;
      }
    },
  },
};
</script>

<style scoped>
</style>