<template>
  <div class="nav-container" :class="isAuthenticated ? 'authNav' : 'notAuthNav'">
    <div class="nav-logo">Oveno</div>
    <div v-if="isAuthenticated" @click="logout" class="nav-button">Logout</div>
    <router-link v-else-if="!isAuthenticated" to="/login" class="nav-button">Login</router-link>
  </div>
</template>

<script>
import auth from "../config/auth";

export default {
  name: "Nav",
  props: {
    isAuthenticated: {
      type: Boolean,
      required: true,
    },
    user: {
      type: Object,
      required: true,
    },
  },
  methods: {
    logout() {
      auth.logout();
    },
  },
};
</script>

<style scoped>
.nav-container {
    display: flex;
    justify-content: space-between;
    padding: 10px;
    font-family: 'Trebuchet MS', sans-serif;
}
.nav-button {
    padding: 8px 14px;
    border-radius: 4px;
    cursor: pointer;
}
.nav-logo {
    padding: 8px 14px;
}
.nav-button:hover {
    background-color: #f7f7fb;
}
</style>