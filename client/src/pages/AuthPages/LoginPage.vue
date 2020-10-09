<template>
  <div class="auth">
    <div class="auth-container">
      
      <div class="auth-header">
        <div class="auth-title">{{$t("login.login-title")}}</div>
        <div class="auth-subtitle">{{$t("login.login-subtitle")}}</div>
      </div>
      <div class="external-auth fb-auth">
        <a class="fb-link" :href="facebookLoginLink">Sign in with FB</a>
      </div>
      <div class="external-auth google-auth">
        <a class="google-link" :href="googleLoginLink"> Sign in with Google </a>
      </div>
      <form @submit.prevent="login" class="auth-form" method="POST">
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
        <div v-if="error" class="inputErrorContainer">
          <div class="inputErrorText">{{ error }}</div>
        </div>
        <div class="submit">
          <input :disabled="submitting" class="auth-button" type="submit" :value="loginText" />
        </div>
      </form>
      <div class="auth-helper-button" @click="toggleRefreshPassword">{{$t("login.forgot-pass")}}</div>
        <div v-if="refreshPassword">
          <p>Please enter your email </p>
          <form @submit.prevent="sendRefreshPassword" method="POST">
            <input
              v-model="refreshEmail"
              name="refreshEmail"
              type="text"
              placeholder="enter email"
              autocomplete="off"
            />
            <div class="submit">
              <input class="auth-button" type="submit" :value="refreshText" />
            </div>
            <div v-if="refreshPasswordSent">
              Please check your email. Make sure you wrote the correct email! Sometimes it might end up in your spam folder!
            </div>
          </form>
        </div>
      <div class="auth-alt-buttons">
        <div v-if="success" class="successMessage">{{$t("login.pass-success")}}</div>
        <router-link class="auth-alt-button" to="/account/register">{{$t("login.or-create-account")}}</router-link>
      </div>
    </div>
  </div>
</template>

<script>
import { BASE_PATH } from "../../constants"
import auth from "../../config/auth";
import { requestWithoutAuthentication } from "../../config/api";

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

      refreshEmail: "",
      refreshPassword: false,
      sending: false,
      refreshPasswordSent: false,
      refreshText: "Send email",

      googleLoginLink: BASE_PATH+"/api/accounts/google",
      facebookLoginLink: BASE_PATH+"/api/accounts/facebook",
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
        if (error.response && (error.response.status === 401 || error.response.status === 400)) {
          this.error = error.response.data.error;
          console.log("@login here");
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
    toggleRefreshPassword() {
      this.refreshPassword = !this.refreshPassword;
    },
    async sendRefreshPassword() {
      console.log("@clicked!");
      this.sending = true;
      this.refreshText = "Sending...";

      await requestWithoutAuthentication('post', '/api/accounts/sendresetpasswordmail', {email: this.refreshEmail, hostname: window.location.host});
      this.refreshPasswordSent = true;
      this.sending = false;
      this.refreshText = "Send email";
    },
  },
};
</script>

<style scoped>
.external-auth {
  padding: 10px;
}
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