import Vue from "vue";
import Vuex from "vuex";

import auth from "./modules/auth";
import session from "./modules/session";
import profile from "./modules/profile";
import roomlogs from "./modules/roomlogs";
import tempuser from "./modules/tempuser";
import toolbar from "./modules/toolbar";
import eventroom from "./modules/eventroom";
import twilio from "./modules/twilio";
import mediastates from "./modules/mediastates";

Vue.use(Vuex);

const store = new Vuex.Store({
  modules: {
    auth,
    session,
    profile,
    roomlogs,
    tempuser,
    toolbar,
    eventroom,
    twilio,
    mediastates
  },

  // To ensure we get errors in dev (for better debugging) but not in production
  strict: process.env.NODE_ENV !== "production",
});

export default store;
