const state = {
  apiKey: "",
  room: {},
  sessionId: "",
  sessionToken: "",

  userIsHost: false,

  // Old
  containersReady: [],

  streamsWaitingForContainer: [],
};

const getters = {
  
};

const mutations = {
  setApiKey(state, newApiKey) {
    state.apiKey = newApiKey;
  },
  setRoom(state, newRoom) {
    state.room = newRoom;
  },
  setSessionId(state, newSessionId) {
    state.sessionId = newSessionId;
  },
  setSessionToken(state, newSessionToken) {
    state.sessionToken = newSessionToken;
  },
  setUserIsHost(state, isHost) {
    state.userIsHost = isHost;
  },


  // OLD
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
  setInitialData({ state, commit, rootState }, obj) {
    console.log("@setinit obj", obj);
    commit("setApiKey", obj.apiKey);
    commit("setRoom", obj.room);
    commit("setSessionId", obj.sessionId);
    commit("setSessionToken", obj.sessionToken);
    console.log("@setinit id-s", obj.room.hostId, rootState.auth._id);
    if (obj.room.hostId == rootState.auth.user._id) {
      commit("setUserIsHost", true);
    }
    console.log("@setinit state", state);
  },



  /// OLD
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