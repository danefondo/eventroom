<template>
  <div :class="$route.meta.landingPage ? 'landing-container' : 'app-container'">
    <Nav v-if="!$route.meta.hideNavigation" />
    <!-- Do not show this timer in Calendar & Session pages -->
    <!-- <carel-is-testing /> -->

    <!-- <TimerManager parentName="app" v-if="user && isAuthenticated && !$route.meta.customTimer" /> -->
    <div
      :class="
        $route.meta.hideNavigation ? 'page-container full' : 'page-container'
      "
    >
      <router-view></router-view>
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";
import Nav from "./components/Nav";
// import CarelIsTesting from './components/CarelIsTesting.vue';
// import InstantMatch from "./matching/InstantMatch.vue";
// import TimerManager from "./components/TimerManager";

export default {
  name: "App",
  components: {
    Nav,
    // CarelIsTesting,
    // InstantMatch,
    // TimerManager,
  },
  mounted() {
    console.log("Hello. I am Macintosh. ", this.$route.meta.hideNavigation);
    console.log("Make the small things unforgettable.");
  },
  computed: {
    ...mapState({
      user: (state) => state.auth.user,
      isAuthenticated: (state) => state.auth.authenticationStatus,
    }),
  },
};
</script>

<style lang="scss">
@import url("https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&display=swap");

$link-color: #111;
$visited-color: #111;
$button-color: #493eff;
$button-hover-color: #493effd1;

.messageTextLink {
  color: #1f3058;
  text-decoration: underline;
}

.messageTextLink:hover {
  color: blue;
}

#app {
  font-family: "Nunito", "Helvetica", "Arial", sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}

html,
body {
  height: 100%;
  overflow: hidden;
  font-family: "Nunito", "Trebuchet MS", "Lucida Sans Unicode", "Lucida Grande",
    "Lucida Sans", Arial, sans-serif;
}

body {
  overscroll-behavior-y: none;
  overscroll-behavior-x: none;
}

a {
  text-decoration: none;
  color: $link-color;
}
a:visited {
  color: $visited-color;
}

.app-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: scroll;
}

.landing-container {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 30px);
  border: 1px solid #eee;
  margin: 15px;
  border-radius: 3px;
  background-color: #fbfbfb;
}

.page-container {
  height: calc(100vh - 52px);
  position: relative;
}

.full {
  height: 100vh;
}

.borderless {
  border: none;
}

/* Button styles */

.button {
  outline: none;
  background-color: #493eff;
  color: white;
  font-size: 16px;
  font-weight: bold;
  border: unset;
  padding: 10px;
  width: 100%;
  border-radius: 3px;
  cursor: pointer;
  display: block;
  margin: 0 auto;
  margin-top: 25px;
  max-width: 275px;
}
.button:hover {
  background-color: #493effd1;
}

.mb-20 {
  margin-bottom: 20px !important;
}

.flex {
  display: flex;
}

.dont-break-out {
  /* These are technically the same, but use both */
  overflow-wrap: break-word;
  word-wrap: break-word;

  -ms-word-break: break-all;
  /* This is the dangerous one in WebKit, as it breaks things wherever */
  word-break: break-all;
  /* Instead use this non-standard one: */
  word-break: break-word;

  /* Adds a hyphen where the word breaks, if supported (No Blink) */
  // -ms-hyphens: auto;
  // -moz-hyphens: auto;
  // -webkit-hyphens: auto;
  // hyphens: auto;
}

// ::-webkit-scrollbar {
//   width: 10px;
//   height: 4px;
// }

// /* Track */
// ::-webkit-scrollbar-track {
//   background-color: #eaeaea;
//   border-radius: 5px;
// }

// /* Handle */
// ::-webkit-scrollbar-thumb {
//   border-radius: 5px;
//   -webkit-border-radius: 5px;
//   background: rgb(208 208 208 / 80%);
// }

// ::-webkit-scrollbar-thumb:window-inactive {
//   background: rgb(208 208 208 / 80%);
// }
</style>
