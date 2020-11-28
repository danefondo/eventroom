import authAPI from "../../api/auth";

const state = {
  ready: false,

  user: null,

  authenticationStatus: false,

  // This userId can be both an anonymous user's id and an actual user's id
  userId: "",
};

const getters = {};

const mutations = {
  ready(state, isReady) {
    state.ready = isReady;
  },
  updateAuthenticationStatus(state, newStatus) {
    state.authenticationStatus = newStatus;
  },
  updateUser(state, newUser) {
    state.user = newUser;
    state.userId = newUser ? newUser._id : "";
  },
  updateUserId(state, userId) {
    state.userId = userId;
  },
  updateAll(state, data) {
    state.authenticationStatus = data.authenticationStatus;
    state.user = data.user;
    state.userId = data.userId;
    state.ready = true;
  }
};

const actions = {
  authenticate: async ({ commit }) => {
    const response = await authAPI.authenticate();
    if (response && response.data && response.data.success) {
      commit("updateAuthenticationStatus", true);
      commit("updateUser", response.data.user);
      commit("ready", true);
    } else {
      commit("updateAuthenticationStatus", false);
      commit("updateUser", null);
      commit("ready", true);
    }

    return true;
  },
};

const auth = {
  namespaced: true,

  state,
  getters,
  mutations,
  actions,
};

export default auth;
