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

    let participants = state.participantsData;
    console.log("partiCIPANTS", participants);
    console.log("partiPANT", participant);
    if (participants.some(p => p.userId === participant.userId)) {
      console.log("Participant already in list");
    } else {
      state.participantsData.push(participant);
    }

    if (participants.some(p => p._id === participant._id)) {
      console.log("Participant already in list");
    } else {
      state.participantsData.push(participant);
    }
  },

  removeParticipant(state, participant) {
    let participants = state.participantsData;
    let arrayIndex = participants.findIndex((p) => p.userId === participant.identity);
    participants.splice(arrayIndex, 1);
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

  removeParticipant(state, participant) {
    state.commit("removeParticipant", participant);
  },
};

const participants = {
  namespaced: true,

  state,
  mutations,
  actions,
};

export default participants;
