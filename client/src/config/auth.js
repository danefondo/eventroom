import jwtDecode from "jwt-decode";
// import axios from 'axios';
import { setAuth, authAxios2 } from "./axios";
export default {
  async isAuthenticated2() {
    try {
      const response = await authAxios2.get(`/api/accounts/authenticate`);
      console.log("response", response);
      return true;
    } catch (err) {
      console.log("@isauth:", err);
      return false;
    }
  },

  isAuthenticated() {
    try {
      if (localStorage.token && jwtDecode(localStorage.token)) {
        // check expiry
        const user = jwtDecode(localStorage.token).user;
        return user;
      } else {
        return false;
      }
    } catch (error) {
      return false;
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
