<template>
  <div>
    <div class="container">
      <router-view @update="update"></router-view>
    </div>
  </div>
</template>

<script>
import { setAuth } from "./config/axios";
import auth from "./config/auth";

export default {
  name: "App",
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
    update(details) {
      if (details.token) {
        setAuth(details.token, false);
        this.isAuthenticated = true;
      }
      this.isVerified = details.user.isVerified;
      this.user = details.user;
    },
  },
};
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}

a {
  text-decoration: none;
}

/* body {
  font-family: 'Trebuchet MS', sans-serif;
} */
</style>
