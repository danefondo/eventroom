<template>
  <div>
    <form class="auth-form" method="POST" @submit.prevent="submitNewPassword()">
      <div class="notifier__register">
        <!-- <h2>Errors</h2> -->
      </div>
      <div class="form-groups">
        <div class="form-group">
          <input
            v-model="newPassword"
            class="auth-input"
            name="newPassword"
            type="password"
            placeholder="Enter your new password"
            autocomplete="off"
          />
          <div class="inputErrorContainer">
            <div class="inputErrorText">{{ getError('newPassword') }}</div>
          </div>
        </div>
        
        
      </div>
      <div class="buttonGroup">
        <input
          :disabled="submitting"
          class="auth-button"
          type="submit"
          :value="submitting ? 'Submitting...' : 'Submit'"
        />
      </div>
    </form>
  </div>
</template>

<script>
import { requestWithAuthentication } from '../../config/api';
import auth from '../../config/auth';

export default {
  name: "PassResetPage",
  async beforeRouteEnter (to, from, next) {
    try {
      const response = await requestWithAuthentication('get', `/api/accounts/passresetconfirmation`);
      if (response && response.data && response.data.success) {
        next();
      } else {
        console.log("@reset FAIL")
      }
    } catch (err) {
      console.log(err);
    }
  },
  data() {
    return {
      newPassword: "",
      buttonText: "Submit",
      submitting: false,
      submitted: false,

      errors: [],
    }
  },
  methods: {
    async submitNewPassword() {
      this.submitting = true;
      try {
        const response = await requestWithAuthentication('post', `/api/accounts/passreset`, { newPassword: this.newPassword });
        if (response.data.success) {
          await auth.isAuthenticated();
          this.submitting = false;
          this.submitted = true;
          this.$router.push("/");
        } 
      } catch (err) {
        if (err.response && err.response.status === 422) {
          this.errors = err.response.data.errors;
          console.log(this.errors);
          this.submitting = false;
          
        } else {
          console.log("internal server error");
        }
      }
    },
    getError(field) {
      const error = this.errors.filter((each) => each.param === field)[0];
      return error ? error.msg : "";
    },
  }
}
</script>