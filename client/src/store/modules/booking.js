// import { isEqual, parseISO } from "date-fns";

const getDefaultState = () => {
  return {
    bookingData: {
      selectedPerson: null,
      specificUserPreferenceId: null,
      dateTime: null,
    },
    selectedToBook: [],
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

  selectSlot(state, slotData) {
    state.selectedToBook.push(slotData);
  },

  cancelSlot(state, slotData) {
    let index = state.selectedToBook.findIndex(
      (slot) => slot.dateTime.valueOf() === slotData.dateTime.valueOf()
    );

    state.selectedToBook.splice(index, 1);
  },

  clearAllSelections(state) {
    state.selectedToBook = [];
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

  selectSlot(state, slotData) {
    state.commit("selectSlot", slotData);
  },

  cancelSlot(state, slotData) {
    state.commit("cancelSlot", slotData);
  },

  clearAllSelections(state) {
    state.commit("clearAllSelections");
  },
};

const booking = {
  namespaced: true,

  state,
  mutations,
  actions,
};

export default booking;
