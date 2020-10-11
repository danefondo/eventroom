<template>
  <div
    class="nav-container"
    :class="isAuthenticated ? 'authNav' : 'notAuthNav'"
  >
    <div class="navbar">
      <router-link to="/" class="nav-logo">Eventroom.to</router-link>
      <div v-if="isAuthenticated" class="flex">
        <router-link :to="profileLink" class="nav-button">Profile</router-link>
        <div @click="logUserOut" class="nav-button"
          >Logout</div
        >
      </div>
      <div v-else-if="!isAuthenticated">
        <router-link to="/account/login" class="nav-button">Login</router-link>
        <router-link to="/account/register" class="nav-button"
          >Register</router-link
        >
      </div>
    </div>
    <div v-if="isAuthenticated && !isVerified" class="unverified">
      <p>Your account is not verified!</p>
      <button @click="resendEmail">{{ buttonText }}</button>
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";
import { requestWithAuthentication } from "../config/api";
import auth from '../config/auth';

export default {
  name: "Nav",
  computed: {
    ...mapState({
      user: (state) => state.auth.user,
      isAuthenticated: (state) => state.auth.authenticationStatus,
      isVerified: (state) => state.auth.verificationStatus,
    }),
    profileLink: function () {
      return `/profile/${this.user.username}`;
    },
  },
  data() {
    return {
      buttonText: "Resend email",
      emailSentCounter: 0,
    };
  },
  methods: {
    async logUserOut() {
      try {
        const response = await auth.logout();
        if (response.data.success) {
          this.$router.push('/');
        }
      } catch (err) {
        console.log(err);
      }
    },
    async resendEmail() {
      try {
        console.log("@clicked");
        const response = await requestWithAuthentication(
          "post",
          `/api/accounts/resendemailverification`,
          { hostname: window.location.host, userId: this.user._id }
        );
        if (response.success && this.emailSentCounter < 5) {
          this.buttonText = "Resend email again";
          this.emailSentCounter += 1;
        }
      } catch (err) {
        console.log(err);
      }
    },
  },
};
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&display=swap");
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
  /* font-family: "Trebuchet MS", sans-serif; */
  font-family: "Nunito", sans-serif;
  /* font-weight: 700; */
  align-items: center;
}
.nav-button {
  padding: 7px 14px;
  border-radius: 3px;
  cursor: pointer;
  color: #abadb9;
  font-weight: 600;
}
.nav-logo {
  padding: 8px 14px;
  cursor: pointer;
  font-weight: 600;
  color: #abadb9;
}
.nav-logo:hover {
  color: #3e3a54;
}
.nav-button:hover {
  /* background-color: #f7f7fb; */
  color: #3e3a54;
}
</style>