<template>
  <div class="auth">
    <div class="auth-container">
      <form @submit.prevent="login" class="auth-form" method="POST">
        <div v-if="error" class="inputErrorContainer">
          <div class="inputErrorText">{{ error }}</div>
        </div>
        <div class="auth-header">
          <div class="auth-title">{{$t("login.login-title")}}</div>
          <div class="auth-subtitle">{{$t("login.login-subtitle")}}</div>
        </div>
        <input
          v-model="username"
          class="auth-input"
          name="username"
          type="text"
          :placeholder="$t('login.username-email')"
          autocomplete="off"
        />
        <input
          v-model="password"
          class="auth-input"
          name="password"
          type="password"
          :placeholder="$t('login.login-pass')"
          autocomplete="off"
        />
        <router-link class="auth-helper-button" to="/forgotpassword">{{$t("login.forgot-pass")}}</router-link>
        <div class="submit">
          <input :disabled="submitting" class="auth-button" type="submit" :value="loginText" />
        </div>
      </form>
      <div class="auth-alt-buttons">
        <div v-if="success" class="successMessage">{{$t("login.pass-success")}}</div>
        <router-link class="auth-alt-button" to="/register">{{$t("login.or-create-account")}}</router-link>
      </div>
    </div>
  </div>
</template>

<script>
// import { authAxios } from "../../config/axios";
import auth from "../../config/auth";

export default {
  name: "LoginPage",
  data() {
    return {
      username: "",
      password: "",
      error: "",
      submitting: false,
      success: false,
      loginText: "Login",
    };
  },
  methods: {
    async login() {
      this.submitting = true;
      this.loginText = "Logging in...";
      try {
        const { username, password } = this;
  
        await auth.login(username, password);
        
        this.error = "";
        this.$router.push("/");
      } catch (error) {
        if (error.response && error.response.status === 401) {
          this.error = error.response.data.error;
        } else {
          console.log("internal server error");
        }
      } finally {
        this.submitting = false;
        this.loginText = "Login";
      }
    },
    getError(field) {
      const error = this.errors.filter((each) => each.param === field)[0];
      return error ? error.msg : "";
    },
  },
};
</script>

<style>
.auth {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
.auth-container {
  max-width: 350px;
  text-align: center;
  margin-top: -156px;
}
.auth-form {
  display: flex;
  flex-direction: column;
  margin-bottom: 25px;
}
.auth-header {
  margin-bottom: 25px;
}
.auth-title {
  font-size: 50px;
  font-weight: bold;
  margin-bottom: 5px;
}
.auth-subtitle {
  color: #aaa;
  font-size: 18px;
}
.auth-input {
  padding: 10px;
  margin-bottom: 15px;
  border: 1px solid #ddd;
  border-radius: 3px;
  font-size: 16px;
}
.auth-input:focus {
  border: 2px solid #493eff;
}
.auth-button {
  outline: none;
  background-color: #493eff;
  color: white;
  font-size: 16px;
  font-weight: bold;
  border: unset;
  padding: 10px;
  width: 100%;
  border-radius: 3px;
  cursor: pointer;
}
.auth-button:hover {
  background-color: #493effd1;
}
.auth-alt-buttons {
  display: flex;
  flex-direction: column;
}
.auth-helper-button {
  margin-bottom: 15px;
  margin-top: -5px;
  text-align: left;
  color: #aaa;
  padding-left: 5px;
}
.auth-helper-button:visited {
  color: #aaa;
}
.auth-helper-button:hover {
  color: #ccc;
}
.auth-alt-button {
  margin-bottom: 10px;
  color: #555;
  display: block;
}
.auth-alt-button:visited {
  color: #555;
}
.auth-alt-button:hover {
  color: #777;
}
</style>