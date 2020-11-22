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
import participants from "./modules/participants";
import chat from "./modules/chat";
import preferences from "./modules/preferences";
import booking from "./modules/booking";
import cofocus from "./modules/cofocus";
import calendar from "./modules/calendar";

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
    mediastates,
    participants,
    chat,
    preferences,
    booking,
    cofocus,
    calendar,
  },

  // To ensure we get errors in dev (for better debugging) but not in production
  // If app is slow in testing, just comment this line out to see the real speed!
  // https://forum.vuejs.org/t/adding-many-objects-to-vuex-state-is-slow/10492/10
  
  // strict: process.env.NODE_ENV !== "production",
});

export default store;
