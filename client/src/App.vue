<template>
  <div class="app-container">
    <Nav :isAuthenticated="isAuthenticated" :user="user" :isVerified="isVerified" />
    <div class="page-container">
      <router-view @update="update"></router-view>
    </div>
  </div>
</template>

<script>
import auth from "./config/auth";
import Nav from "./components/Nav";

export default {
  name: "App",
  data() {
    return {
      isAuthenticated: false,
      isVerified: false,
      user: {},
    };
  },
  components: {
    Nav
  },
  mounted() {
    this.update();
  },

  methods: {
    async update() {
      let authenticationResult = await auth.isAuthenticated();
      if (authenticationResult.success) {
        this.user = authenticationResult.response.user;
        this.isVerified = authenticationResult.response.user.isVerified;
        this.isAuthenticated = true;
      }
    },
  },
};
</script>

<style lang="scss">
$link-color: #111;
$visited-color: #111;
$button-color: #493eff;
$button-hover-color: #493effd1;

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}

html, body {
  height: 100%;
}

body {
  overscroll-behavior-y: none;
  font-family: 'Trebuchet MS', 'Lucida Sans Unicode', 'Lucida Grande', 'Lucida Sans', Arial, sans-serif;
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
}

.page-container {
  height: calc(100vh - 52px);
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

</style>
