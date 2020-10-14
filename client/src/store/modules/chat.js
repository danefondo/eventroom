const getDefaultState = () => {
  return {
    messagesInThread: [],
    localChatUser: "",
    userJoinSuccessful: undefined,
    messageSending: false,
    userCurrentChatTextBackup: "",
    messageSendFailure: false,
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

  userJoinSucessful(state, boolean) {
    state.userJoinSuccessful = boolean;
  },

  messageSending(state, boolean) {
    state.messageSending = boolean;
  },

  messageFailure(state, boolean) {
    state.messageSendFailure = boolean;
  },

  updateBackupChatText(state, text) {
    state.userCurrentChatTextBackup = text;
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

  userJoinSucessful(state, boolean) {
    state.commit("userJoinSucessful", boolean);
  },

  messageSending(state, boolean) {
    state.commit("messageSending", boolean);
  },

  messageFailure(state, boolean) {
    state.commit("messageFailure", boolean);
  },

  updateBackupChatText(state, text) {
    state.commit("updateBackupChatText", text);
  },
};

const chat = {
  namespaced: true,

  state,
  mutations,
  actions,
};

export default chat;
