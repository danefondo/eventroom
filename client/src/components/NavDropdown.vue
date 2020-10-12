<template>
  <div class="dropdown">
    <router-link to="/account/settings" class="dropdown-item">
      <div>Account settings</div>
    </router-link>
    <div class="dropdown-item logout">
      <div @click="logUserOut" class="logout-button">Logout</div>
    </div>
  </div>
</template>

<script>
import auth from "../config/auth";

export default {
  name: "NavDropdown",
  props: ["user"],
  methods: {
    async logUserOut() {
      try {
        const response = await auth.logout();
        if (response.data.success) {
          this.$router.push("/");
        }
      } catch (err) {
        console.log(err);
      }
    },
  },
};
</script>

<style scoped>
.dropdown {
  position: absolute;
  width: 225px;
  /* height: 200px; */
  background-color: #f4f5f7;
  right: -1px;
  border: 1px solid #eee;
  top: 45px;
  border-radius: 3px;
  transition: 0.2s ease-in-out;
  display: flex;
  flex-direction: column;
  padding-top: 8px;
  cursor: default;
  padding-bottom: 4px;
}

.dropdown-item {
  margin: 0 auto;
  width: 200px;
  background-color: #e7e9ef;
  padding: 8px 6px;
  border-radius: 3px;
  font-size: 17px;
  cursor: pointer;
}

.dropdown-item:hover {
  background-color: #dcdfe4;
}

.logout {
  margin: 0 auto;
  width: 200px;
  background-color: unset;
  padding: 8px 6px;
  border-radius: 3px;
  font-size: 17px;
  cursor: default !important;
  margin-top: 10px;
}

.logout:hover {
  background-color: unset;
}

.logout-button {
  cursor: pointer;
  font-size: 14px;
  height: max-content;
  width: max-content;
  color: #6c7075;
}

.logout-button:hover {
  color: unset;
}
</style>