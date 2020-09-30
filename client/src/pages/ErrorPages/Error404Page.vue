<template>
  <div class="central-control-station">
    <span class="welcome">Well that's a 404 right there.</span>
  </div>
</template>

<script>
import { mapState } from "vuex";

export default {
  name: "Error404Page",
  computed: {
    ...mapState({
      user: (state) => state.auth.user,
      isAuthenticated: (state) => state.auth.authenticationStatus,
      isVerified: (state) => state.auth.verificationStatus,
    }),
  },
};
</script>

<style scoped>

</style>