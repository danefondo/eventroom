import Vue from "vue";
import Vuex from "vuex";

import auth from "./modules/auth";
import session from "./modules/session";
import profile from "./modules/profile";
import roomlogs from "./modules/roomlogs";

Vue.use(Vuex);

const store = new Vuex.Store({
  modules: {
    auth,
    session,
    profile,
    roomlogs,
  },

  // To ensure we get errors in dev (for better debugging) but not in production
  strict: process.env.NODE_ENV !== "production",
});

export default store;
