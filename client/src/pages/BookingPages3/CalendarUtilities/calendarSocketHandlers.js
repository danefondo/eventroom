import io from 'socket.io-client';

import StoreMatchController from "../../../store/calendar/controllers/storeMatchController";
import { BASE_PATH } from "../../../constants";

const CALENDAR_MATCH_NAMESPACE = BASE_PATH+"/calendar";

let socket = null;
let reinitialize = false; 


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
        // tbf not sure if ever reaches here
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
    StoreMatchController.handleNewMatch(matchData);
  });

  socket.on("REMOVED_FROM_POOL", (data) => {
    console.log("@CALENDAR SOCKET removedfrompool:", data);
    StoreMatchController.handleRemovedFromPool(data.dateTime, data.removedFromPool);
  });

  socket.on("CANCELLED_MATCH", cancelData => {
    console.log("@CALENDAR SOCKET cancelled match:", cancelData);
    StoreMatchController.handleCancelledMatch(cancelData.dateTime, cancelData.cancelledMatch);
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