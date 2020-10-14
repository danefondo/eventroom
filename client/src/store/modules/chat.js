const getDefaultState = () => {
  return {
    messagesInThread: [],
    localChatUser: "",
  };
};

const state = getDefaultState();

// Synchronous
const mutations = {
  resetState(state) {
    // Merge rather than replace so we don't lose observers
    // https://github.com/vuejs/vuex/issues/1118
    Object.assign(state, getDefaultState());
  },

  addMessage(state, message) {
    state.messagesInThread.push(message);
  },

  setLocalChatUser(state, userData) {
    state.localChatUser = userData;
  },
};

// Asynchronous
const actions = {
  resetState(state) {
    state.commit("resetState");
  },

  addMessage(state, message) {
    state.commit("addMessage", message);
  },

  setLocalChatUser(state, userData) {
    state.commit("setLocalChatUser", userData);
  },
};

const chat = {
  namespaced: true,

  state,
  mutations,
  actions,
};

export default chat;
