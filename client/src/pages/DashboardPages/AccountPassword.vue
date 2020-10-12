<template>
  <div class="settings">
    <div class="settings-left">
      <SettingsMenu />
    </div>
    <div class="settings-right">
      <ChangePassword :user="user" />
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";
import SettingsMenu from "./DashboardComponents/SettingsMenu";
import ChangePassword from "./DashboardComponents/ChangePassword";

export default {
  name: "AccountPassword",
  components: {
    SettingsMenu,
    ChangePassword,
  },
  computed: {
    ...mapState({
      user: (state) => state.auth.user,
      isAuthenticated: (state) => state.auth.authenticationStatus,
      isVerified: (state) => state.auth.verificationStatus,
    }),
  },
};
</script>

<style scoped>
.settings {
  display: flex;
  flex-wrap: wrap;
  width: 100%;
  height: 100%;
  margin-bottom: 100px;
  justify-content: center;
  align-content: space-between;
}

.settings-right {
  width: 700px;
  margin-left: 25px;
}

.settings-left,
.settings-right {
  padding-top: 50px;
  padding-bottom: 75px;
}
</style>