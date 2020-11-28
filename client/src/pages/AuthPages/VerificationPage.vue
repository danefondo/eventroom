<template>
  <div v-if="verifying"> Verifying... </div>
  <div v-else> 
    You're screwed  
    {{error_message}}
  </div>
</template>

<script>
import auth from '../../api/auth';

export default {
  name: "VerificationPage",

  data() {
    return {
      verified: false,
      verifying: false,
      error_message: "",
    }
  },

  mounted() {
    this.verify();
  },

  methods: {
    async verify() {
      this.verifying = true;
      try {
        console.log("START")
        const {data} = await auth.verify({verificationToken: this.$route.params.token}); 
        console.log("DONE");
        if (data.message === "verification.verified") {
          this.verified = true;
          this.$router.push('/');
          // auth.logout();
        } else {
          this.verified = false;  
          this.error_message = "Verification unsuccessful"
        }
      } catch (error) {
        console.log("rip, ", error);
        if (error.response.status === 500) {
          this.error_message = "DB error occurred";
        } else if (error.response.status === 401) {
          this.error_message = "Please ensure you have created an account or that the verification token has not expired";
        } else {
          this.error_message = "internal server error";
        }
      } finally {
        this.verifying = false;
      }
    }
  }
}
</script>

<style scoped>
.verificationPage {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
}
</style>