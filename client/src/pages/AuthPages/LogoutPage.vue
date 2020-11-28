<template>
  <div v-if="loggingOut">
    You are currently logging out.
  </div>
  <div v-else>
    Somethings wrong
  </div>
</template>
<script>
import auth from "../../api/auth";

export default {
  name: "LogoutPage",
  data() {
    return {
      loggingOut: true,

    }
  },
  async created() {
    try {
      const response = await auth.logout();
      console.log("logout response: ", response);
    } catch (error) {
      console.log("@logoutpage: error", error);
    }
  }
}
</script>