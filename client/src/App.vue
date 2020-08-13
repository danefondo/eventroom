<template>
  <div class="container">
    <router-view @update="update"></router-view>
  </div>
</template>

<script>
import { setAuth } from "./config/axios";
import auth from "./config/auth";
import axios from "axios";

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
      this.yo();
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
    async yo() {
      const data = await axios.get(
        `/api/events/getEvent/5f3561f876f06b1e098ae709`
      );
      console.log("ddd", data);
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
