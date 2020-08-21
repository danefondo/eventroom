<template>
  <div class="nav-container" :class="isAuthenticated ? 'authNav' : 'notAuthNav'">
    <div class="navbar">
      <router-link to="/" class="nav-logo">Oveno</router-link>
      <div v-if="isAuthenticated" @click="logout" class="nav-button">Logout</div>
      <div v-else-if="!isAuthenticated">
        <router-link to="/login" class="nav-button">Login</router-link>
        <router-link to="/register" class="nav-button">Register</router-link>
      </div>
    </div>
    <div v-if="isAuthenticated&&!isVerified" class="unverified">Your account is not verified!</div>
  </div>
</template>

<script>
import { mapState } from 'vuex';

import auth from "../config/auth";
 

export default {
  name: "Nav",

  
  computed: {
    ...mapState({
      user: state => state.user,
      isAuthenticated: state => state.authenticationStatus,
      isVerified: state => state.verificationStatus,
    })
  },

  methods: {
    async logout() {
      try {
        const response = await auth.logout();
        console.log("@nav logout: ", response.data);
        if (response.data.success) {
          this.$router.push("/logout");
        }
      } catch (err) {
        console.log(err);
      }
    },
  },
};
</script>

<style scoped>
.unverified {
  font-size: 21px;
  text-align: center;
  background-color: #bf0000;
  color: white;
  padding: 5px;
}
/* .nav-container {
  position: absolute;
  width: 100%;
  top: 0; 
} */
.navbar {
  display: flex;
  justify-content: space-between;
  padding: 10px;
  font-family: "Trebuchet MS", sans-serif;
  align-items: center;
}
.nav-button {
  padding: 8px 14px;
  border-radius: 4px;
  cursor: pointer;
}
.nav-logo {
  padding: 8px 14px;
  cursor: pointer;
}
.nav-logo:hover {
  color: #333;
}
.nav-button:hover {
  background-color: #f7f7fb;
}
</style>