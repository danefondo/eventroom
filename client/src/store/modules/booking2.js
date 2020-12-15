// import { setYear, setMonth, setDate, setHours, setMinutes } from "date-fns";

const getDefaultState = () => {
  return {

    isCancelingSlots: [],

    selectedSlotName: "",

    currentlyBooking: false,

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


  setIsCanceling(state, slotDateTime) {
    state.isCancelingSlots.push(slotDateTime);
  },

  exitIsCanceling(state, cancelledSlotDateTime) {
    let index = state.isCancelingSlots.findIndex(
      (slotDateTime) => slotDateTime.valueOf() === cancelledSlotDateTime.valueOf()
    );

    state.isCancelingSlots.splice(index, 1);
  },

  clearAllCanceling(state) {
    state.isCancelingSlots = [];
  },

  setBookerData(state, slotDateTime) { // eslint-disable-line no-unused-vars

    // 
  },

  setCurrentlyBooking(state, newState) {
    state.currentlyBooking = newState;
  },

  /* ====== SLOT SELECTION STATE CHANGING  ====== */
  /**
   * @param {Date} slotDateTime -- slot datetime
   */
  selectSlot(state, slotDateTime) {
    console.log("@booking/selectslot: ", slotDateTime, state.selectedToBook);
    state.selectedToBook.push(slotDateTime);
  },

  cancelSlot(state, cancelledSlotDatetime) {
    let index = state.selectedToBook.findIndex(
      (slotDateTime) => slotDateTime.valueOf() === cancelledSlotDatetime.valueOf()
    );

    state.selectedToBook.splice(index, 1);
  },

  /* Clears all selections */
  clearAllSelections(state) {
    state.selectedToBook = [];
  },

  /* Removes all selections in the past */
  removeSelectionsInThePast(state) {
    for (var i = state.selectedToBook.length - 1; i > -1; i--) {
      let slotDateTime = state.selectedToBook[i];
      if (Date.now() > slotDateTime) {
        state.selectedToBook.splice(i, 1);
      }
    }
  },
};

// Asynchronous
const actions = {
  // done
  resetState(state) {
    state.commit("resetState");
  },
  // done
  setIsCanceling(state, slotDateTime) {
    state.commit("setIsCanceling", slotDateTime);
  },
  // done
  exitIsCanceling(state, slotDateTime) {
    state.commit("exitIsCanceling", slotDateTime);
  },
  // done
  clearAllCanceling(state) {
    state.commit("clearAllCanceling");
  },

  setBookerData(state, slot) {
    state.commit("setBookerData", slot);
  },

  setCurrentlyBooking(state, newState) {
    state.commit("setCurrentlyBooking", newState);
  },
  // done
  removeSelectionsInThePast(state) {
    state.commit("removeSelectionsInThePast");
  },
  // done
  selectSlot(state, slotDateTime) {
    state.commit("selectSlot", slotDateTime);
  },
  // done
  cancelSlot(state, slotDateTime) {
    state.commit("cancelSlot", slotDateTime);
  },
  // done
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
