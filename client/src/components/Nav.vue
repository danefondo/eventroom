<template>
  <div class="nav-container" :class="isAuthenticated ? 'authNav' : 'notAuthNav'">
    <div class="navbar">
      <router-link to="/" class="nav-logo">Oveno</router-link>
      <div v-if="isAuthenticated">
        <router-link :to="profileLink" class="nav-button">Profile</router-link>
        <router-link to="/logout" class="nav-button">Logout</router-link>
      </div>
      <div v-else-if="!isAuthenticated">
        <router-link to="/login" class="nav-button">Login</router-link>
        <router-link to="/register" class="nav-button">Register</router-link>
      </div>
    </div>
    <div v-if="isAuthenticated&&!isVerified" class="unverified">
      <p>Your account is not verified! </p>
      <button @click="resendEmail">{{buttonText}}</button>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import { requestWithAuthentication } from '../config/api';

export default {
  name: "Nav",
  computed: {
    ...mapState({
      user: state => state.auth.user,
      isAuthenticated: state => state.auth.authenticationStatus,
      isVerified: state => state.auth.verificationStatus,
    }),
    profileLink: function() {
      return `/profile/${this.user.username}`;
    }
  },
  data() {
    return {
      buttonText: "Resend email",
      emailSentCounter: 0,
    }
  },
  methods: {
    async resendEmail() {
      try {
        console.log("@clicked");
        const response = await requestWithAuthentication('post', `/api/accounts/resendemailverification`, {hostname: window.location.host, userId: this.user._id});
        if (response.success && this.emailSentCounter < 5) {
          this.buttonText = "Resend email again";
          this.emailSentCounter += 1;
        }
      } catch(err) {
        console.log(err);
      }
    },
  }
}
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