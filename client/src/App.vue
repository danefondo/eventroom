<template>
  <div :class="$route.meta.landingPage ? 'landing-container' : 'app-container'">
    <Nav v-if="!$route.meta.hideNavigation" />
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

export default {
  name: "App",

  computed: {
    ...mapState({
      user: (state) => state.auth.user,
      isAuthenticated: (state) => state.auth.authenticationStatus,
      isVerified: (state) => state.auth.verificationStatus,
    }),
  },

  components: {
    Nav,
  },
};
</script>

<style lang="scss">
@import url("https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&display=swap");

$link-color: #111;
$visited-color: #111;
$button-color: #493eff;
$button-hover-color: #493effd1;

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
}

body {
  overscroll-behavior-y: none;
  overscroll-behavior-x: none;
  font-family: "Nunito", "Trebuchet MS", "Lucida Sans Unicode", "Lucida Grande",
    "Lucida Sans", Arial, sans-serif;
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
}

.full {
  height: 100vh;
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
</style>
