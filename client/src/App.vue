<template>
  <div class="container">
    <router-view @update="update"></router-view>
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
      user: {},
    };
  },
  mounted() {
    if (auth.isAuthenticated()) {
      this.user = auth.isAuthenticated();
      this.isAuthenticated = true;
    }
  },
  methods: {
    update(details) {
      if (details.token) {
        setAuth(details.token, false);
        this.isAuthenticated = true;
      }
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
</style>
