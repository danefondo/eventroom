const state = {
  tempUser: {},
};

// Synchronous
const mutations = {
  addNewTempUser(state, tempUser) {
    state.tempUser = tempUser;
  },

  destroyTempUser(state) {
    state.tempUser = {};
  },
};

// Asynchronous
const actions = {
  addNewTempUser(state, tempUser) {
    state.commit("addNewTempUser", tempUser);
  },

  destroyTempUser(state) {
    state.commit("destroyTempUser");
  },
};

const tempuser = {
  namespaced: true,

  state,
  mutations,
  actions,
};

export default tempuser;
