const getDefaultState = () => {
  return {
    preferenceSettingsOpen: false,

    /* GENERAL PREFERENCES */
    // directMatchRequests: false,
    // disableRematching: false,

    /* CALENDAR PREFERENCES */
    // disableRealTimeUpdates: false,
    // enable24HourFormat: false,

    /* MATCHING PREFERENCES */
    // workType: 0,
    // microphone: 0,
    // screenshare: 0,
    // preferSimilarActivity: false,
    // preferPeopleFromLists: false,
    // preferPeopleFromGroups: false,
    //  preferLongerSessions: false,
    //  preferShorterSessions: false,
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

  togglePreferences(state) {
    state.preferenceSettingsOpen = !state.preferenceSettingsOpen;
  },

  toggleState(state, field) {
      state[field] = !state[field];
  }

};

// Asynchronous
const actions = {
  resetState(state) {
    state.commit("resetState");
  },

  togglePreferences(state) {
    state.commit("togglePreferences");
  },

  toggleState(state, field) {
    state.commit("toggleState", field);
  },
};

const cofocusPreferences = {
  namespaced: true,

  state,
  mutations,
  actions,
};

export default cofocusPreferences;
