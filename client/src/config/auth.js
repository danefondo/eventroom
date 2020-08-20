import jwtDecode from "jwt-decode";
// import axios from 'axios';
import { setAuth, authAxios } from "./axios";
export default {
  async isAuthenticated() {
    try {
      console.log("@isauth: Starting auth");
      const response = await authAxios.get(`/api/accounts/authenticate`);
      console.log("@isauth: response", response);
      return { success: true, response: response.data};
    } catch (err) {
      console.log("@isauth:", err);
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
  logout() {
    setAuth(null);
  },
};
