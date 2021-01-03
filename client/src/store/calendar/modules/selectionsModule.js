const state = {
  currentlyBooking: false,

  /* Guaranteed to be sorted from nearest to furthest. Array of dateTimeMS of selected slots */
  selectedToBook: [],
};

const mutations = {

  SET_CURRENTLY_BOOKING(state, newState) {
    state.currentlyBooking = newState;
  },
  
  SET_ALL_SELECTIONS(state, newSelections) {
    state.selectedToBook = newSelections;
  },
  /* Clears all selections */
  CLEAR_ALL_SELECTIONS(state) {
    state.selectedToBook = [];
  },

  /**
   * Adds to the selectedToBook array such that the array remains sorted
   * @param {Number/String} slotDateTimeMS -- slot datetime in MS
   */
  SELECT_SLOT_TO_BOOK(state, slotDateTimeMS) {
    slotDateTimeMS = Number(slotDateTimeMS);
    console.log("@booking/selectslot: ", slotDateTimeMS, state.selectedToBook);
    let array = state.selectedToBook;
    let right = array.length;
    let left = 0;
    let idx;
    // binary search
    while (left < right) {
      idx = Math.floor((right+left)/2);
      if (array[idx] < slotDateTimeMS) {
        left = idx+1;
      } else {
        right = idx;
      }
    }
    console.log("here2,left: ", left);
    state.selectedToBook.splice(left, 0, slotDateTimeMS);
  },

  /**
   * Removes one datetime from selected array
   * @param {Number} index -- index where the canceled datetime was 
   */
  CANCEL_SLOT_TO_BOOK(state, index) {
    state.selectedToBook.splice(index, 1);
  },

  
  
};

const actions = {
  setCurrentlyBooking(state, newState) {
    state.commit("SET_CURRENTLY_BOOKING", newState);
  },
  /* Removes all selections in the past */
  selectSlot(state, slotDateTimeMS) {
    state.commit("SELECT_SLOT_TO_BOOK", slotDateTimeMS);
  },
  /**
   * @return {Object} with two keys: previous and next. Values are dateTimeMS-s for 
   * slots that were also selected and were one before and one after the cancelled slot 
   */
  cancelSlot(state, cancelledSlotDatetimeMS) {
    const index = state.selectedToBook.findIndex(
      (slotDateTimeMS) => slotDateTimeMS === cancelledSlotDatetimeMS
    );
    let returnObject = {
      previous: index !== 0 ? state.selectedToBook[index-1] : null,
      next: index+1 !== state.selectedToBook.length ? state.selectedToBook[index+1] : null
    };
    state.commit("CANCEL_SLOT_TO_BOOK", index);
    
    return returnObject;
  },
  clearAllSelections(state) {
    state.commit("CLEAR_ALL_SELECTIONS");
  },

};

const booking = {
  namespaced: true,

  state,
  mutations,
  actions,
};

export default booking;
