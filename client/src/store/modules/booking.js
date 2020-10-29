// import { isEqual, parseISO } from "date-fns";

const getDefaultState = () => {
  return {
    bookingData: {
      selectedPerson: null,
      specificUserPreferenceId: null,
      dateTime: null,
    },
    selectedToBook: [],
    isCancelingSlots: [],
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

  setIsCanceling(state, slotData) {
    state.isCancelingSlots.push(slotData);
  },

  exitIsCanceling(state, slotData) {
    let index = state.isCancelingSlots.findIndex(
      (slot) => slot.dateTime.valueOf() === slotData.dateTime.valueOf()
    );

    state.isCancelingSlots.splice(index, 1);
  },

  clearAllCanceling(state) {
    state.isCancelingSlots = [];
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

  setIsCanceling(state, slotData) {
    state.commit("setIsCanceling", slotData);
  },

  exitIsCanceling(state, slotData) {
    state.commit("exitIsCanceling", slotData);
  },

  clearAllSelections(state) {
    state.commit("clearAllSelections");
  },

  clearAllCanceling(state) {
    state.commit("clearAllCanceling");
  },
};

const booking = {
  namespaced: true,

  state,
  mutations,
  actions,
};

export default booking;
