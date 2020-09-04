const state = {
  containersReady: [],

  streamsWaitingForContainer: [],
};

const getters = {
  
};

const mutations = {
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

const session = {
  namespaced: true,
  
  state,
  getters,
  mutations,
  actions
};

export default session;