import io from 'socket.io-client';

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

  socket.on("MATCH", (matchData) => {
    console.log("@CALENDAR SOCKET RECEIVED MATCH", matchData);  // TODO
  });

  socket.on("NEW_BOOKINGS", (userData) => {
    console.log("@CALENDAR SOCKET RECEIVED NEW_BOOKINGS", userData)
  });

  socket.on("BOOKINGS_CANCELLED", (cancelledData) => {
    console.log("@CALENDAR SOCKET RECEIVED BOOKINGS_CANCELLED: ", cancelledData);
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