import jwtDecode from "jwt-decode";
// import axios from 'axios';
import { authAxios } from "./axios";
import store from "../store";


export default {
  async register({email, username, password, passcheck, hostname}) {
    try {
      console.log("@authregister")
      console.log(email)
      console.log(username)
      console.log(password)
      console.log(passcheck)
      console.log(hostname)
      const response = await authAxios.post(`/api/accounts/register`, {
        email,
        username,
        password,
        passcheck,
        hostname,
      });
      return response;
    } catch (err) {
      console.log(err);
      throw err;
    }
  },

  async login(username, password) {
    try {
      const response = await authAxios.post(`/api/accounts/login`, {
        username,
        password,
      });
      console.log("@authlogin", response.data.user);
      store.commit('updateAuthenticationStatus', response.data.success);
      store.commit('updateVerificationStatus', response.data.user.isVerified);
      store.commit('updateUser', response.data.user);
      console.log("@authlogin", store.state.user);
      console.log("@authlogin", store.state.authenticationStatus);
      console.log("@authlogin", store.state.verificationStatus);
      return response;
    } catch (err) {
      console.log(err);
      throw err;
    }
  },

  async logout() {
    try {
      const response = await authAxios.get(`/api/accounts/logout`); 
      store.commit("updateAuthenticationStatus", !response.data.success);
      store.commit('updateVerificationStatus', false);
      store.commit('updateUser', null);
      return response;
    } catch (err) {
      console.log(err);
      throw err;
    }
  },

  async isAuthenticated() {
    try {
      const response = await authAxios.get(`/api/accounts/authenticate`);
      return { success: true, response: response.data};
    } catch (err) {
      // console.log("@isauth:", err);
      return { success: false, response: err.response};
    }
  },

  checkTempToken() {
    try {
      if (localStorage.tempToken && jwtDecode(localStorage.tempToken)) {
        // check expiry
        const tempUser = jwtDecode(localStorage.tempToken).tempUser;
        return tempUser;
      } else {
        return false;
      }
    } catch (error) {
      return false;
    }
  },
  

};
