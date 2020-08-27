<template>
  <div v-if="success">
    <SuccessPage :registrationMethod="registrationMethod"/>
  </div>
  <div v-else class="registration">
    <div class="registration-block">
      <div class="auth-header">
        <h1 class="auth-title">{{ $t("register.join-title")}}</h1>
        <div class="auth-subtitle">{{ $t("register.join-tagline")}}</div>
      </div>
      <div class="registration-form">
        <form class="auth-form" method="POST" @submit.prevent="register()">
          <div class="notifier__register">
            <h2>Errors</h2>
          </div>
          <div class="form-groups">
            <div class="form-group">
              <input
                v-model="email"
                class="auth-input"
                name="email"
                type="text"
                placeholder="example@mail.com"
                autocomplete="falsessy"
              />
              <div class="inputErrorContainer">
                <div class="inputErrorText">{{ getError('email') }}</div>
              </div>
            </div>
            <div class="form-group">
              <input
                v-model="username"
                class="auth-input"
                name="username"
                type="text"
                :placeholder="$t('register.username')"
                autocomplete="falsess"
              />
              <div class="inputErrorContainer">
                <div class="inputErrorText">{{ getError('username') }}</div>
              </div>
            </div>
            <div class="form-group">
              <input
                v-model="password"
                class="auth-input"
                name="password"
                :type="passwordType ? 'password' : 'text'"
                :placeholder="$t('register.pass')"
                autocomplete="off"
              />
              <div class="showPassContainer">
                <img
                  @click="toggleType('passwordType')"
                  class="showPass inline"
                  src="../../assets/images/light-eye-unbox.png"
                />
              </div>
              <div class="inputErrorContainer">
                <div class="inputErrorText">{{ getError('password') }}</div>
              </div>
            </div>
            <div class="form-group last-form-group">
              <input
                v-model="passwordCheck"
                class="auth-input"
                name="passcheck"
                :type="passwordCheckType ? 'password' : 'text'"
                :placeholder="$t('register.confirm-pass')"
                autocomplete="off"
              />
              <div class="showPassContainer">
                <img
                  @click="toggleType('passwordCheckType')"
                  class="showPass inline"
                  src="../../assets/images/light-eye-unbox.png"
                />
              </div>
              <div class="inputErrorContainer">
                <div class="inputErrorText">{{ getError('passcheck') }}</div>
              </div>
            </div>
          </div>
          <div class="buttonGroup">
            <input
              :disabled="submitting"
              class="auth-button"
              type="submit"
              :value="submitting ? $t('register.creating') : $t('register.create')"
            />
          </div>
        </form>
        <router-link class="auth-alt-button" to="/login">{{ $t("register.already-have-account")}}</router-link>
        <a :href="facebookLoginLink">Log in with FB</a>
        <a :href="googleLoginLink"> Log in with Google </a>
      </div>
    </div>
  </div>
</template>

<script>
import auth from "../../config/auth";
import SuccessPage from "./SuccessPage";
import { BASE_PATH } from "../../constants"

export default {
  name: "RegisterPage",
  components: {
    SuccessPage,
  },
  data() {
    return {
      email: "",
      username: "",
      password: "",
      passwordCheck: "",
      errors: [],
      passwordCheckType: true,
      passwordType: true,
      submitting: false,
      success: false,

      googleLoginLink: BASE_PATH+"/api/accounts/google",
      facebookLoginLink: BASE_PATH+"/api/accounts/facebook",

      registrationMethod: "",
    };
  },
  methods: {
    toggleType(type) {
      this[type] = !this[type];
    },
    async register() {
      this.submitting = true;
      try {
        const { email, username, password, passwordCheck } = this;
        //axios.defaults.withCredentials=true;
        const response = await auth.register({
          email,
          username,
          password,
          passcheck: passwordCheck,
          hostname: window.location.host,
        });
        this.errors = [];
        this.success = true;
        this.registrationMethod = "local";
        console.log("registration successful: ", response.data);
      } catch (error) {
        if (error.response && error.response.status === 422) {
          this.errors = error.response.data.errors;
          console.log(this.errors);
        } else {
          console.log("internal server error");
        }
      } finally {
        this.submitting = false;
      }
    },
    async registerFacebook() {
      try {
        //const response = await axios.get(`/api/accounts/register/facebook`);
        //console.log(response);
      } catch (error) {
        console.log("error", error);
      } finally {
        console.log("rip");
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
.registration {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  height: 100%;
  width: 100%;
}
.registration-block {
  max-width: 350px;
  width: 325px;
  text-align: center;
  margin-top: -156px;
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
.form-groups {
  display: flex;
  text-align: center;
  flex-direction: column;
  justify-content: center;
}
.form-group {
  display: flex;
  margin-bottom: 5px;
  justify-content: center;
  position: relative;
}

.form-group input {
  width: 100%;
}

.showPass {
  width: 18px;
}
.showPassContainer {
  position: absolute;
  right: 3%;
  top: 0px;
  bottom: 26%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  vertical-align: middle;
}
</style>
