<template>
  <div>
    <p>Whaddddup.</p>
    <div v-if="isAuthenticated">
      <p>You are logged in.</p>
    </div>
    <div v-if="!isAuthenticated">
      <p>You are not logged in.</p>
      <router-link to="/login">Login</router-link>
    </div>
  </div>
</template>

<script>
import auth from "../../config/auth";

export default {
  name: "HomePage",
  data() {
    return {
      isAuthenticated: false,
      user: {},
    };
  },
  mounted() {
    if (auth.isAuthenticated()) {
      this.user = auth.isAuthenticated();
      this.isAuthenticated = true;
    }
  },
  methods: {
      logout() {
          auth.logout();
      }
  }
};
</script>

<style scoped>
</style>