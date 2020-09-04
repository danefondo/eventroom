/**
 * 
 * 
 * 
 * THIS FILE WILL BE DELETED 
 * 
 * 
 * 
 * USE STORE IN STORE FOLDER INSTEAD
 * 
 * 
 * 
 * THIS FILE IS NOT IN USE
 * 
 * 
 * 
 * DO NOT USE THIS FILE
 * 
 * 
 * 
 */

import Vue from "vue";
import Vuex from "vuex";

// import auth from "./config/auth";
import { authAxios } from "./config/axios";

Vue.use(Vuex);

const state = {
  ready: false,

  user: null,

  authenticationStatus: false,
  verificationStatus: false,

  containersReady: [],

  streamsWaitingForContainer: [],
};

const mutations = {
  ready(state) {
    state.ready = true;
  },

  updateAuthenticationStatus(state, newStatus) {
    // console.log("before: ", state.authenticationStatus);
    state.authenticationStatus = newStatus;
    // console.log("after:", state.authenticationStatus);
  },

  updateVerificationStatus(state, newStatus) {
    // console.log("before: ", state.verificationStatus);
    state.verificationStatus = newStatus;
    // console.log("after:", state.verificationStatus);
  },

  updateUser(state, newUser) {
    state.user = newUser;
  },

  addReadyContainer(state, containerObject) {
    state.containersReady.push(containerObject);
  },

  removeFinalizedContainer(state, containerObjectId) {
    let index = state.containersReady.findIndex((data) => data.objectId === containerObjectId);
    state.containersReady.splice(index, 1);
  },

  setStreamOnHold(state, streamObject) {
    state.streamsWaitingForContainer.push(streamObject);
  },

  removeStreamOnHold(state, streamObjectId) {
    let index = state.streamsWaitingForContainer.findIndex((data) => data.objectId === streamObjectId);
    state.streamsWaitingForContainer.splice(index, 1);
  },
};

const actions = {
  authenticate: async ({ commit }) => {
    let response;
    try {
      response = await authAxios.get(`/api/accounts/authenticate`);
    } catch (err) {
      console.log("@store err:", err);
      return err;
    }
    if (response && response.data && response.data.success) {
      commit("updateAuthenticationStatus", true);
      commit("updateVerificationStatus", response.data.user.isVerified);
      commit("updateUser", response.data.user);
      commit("ready");
    } else {
      commit("updateAuthenticationStatus", false);
      commit("updateVerificationStatus", false);
      commit("updateUser", null);
      commit("ready");
    }
    return true;
  },
  addReadyContainer(state, containerObject) {
    state.commit("addReadyContainer", containerObject);
  },

  removeFinalizedContainer(state, containerObjectId) {
    state.commit("removeFinalizedContainer", containerObjectId);
  },

  setStreamOnHold(state, streamObject) {
    state.commit("setStreamOnHold", streamObject);
  },

  removeStreamOnHold(state, streamObjectId) {
    state.commit("removeStreamOnHold", streamObjectId);
  },
};

const store = new Vuex.Store({
  // To ensure we get errors in dev (for better debugging) but not in production
  strict: process.env.NODE_ENV !== "production",

  state: state,

  mutations: mutations,

  actions: actions,
});

export default store;
