<template>
  <div class="account-manager">
    <form @submit.prevent="login" class="signin-form" method="POST">
      <div v-if="error" class="inputErrorContainer">
        <div class="inputErrorText">{{ error }}</div>
      </div>
      <div class="login-title">{{$t("login.login-title")}}</div>
      <input
        v-model="username"
        class="login-input"
        name="username"
        type="text"
        :placeholder="$t('login.username-email')"
        autocomplete="off"
      />
      <input
        v-model="password"
        class="login-input"
        name="password"
        type="password"
        :placeholder="$t('login.login-pass')"
        autocomplete="off"
      />
      <router-link class="forgotPass" to="/forgotpassword">{{$t("login.forgot-pass")}}</router-link>
      <div class="submit">
        <input :disabled="submitting" class="login-button" type="submit" value="Log in" />
      </div>
      <div v-if="success" class="successMessage">{{$t("login.pass-success")}}</div>
      <router-link class="accountExists__registerPage" to="/register">{{$t("login.or-create-account")}}</router-link>
    </form>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: "LoginPage",
  data() {
    return {
      username: "",
      password: "",
      error: '',
      submitting: false,
      success: false,
    };
  },
  methods: {
    async login() {
      this.submitting = true;
      try {
        const { username, password } = this;
        const response = await axios.post(`/api/accounts/login`, {
          username,
          password,
        });
        this.error = '';
        this.$emit("update", response.data);
        this.$router.push('/');
      } catch (error) {
        if (error.response.status === 401) {
          this.error = error.response.data.error;
        } else {
          console.log("internal server error");
        }
      } finally {
        this.submitting = false;
      }
    },
    getError(field) {
      const error = this.errors.filter(each => each.param === field)[0];
      return error ? error.msg : "";
    }
  }
};
</script>

<style scoped>

</style>