const getDefaultState = () => {
  return {
    bookingData: {
        queryDate: null,
        startTime: null,
        endTime: null,
        date: null,
        month: null,
        year: null,
        selectedPerson: null,
        specificUserPreferenceId: null,
        rawDateTime: null,
    },
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

  updateBookingData(state, bookingData) {
    for (var key in bookingData) {
      state.bookingData[key] = bookingData[key];
    }
  },
};

// Asynchronous
const actions = {
  resetState(state) {
    state.commit("resetState");
  },

  updateBookingData(state, bookingData) {
    state.commit("updateBookingData", bookingData);
  },
};

const booking = {
  namespaced: true,

  state,
  mutations,
  actions,
};

export default booking;
