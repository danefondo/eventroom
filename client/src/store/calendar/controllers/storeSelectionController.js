import store from "../../index";
import { SLOT_INTERVAL_MS } from "../constants";

const StoreSelectionController = {
  setCurrentlyBooking(newState) {
    store.dispatch("selections/setCurrentlyBooking", newState);
  },
  /**
   * Used in UnmatchedPerson, SlotHoverEmpty. Selects previously unselected slot
   * @param {Number/String} dateTimeMS 
   */
  selectUnselectedSlot(dateTimeMS) {
    /* Adding data to Vuex */
    store.dispatch("selections/selectSlot", dateTimeMS);
    store.dispatch("calendar/setOneSlotFieldStatus", {
      dateTimeMS,
      field: "isSelected",
      value: true
    });

    /* Updating selecting availability */
    let dateTimeMSArray = [];
    for (let i=-3; i<=3; i++) {
      dateTimeMSArray.push(dateTimeMS + i*SLOT_INTERVAL_MS);
    } 
    store.dispatch("calendar/setSlotArrayFieldStatus", {
      dateTimeMSArray,
      field: "isAvailableForSelecting",
      value: false
    });
  },

  /**
   * Used in UserSession and CancelSession. Sets one slots as isCanceling
   * @param {Number/String} dateTimeMS 
   * @param {Boolean} value -- value to set to
   */
  setIsCanceling(dateTimeMS, value) {
    store.dispatch("calendar/setOneSlotFieldStatus", {
      dateTimeMS,
      field: "isCanceling", 
      value
    });
  },

  /**
   * Called after a slot at dateTimeMS was no longer selected
   * @param {Number/String} dateTimeMS 
   */
  async cancelSelection(dateTimeMS) {
    /* set slot as unselected */
    store.dispatch("calendar/setOneSlotFieldStatus", {
      dateTimeMS,
      field: "isSelected", 
      value: false
    });
    /* removing from selectedToBook array, returns the datetime selected before and datetime selected after */
    const {previous, next} = await store.dispatch("selections/cancelSlot", dateTimeMS);
    /* updating selecting availability */
    let dateTimeMSArray = [];
    for (let i=-3; i<=3; i++) {
      const value = dateTimeMS + i*SLOT_INTERVAL_MS;
      if (previous && value <= previous + 3*SLOT_INTERVAL_MS) continue;
      if (next && value >= next - 3*SLOT_INTERVAL_MS) continue;
      dateTimeMSArray.push(value);
    }
    store.dispatch("calendar/setSlotArrayFieldStatus", {
      dateTimeMSArray,
      field: "isAvailableForSelecting",
      value: true
    });
  },

  
  
}

export default StoreSelectionController;