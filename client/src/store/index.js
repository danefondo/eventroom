import Vue from "vue";
import Vuex from "vuex";

import auth from "./modules/auth";
import session from "./modules/session";
import profile from "./modules/profile";
import roomlogs from "./modules/roomlogs";
import tempuser from "./modules/tempuser";

Vue.use(Vuex);

const store = new Vuex.Store({
  modules: {
    auth,
    session,
    profile,
    roomlogs,
    tempuser,
  },

  // To ensure we get errors in dev (for better debugging) but not in production
  strict: process.env.NODE_ENV !== "production",
});

export default store;
