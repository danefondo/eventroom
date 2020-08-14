import jwtDecode from "jwt-decode";
import { setAuth } from "./axios";
export default {
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
        const tempHost = jwtDecode(localStorage.tempToken).tempHost;
        return tempHost;
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
