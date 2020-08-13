<template>
  <Success v-if="success" />
  <div v-else class="registrationBlock__registerPage">
    <div class="titleBlock__registerPage">
      <h1 class="title__registerPage">{{ $t("register.join-title")}}</h1>
      <div class="subtitle__registerPage">{{ $t("register.join-tagline")}}</div>
    </div>
    <div class="registration-form">
      <form class="form-register" method="POST" @submit.prevent="register()">
        <div class="notifier__register">
          <h2>Errors</h2>
        </div>
        <div class="form-groups">
          <div class="form-group">
            <input
              v-model="email"
              class="input__registration first-input"
              name="email"
              type="text"
              placeholder="example@mail.com"
              autocomplete="falsess"
            />
            <div class="inputErrorContainer">
              <div class="inputErrorText">{{ getError('email') }}</div>
            </div>
          </div>
          <div class="form-group">
            <input
              v-model="username"
              class="input__registration"
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
              class="input__registration inline passwordInput"
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
              class="input__registration last-input passwordInput"
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
            class="register-button"
            type="submit"
            :value="submitting ? $t('register.creating') : $t('register.create')"
          />

          <router-link
            class="accountExists__registerPage"
            to="/login"
          >{{ $t("register.already-have-account")}}</router-link>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import axios from "axios";
// import Success from "../components/Success";

export default {
  name: "RegisterPage",
  components: {
    // Success,
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
        const response = await axios.post(`/api/accounts/register`, {
          email,
          username,
          password,
          passcheck: passwordCheck,
        });
        this.errors = [];
        this.success = true;
        this.$emit("update", response.data);
      } catch (error) {
        if (error.response.status === 422) {
          this.errors = error.response.data.errors;
        } else {
          console.log("internal server error");
        }
      } finally {
        this.submitting = false;
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
</style>
