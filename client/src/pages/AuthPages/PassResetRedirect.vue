<template>
  <div v-if="!errors">
    Please wait while you're redirected
  </div>
  <div v-else>
    Internal server error
  </div>
</template>

<script>
import { requestWithAuthentication } from '../../config/api';

export default {
  name: "PassResetRedirect",
  data() {
    return {
      errors: false,
    }
  },
  async mounted() {
    try {
      const response = await requestWithAuthentication('get', `/api/accounts/passresetredirect/${this.$route.params.token}`);
      if (response && response.status === 303) {
        this.$route.push("/resetpassword");
      } 
    } catch (err) {
      if (err.response) {
        if (err.response.status === 303) {
          console.log(err);
          this.$router.push("/resetpassword");
        } else if (err.response.status === 401) {
          console.log("internal server error");
        }
      }
      this.errors = true;
    }
  }
}
</script>