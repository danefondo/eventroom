<template>
  <div class="settings-menu">
    <div class="menu-item">
      <router-link
        to="/account/settings"
        :class="[checkActive('settings'), 'menu-link']"
        >Profile</router-link
      >
    </div>
    <div class="menu-item">
      <router-link
        to="/account/settings/preferences"
        :class="[checkActive('preferences'), 'menu-link']"
        >Preferences</router-link
      >
    </div>
    <div class="menu-item">
      <router-link
        to="/account/settings/password"
        :class="[checkActive('password'), 'menu-link']"
        >Password</router-link
      >
    </div>
    <div class="menu-item">
      <router-link
        to="/account/settings/danger"
        :class="[checkActive('danger'), 'menu-link']"
        >Danger Zone</router-link
      >
    </div>
  </div>
</template>

<script>
export default {
  name: "SettingsMenu",
  methods: {
    checkActive(page) {
      return window.location.pathname.split("/").pop() == page ? "active" : "";
      //   return this.$route.path.includes(page) ? "active" : "";
    },
  },
};
</script>

<style scoped>
.settings-menu {
  padding-top: 75px;
}
.menu-link {
  width: 165px;
  padding: 10px 10px;
  border: 0 solid #f1f1f1;
  font-weight: bold;
  background-color: #f5f5f5;
  border-radius: 19px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #222;
  font-size: 20px;
  margin: 11px 0px;
}

.menu-link:hover {
  background-color: #e2e2e2;
}

.active {
  background-color: #e2e2e2;
}
</style>