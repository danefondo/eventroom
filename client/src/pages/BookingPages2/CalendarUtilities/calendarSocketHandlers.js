import io from 'socket.io-client';
import store from "../../../store/index";

import { BASE_PATH } from "../../../constants";

const CALENDAR_MATCH_NAMESPACE = BASE_PATH+"/calendar";

let currentUserID = store.getters["auth/getUserID"];
let socket = null;
let reinitialize = false; 

function updateUserID() {
  currentUserID = store.getters["auth/getUserID"];
}
/**
 * Removes all listeners, called when disconnected
 */
const destroyEvents = function() {
  if (socket) {
    console.log("@CALENDAR SOCKET destroying events!");
    socket.off("disconnect");
    socket.off("NEW_BOOKINGS");
    socket.off("BOOKINGS_CANCELLED");
    socket.off("MATCH");
    reinitialize = true;
  }
}

/**
 * If socket is not yet created, creates the socket.
 * Adds all event listeners.
 */
export const initializeSocket = async function() {
  console.log("@CALENDAR SOCKET INITIALIZING SOCKET! ", reinitialize);

  if (!socket) {
    
    /* If socket has not been created, create the socket */
    console.log("@CALENDAR SOCKET creating socket and connect event handler")
    socket = io(CALENDAR_MATCH_NAMESPACE);

    socket.on("connect", () => {
      console.log("@CALENDAR SOCKET matching socket connected");
      if (reinitialize) {
        console.log("@CALENDAR SOCKET socket reinitialized");
        /* Socket was disconnected and now reconnected, so add all listeners again */ 
        initializeSocket();
        reinitialize = false;
      }
    });
  } else {
    if (!socket.connected) {
      console.log("@CALENDAR SOCKET socket was not connected, opened manually")
      socket.open();
    }
  }
  /* add all listeners */

  socket.on("disconnect", (reason) => {
    console.log("@CALENDAR SOCKET matching socket disconnected, reason:", reason);
    destroyEvents();
  });

  /**
   * Is registered, when a pair of users gets matched
   */
  socket.on("NEW_MATCH", (matchData) => {
    console.log("@CALENDAR SOCKET RECEIVED MATCH", matchData);  
    handleNewMatch(matchData);
  });

  socket.on("REMOVED_FROM_POOL", (data) => {
    console.log("@CALENDAR SOCKET removedfrompool:", data);
    handleRemovedFromPool(data.dateTime, data.removedFromPool);
  });

  socket.on("CANCELLED_MATCH", cancelData => {
    console.log("@CALENDAR SOCKET cancelled match:", cancelData);
    handleCancelledMatch(cancelData.dateTime, cancelData.cancelledMatch);
  }); 

  return true;
}

/**
 * Called when left the page
 */
export const closeSocket = function() {
  if (socket) {
    socket.close();
  }
}

export const bookOneSlot = async function(sendData) {
  if (!socket || !socket.connected) {
    initializeSocket();
  }

  return new Promise((resolve) => {
    socket.emit("BOOK_ONE_SLOT", sendData, function(result) {
      console.log("@bookoneslot callback: result: ", result);
      resolve(result.success);
    });
  });
}

export const cancelOneSlot = async function(sendData) {
  if (!socket || !socket.connected) {
    initializeSocket();
  }

  return new Promise((resolve) => {
    socket.emit("CANCEL_ONE_SLOT", sendData, function(result) {
      console.log("@canceloneslot callback: result: ", result);
      resolve(result.success);
    });
  });
}




export const bookManySlots = async function(sendData) {
  if (!socket || !socket.connected) {
    initializeSocket();
  }

  return new Promise((resolve) => {
    // TODO access vuex and get the best matches as default matches and emit REQUEST_MATCHES
    socket.emit("BOOK_SLOTS", sendData, function(result) {
      resolve(result.success);
    })
  })
}


export const printRedis = async function() {
  if (!socket || !socket.connected) {
    initializeSocket();
  }
  socket.emit("PRINT_REDIS");
}



function userIsInArray(array) {
  if (!array) return -1;
  if (!currentUserID) updateUserID();
  if (array[0] && array[0].metadata && array[0].metadata.ID && array[0].metadata.ID === currentUserID) return 0;
  if (array[1] && array[1].metadata && array[1].metadata.ID && array[1].metadata.ID === currentUserID) return 1;
  return -1;
}
function getIDsInArray(array) {
  if (!array) return [];
  let IDs = [];
  if (array[0] && array[0].metadata && array[0].metadata.ID) IDs.push(0);
  if (array[1] && array[1].metadata && array[1].metadata.ID) IDs.push(1);
  return IDs; 
}

/**
 * If user is partner, add to user matches
 * Otherwise just add both partners to matchpool
 * @param {
 *  dateTime -- in ms
 *  createdMatch: [USER_SCHEMA, USER_SCHEMA]
 * } matchData -- matched User's data 
 */
async function handleNewMatch(matchData) {
  const {dateTime, createdMatch} = matchData;
  let userIdx = userIsInArray(createdMatch);
  console.log("@handleNewMatch currentUserID and userIDx: ", currentUserID, userIdx);
  if (userIdx != -1) {
    let newPartner = createdMatch[1-userIdx];
    if (!newPartner) newPartner = null; 
    console.log("@handlewNewMatch setting new match at ", new Date(dateTime), "to ", newPartner);
    store.dispatch("calendar/setMatchForDatetime", {
      user: newPartner,
      dateTime
    });
  } else {
    /* else add the matched people to calendarData */
    const IDs = getIDsInArray(createdMatch);
    console.log("@handleNewMatch IDs: ", IDs);
    for (let i=0; i<IDs.length; i++) {
      store.dispatch("calendar/addOneMatchPoolUser", {
        user: createdMatch[IDs[i]],
        dateTime
      });
    }
  }
}

/**
 * removes user from calendarData at dateTime if it exists 
 * @param {Number/String} dateTime -- in ms
 * @param {String} removedUserID -- removedUser ID 
 */
async function handleRemovedFromPool(dateTime, removedUserID) {
  store.dispatch("calendar/removeOneMatchPoolUserFromSlot", {
    dateTime,
    ID: removedUserID
  });
}

/**
 * @param {Number/String} dateTime -- in ms 
 * @param {Array} cancelledMatch -- [USER_SCHEMA, USER_SCHEMA] cancelled match
 */
async function handleCancelledMatch(dateTime, cancelledMatch) {
  let userIdx = userIsInArray(cancelledMatch);
  if (userIdx != -1) {
    const partner = cancelledMatch[1-userIdx];
    const currentMatch = store.getters["calendar/getMatchedUserForDateTime"](dateTime);
    if (currentMatch && currentMatch.metadata && partner.metadata && partner.metadata.ID == currentMatch.metadata.ID) {
      store.dispatch("calendar/removeMatchFromDateTime", dateTime);
    } else if (currentMatch === null && !partner) {
      store.dispatch("calendar/removeMatchFromDateTime", dateTime);
    }
  } 
  /* 
    Otherwise DO NOT add them to match pool, it is handled elsewhere, if needed. 
    Backend sends unmatched people as a new created match so information *will* reach front end atm   
  */
} 