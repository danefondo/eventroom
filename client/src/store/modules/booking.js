import { setYear, setMonth, setDate, setHours, setMinutes } from "date-fns";

const getDefaultState = () => {
  return {
    bookingData: {
      selectedPerson: null,
      specificUserPreferenceId: null,
      dateTime: null,
    },

    isCancelingSlots: [],

    selectedSlotName: "",
    selectedSlotStartTime: null,
    selectedSlotDateString: null,

    selectedSlotDateTime: null,

    selectedInterval: 50,

    currentlyBooking: false,

    closedBookSome: false,
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

  setBookerData(state, slot) {
    state.selectedSlotDateTime = new Date(slot.dateTime);
    state.selectedSlotStartTime = slot.slotStartTime;

    const dateString = `${slot.yearNum}-${slot.monthNum}-${slot.dateNum}`;
    state.selectedSlotDateString = dateString;
  },

  setSelectedSlotName(state, value) {
    state.selectedSlotName = value;
  },

  setSelectedSlotDateString(state, value) {
    state.selectedSlotDateString = value;

    let splitValue = value.split("-");
    console.log("splitValue", splitValue);
    state.selectedSlotDateTime = setYear(state.selectedSlotDateTime, splitValue[0]);
    state.selectedSlotDateTime = setMonth(state.selectedSlotDateTime, splitValue[1] -1);
    state.selectedSlotDateTime = setDate(state.selectedSlotDateTime, splitValue[2]);
  },

  setSelectedSlotStartTime(state, value) {
    state.selectedSlotStartTime = value;
    let splitValue = value.split(":");
    console.log("splitValue", splitValue);
    state.selectedSlotDateTime = setHours(state.selectedSlotDateTime, splitValue[0]);
    state.selectedSlotDateTime = setMinutes(state.selectedSlotDateTime, splitValue[1]);
  },

  setCurrentlyBooking(state, newState) {
    state.currentlyBooking = newState;
  },

  setClosedBookSome(state) {
    state.closedBookSome = true;
  }
};

// Asynchronous
const actions = {
  resetState(state) {
    state.commit("resetState");
  },

  updateBookingData(state, bookingData) {
    state.commit("updateBookingData", bookingData);
  },

  setIsCanceling(state, slotData) {
    state.commit("setIsCanceling", slotData);
  },

  exitIsCanceling(state, slotData) {
    state.commit("exitIsCanceling", slotData);
  },

  clearAllCanceling(state) {
    state.commit("clearAllCanceling");
  },

  setBookerData(state, slot) {
    state.commit("setBookerData", slot);
  },

  setSelectedSlotName(state, value) {
    state.commit("setSelectedSlotName", value);
  },

  setSelectedSlotDateString(state, value) {
    state.commit("setSelectedSlotDateString", value);
  },

  setSelectedSlotStartTime(state, value) {
    state.commit("setSelectedSlotStartTime", value);
  },

  setCurrentlyBooking(state, newState) {
    state.commit("setCurrentlyBooking", newState);
  },

  setClosedBookSome(state) {
    state.commit("setClosedBookSome");
  },
};

const booking = {
  namespaced: true,

  state,
  mutations,
  actions,
};

export default booking;
