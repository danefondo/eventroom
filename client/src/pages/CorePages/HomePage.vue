<template>
  <div>
    <Nav />
    <p>Whaddddup.</p>
    <div v-if="isAuthenticated">
      <p>You are logged in.</p>
      <router-link to="events/createevent">Create an event</router-link>
    </div>
    <div v-if="!isAuthenticated">
      <p>You are not logged in.</p>
      <router-link to="/login">Login</router-link>
    </div>
  </div>
</template>

<script>
import Nav from "../../components/Nav";
import auth from "../../config/auth";

export default {
  name: "HomePage",

  components: {
    Nav,
  },

  data() {
    return {
      isAuthenticated: false,
      isVerified: false,
      user: {},
    };
  },
  mounted() {
    let authenticationResult = auth.isAuthenticated();
    if (authenticationResult) {
      this.user = authenticationResult;
      this.isVerified = authenticationResult.isVerified;
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