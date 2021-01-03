<template>
  <div
    v-if="ready"
    class="nav-container"
    :class="isAuthenticated ? 'authNav' : 'notAuthNav'"
  >
    <div class="navbar">
      <router-link v-if="!isCofocus" to="/" class="nav-logo"
        >Eventroom.to</router-link
      >
      <router-link v-else-if="isCofocus" to="/" class="nav-logo"
        >Cofocus</router-link
      >
      <div v-if="isAuthenticated" class="flex">
        <div
          class="nav-button username"
          :class="navDropdown ? 'dropdown-active' : ''"
          @mouseover="mouseOver"
          @mouseout="mouseOut"
          @click.self="toggleDropdown"
        >
          {{ user.username }}
          <img
            @click.self="toggleDropdown"
            :src="navHover || navDropdown ? darkDownArrow : lightDownArrow"
            :class="
              navDropdown || navDropdown
                ? 'dropdown-icon dropdown-active'
                : 'dropdown-icon'
            "
          />
          <NavDropdown v-if="navDropdown" :user="user" />
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
import { VUE_APP_COFOCUS } from "../../src/constants";

export default {
  name: "Nav",
  computed: {
    ...mapState({
      user: (state) => state.auth.user,
      isAuthenticated: (state) => state.auth.authenticationStatus,
      ready: (state) => state.auth.ready,
    }),
    profileLink: function () {
      return `/profile/${this.user.username}`;
    },
    isCofocus() {
      return VUE_APP_COFOCUS ? true : false;
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
      // loading: true,
    };
  },
  mounted() {
    console.log("@nav: ", this.isAuthenticated, this.ready);
    document.addEventListener("click", this.close);
  },
  beforeDestroy() {
    document.removeEventListener("click", this.close);
  },
  methods: {
    close(e) {
      if (!this.$el.contains(e.target)) {
        this.navDropdown = false;
      }
    },
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
    $route() {
      this.navDropdown = false;
    },
  },
  // watch: {
  //   "$store.state.auth.ready": function () {
  //     this.loading = false;
  //   },
  // },
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
  border-radius: 6px;
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
  /* border: 1px solid #eee; */
}

.dropdown-active {
  background-color: #f3f4f7eb;
  /* border: 1px solid #eee; */
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