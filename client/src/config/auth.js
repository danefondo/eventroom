import jwtDecode from "jwt-decode";
import { setAuth } from "./axios";
export default {
  isAuthenticated() {
    try {
      if (localStorage.token && jwtDecode(localStorage.token)) {
        // check expiry
        const user = jwtDecode(localStorage.token).user;
        user.is_live = localStorage.isLive || false;
        user.active_stream_id = localStorage.active_stream_id || false;
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
