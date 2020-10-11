const getDefaultState = () => {
  return {
    participantsData: [],
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
  addParticipant(state, participant) {
    state.participantsData.push(participant);
  },
};

// Asynchronous
const actions = {
  resetState(state) {
    state.commit("resetState");
  },
  addParticipant(state, participant) {
    state.commit("addParticipant", participant);
  },
};

const participants = {
  namespaced: true,

  state,
  mutations,
  actions,
};

export default participants;
