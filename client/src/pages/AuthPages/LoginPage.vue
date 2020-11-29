<template>
  <div class="auth">
    <div class="auth-container">
      <div class="auth-header">
        <div class="auth-title">Welcome back!</div>
        <div class="auth-subtitle">Log into your account</div>
      </div>
      <!-- <div class="external-auth fb-auth">
        <a class="fb-link" :href="facebookLoginLink">Sign in with FB</a>
      </div>
      <div class="external-auth google-auth">
        <a class="google-link" :href="googleLoginLink"> Sign in with Google </a>
      </div> -->
      <form @submit.prevent="login" class="auth-form" method="POST">
        <input
          v-model="username"
          class="auth-input"
          name="username"
          type="text"
          placeholder="Username or email"
          autocomplete="off"
        />
        <input
          v-model="password"
          class="auth-input"
          name="password"
          type="password"
          placeholder="Password"
          autocomplete="off"
        />
        <div v-if="error" class="inputErrorContainer">
          <div class="inputErrorText">{{ error }}</div>
        </div>
        <div class="submit">
          <input
            :disabled="submitting"
            class="auth-button"
            type="submit"
            :value="loginText"
          />
        </div>
      </form>
      <div class="auth-helper-button" @click="resetPassword = !resetPassword">
        Forgot password?
      </div>
      <div v-if="resetPassword">
        <p>Please enter your email</p>
        <form @submit.prevent="sendResetPassword" method="POST">
          <input
            v-model="resetEmail"
            name="resetEmail"
            type="text"
            placeholder="enter email"
            autocomplete="off"
          />
          <div class="submit">
            <input class="auth-button" type="submit" :value="resetText" />
          </div>
          <div v-if="resetPasswordSent">
            Please check your email. Make sure you wrote the correct email!
            Sometimes it might end up in your spam folder!
          </div>
        </form>
      </div>
      <div class="auth-alt-buttons">
        <div v-if="success" class="successMessage">
          Password has been successfully changed. Log in.
        </div>
        <router-link class="auth-alt-button" :to="{name: 'RegisterPage'}">
          Or create an account
        </router-link>
      </div>
    </div>
    {{random}}
    <div v-if="randombool">
      Random booled
    </div>
    <div v-else>
      Not booled
    </div>
    <button @click="randombool=!randombool"> Click</button>
  </div>
</template>

<script>
import { BASE_PATH } from "../../constants";
import auth from "../../api/auth";

export default {
  name: "LoginPage",
  data() {
    return {
      random: "HAHAH this so random",
      randombool: false,
      username: "",
      password: "",
      error: "",
      submitting: false,
      success: false,
      loginText: "Login",

      resetEmail: "",
      resetPassword: false,
      sending: false,
      resetPasswordSent: false,
      resetText: "Send email",

      googleLoginLink: BASE_PATH + "/api/auth/google",
      facebookLoginLink: BASE_PATH + "/api/auth/facebook",
    };
  },

  methods: {
    async login() {
      this.submitting = true;
      this.loginText = "Logging in...";
      try {
        const { username, password } = this;

        await auth.login( {username, password});

        this.error = "";
        this.$router.push("/");
      } catch (error) {
        if (
          error.response &&
          (error.response.status === 401 || error.response.status === 400)
        ) {
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
    toggleRefreshPassword() {
      this.resetPasswordSent = !this.resetPasswordSent;
    },
    async sendResetPassword() {
      console.log("@clicked!");
      this.sending = true;
      this.resetText = "Sending...";
      
      await auth.sendResetPasswordMail({ email: this.resetEmail, hostname: window.location.host });
      
      this.resetPasswordSent = true;
      this.sending = false;
      this.resetText = "Send email";
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
}
.auth-form {
  display: flex;
  flex-direction: column;
  margin-bottom: 25px;
  position: relative;
}
.auth-header {
  margin-bottom: 25px;
}
.auth-title {
  font-size: 50px;
  font-weight: bold;
  margin-bottom: 5px;
  color: #3e3a54;
}
.auth-subtitle {
  color: #858390;
  font-size: 18px;
}
.auth-input {
  width: 100%;
  border: 1px solid #eee;
  border-radius: 3px;
  caret-color: #666;
  padding: 8px 14px;
  font-size: 20px;
  font-family: "Nunito", sans-serif;
  transition: 0.2s ease;
  box-sizing: border-box;
  outline: none;
  margin-bottom: 7px;
}
.auth-input:focus,
.auth-input:hover {
  border-color: #ccc;
}
.auth-button {
  outline: none;
  background-color: #f9f9f9;
  color: #3e3a54;
  font-size: 24px;
  font-weight: bold;
  border: unset;
  padding: 6px;
  width: 100%;
  border-radius: 3px;
  cursor: pointer;
  font-family: "Nunito", sans-serif;
  margin-top: 8px;
}
.auth-button:hover {
  background-color: #f1f1f1;
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
  color: #3e3a54;
  display: block;
}
.auth-alt-button:visited {
  color: #3e3a54;
}
.auth-alt-button:hover {
  color: #757284;
}

.inputErrorContainer {
  padding: 8px 0px;
  background-color: #f9f9f9;
  border-radius: 3px;
  margin-bottom: 5px;
  color: #a72143;
  font-weight: 600;
}
</style>