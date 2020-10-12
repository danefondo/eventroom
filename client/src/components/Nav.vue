<template>
  <div
    v-if="!loading"
    class="nav-container"
    :class="isAuthenticated ? 'authNav' : 'notAuthNav'"
  >
    <div class="navbar">
      <router-link to="/" class="nav-logo">Eventroom.to</router-link>
      <div v-if="isAuthenticated" class="flex">
        <div
          class="nav-button username"
          :class="navDropdown ? 'dropdown-active' : ''"
          @mouseover="mouseOver"
          @mouseout="mouseOut"
          @click="toggleDropdown"
        >
          {{ user.username }}
          <img
            :src="navHover || navDropdown ? darkDownArrow : lightDownArrow"
            :class="
              navDropdown || navDropdown
                ? 'dropdown-icon dropdown-active'
                : 'dropdown-icon'
            "
          />
          <NavDropdown
            v-if="navDropdown"
            :user="user"
            @click.prevent="toggleDropdown"
          />
        </div>

        <!-- <div @click="logUserOut" class="nav-button"
          >Logout</div
        > -->
      </div>
      <div v-else-if="!isAuthenticated">
        <router-link to="/account/login" class="nav-button">Login</router-link>
        <router-link to="/account/register" class="nav-button"
          >Register</router-link
        >
      </div>
    </div>
    <!-- <div v-if="isAuthenticated && !isVerified" class="unverified">
      <p>Your account is not verified!</p>
      <button @click="resendEmail">{{ buttonText }}</button>
    </div> -->
  </div>
</template>

<script>
import { mapState } from "vuex";
import { requestWithAuthentication } from "../config/api";
import lightDownArrow from "../assets/images/down-arrow-light-sharp.png";
import darkDownArrow from "../assets/images/down-arrow-dark-sharp.png";
import NavDropdown from "./NavDropdown";

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
  components: {
    NavDropdown,
  },
  data() {
    return {
      buttonText: "Resend email",
      emailSentCounter: 0,
      lightDownArrow: lightDownArrow,
      darkDownArrow: darkDownArrow,
      navDropdown: false,
      navHover: false,
      loading: true,
    };
  },
  methods: {
    toggleDropdown() {
      this.navDropdown = !this.navDropdown;
    },
    mouseOut() {
      if (this.navDropdown) return;
      this.navHover = !this.navHover;
    },
    mouseOver() {
      if (this.navDropdown) return;
      this.navHover = !this.navHover;
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
  watch: {
    "$store.state.auth.ready": function () {
      this.loading = false;
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
.nav-container {
  z-index: 9999;
  /* position: absolute;
  width: 100%;
  top: 0;  */
}
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

.username {
  padding: 11px 11px;
  border-radius: 3px;
  /* background-color: #f3f4f7eb; */
  border: 1px solid transparent;
  cursor: pointer;
  position: relative;
  padding-right: 34px;
}

.username:hover {
  /* background-color: #f2f3f5eb; */
  /* background-color: #f3f4f7eb; */
  background-color: #f3f4f7eb;
  border: 1px solid #eee;
}

.dropdown-active {
  background-color: #f3f4f7eb;
  border: 1px solid #eee;
  color: #3e3a54;
}

.dropdown-icon {
  position: absolute;
  height: 17px;
  width: 19px;
  top: 0;
  bottom: 0;
  margin: auto;
  right: 11px;
  border: none !important;
  background-color: unset !important;
}
</style>