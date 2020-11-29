<template>
  <div v-if="!errors">
    Internal server error: {{errors}}
  </div>
  <div v-else>
    Please wait while you're redirected. THIS IS ERRORS: {{errors}}
    <!--<button @click="print"> print </button> -->
  </div>
</template>

<script>
import auth from "../../api/auth";

export default {
  name: "PassResetRedirectPage",
  data() {
    return {
      errors: false
    }
  },
  async created() {
    console.log("@createD!!!")
    try {
      console.log("HERE")
      const response = await auth.passResetRedirect(this.$route.params.token);
      if (response && response.status === 303) {
        this.$route.push("/account/passreset");
      } 
    } catch (err) {
      if (err.response) {
        if (err.response.status === 303) {
          console.log(err);
          this.$router.push("/account/passreset");
        } else if (err.response.status === 401) {
          console.log("internal server error");
        }
      }
      this.errors = true;
    }
  },
}
</script>