import api from "../../api/cofocusAPI";
import StoreSelectionController from "./storeSelectionController";
import {userIsInArray, getIDsInArray} from "../utilities/socketHandlerUtilities";

import { SLOT_INTERVAL_MS } from "../constants";


const StoreMatchController = {
  /* ======== INITIAL LOADING ======== */

  /**
   * Loads data from database and sets it to Vuex
   * @param {Number/String} startDateMS -- start date (rounded down to nearest slot, inclusive)
   * @param {Number/String} endDateMS -- end date (rounded up to nearest slot, exclusive)
   */
  async loadDataFromDatabase(startDateMS, endDateMS) {
    let response;
    try {
      response = await api.REQUEST( {
        method: "get",
        url: "/api/booking/getUpcomingBookedSessionRange",
        withCredentials: true,
        params: {
          start: startDateMS, 
          end: endDateMS
        }
      });
    } catch (error) {
      console.log("@loadDataFromDatabase error: ", error);
    }
    let result = upcomingResponse.data;
    if (!result || !result.success)
      throw new Error("Failed to fetch general sessions.");

    store.dispatch("matches/addAllMatches", {matched: result.matched, unmatched: result.unmatched});
    store.dispatch("calendar/addAllMatchablePeople", result.allMatchablePeople);
  },

  /* ======== REAL TIME UPDATES ======== */
  /**
   * If user is partner, add to user matches
   * Otherwise just add both partners to matchpool
   * @param {
   *  dateTime -- in ms
   *  createdMatch: [USER_SCHEMA, USER_SCHEMA]
   * } matchData -- matched User's data 
   */
  async handleNewMatch(matchData) {
    const {dateTime, createdMatch} = matchData;
    let userIdx = userIsInArray(createdMatch);
    console.log("@handleNewMatch currentUserID and userIDx: ", currentUserID, userIdx);
    if (userIdx != -1) {
      let newPartner = createdMatch[1-userIdx];
      if (!newPartner) newPartner = null; 
      console.log("@handlewNewMatch setting new match at ", new Date(dateTime), "to ", newPartner);
      store.dispatch("matches/setMatchForDatetime", {
        dateTimeMS: dateTime,
        matchedUserData: newPartner
      });
    } else {
      /* else add the matched people to calendarData */
      const IDs = getIDsInArray(createdMatch);
      console.log("@handleNewMatch IDs: ", IDs);
      for (let i=0; i<IDs.length; i++) {
        store.dispatch("calendar/addOneMatchPoolUser", {
          dateTimeMS: dateTime, 
          userData: createdMatch[IDs[i]],
        });
      }
    }
  },
  /**
   * removes user from calendarData at dateTime if it exists 
   * @param {Number/String} dateTime -- in ms
   * @param {String} removedUserID -- removedUser ID 
   */
  async handleRemovedFromPool(dateTimeMS, removedUserID) {
    store.dispatch("calendar/removeOneMatchPoolUserFromSlot", {
      dateTimeMS,
      removedUserID
    });
  },

  /**
   * @param {Number/String} dateTime -- in ms 
   * @param {Array} cancelledMatch -- [USER_SCHEMA, USER_SCHEMA] cancelled match
   */
  async handleCancelledMatch(dateTime, cancelledMatch) {
    let userIdx = userIsInArray(cancelledMatch);
    if (userIdx != -1) {
      const partner = cancelledMatch[1-userIdx];
      const currentMatch = store.getters["matches/getMatchedUserForDateTime"](dateTime);
      if (currentMatch && currentMatch.metadata && partner.metadata && partner.metadata.ID == currentMatch.metadata.ID) {
        store.dispatch("matches/removeMatchFromDateTime", dateTime);
      } else if (currentMatch === null && !partner) {
        store.dispatch("matches/removeMatchFromDateTime", dateTime);
      }
    } 
    /* 
      Otherwise DO NOT add them to match pool, it is handled elsewhere, if needed. 
      Backend sends unmatched people as a new created match so information *will* reach front end atm   
    */
  }, 

  /* ======== USER ACTIONS ======== */
  /**
   * Called in BookSession after booking was successful and new match was created in database.
   * @param {
   *  dateTimeMS -- match datetime
   *  matchedUserData {USER_SCHEMA}
   * } bookingData 
   */
  async handleSuccessfulBooking(bookingData) {
    const dateTimeMS = bookingData.dateTime;
    const matchedUserData = bookingData.matchedUserData;
    /* setting the new match to vuex */
    store.dispatch("matches/setMatchForDatetime", {
      dateTimeMS,
      matchedUserData
    });
    StoreSelectionController.setCurrentlyBooking(false);
    
    /* updating booking availability */
    let dateTimeArray = [];
    for (let i=-3; i<=3; i++) {
      dateTimeArray.push(dateTimeMS + i*SLOT_INTERVAL_MS);
    } 
    store.dispatch("calendar/setSlotArrayFieldStatus", {
      dateTimeMSArray,
      field: "isAvailableForBooking",
      value: false
    });

    StoreSelectionController.cancelSelection(dateTimeMS);
  },

  /**
   * Called in CancelSession after canceling a booking was successful 
   * and the person was removed from match pool or match was removed (if was not in the pool).
   * @param {Number/String} dateTimeMS -- datetime when the match was 
    */
  async handleSuccessfulCancel(dateTimeMS) {
    /* remove match, then update booking availability */
    store.dispatch("calendar/removeMatchFromDateTime", dateTimeMS).then(result => {
      const {previous, next} = result;
      let dateTimeMSArray = [];
      for (let i=-3; i<=3; i++) {
        const value = dateTimeMS + i*SLOT_INTERVAL_MS;
        if (previous && value <= previous + 3*SLOT_INTERVAL_MS) continue;
        if (next && value >= next - 3*SLOT_INTERVAL_MS) continue;
        dateTimeMSArray.push(value);
      }
      store.dispatch("calendar/setSlotArrayFieldStatus", {
        dateTimeMSArray,
        field: "isAvailableForBooking",
        value: true
      });
    });
    StoreSelectionController.setIsCanceling(dateTimeMS, false);
  }

}

export default StoreMatchController;