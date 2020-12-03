/**
 * Methods:
 * initializeSocket() -- has to be called *just once*
 */
import io from 'socket.io-client';

import { BASE_PATH } from "../constants";

const CALENDAR_MATCH_NAMESPACE = BASE_PATH+"/calendar_match";
let socket = null;

const initializeSocket = async function() {
  if (socket) {
    socket.removeAllListeners("MATCH"); // safety probs
    if (!socket.connected) {
      socket.open();
    }
  }

  socket = io(CALENDAR_MATCH_NAMESPACE);

  socket.on("connect", () => {
    console.log("matching socket connected");
  });

  socket.on("disconnect", () => {
    console.log("matching socket disconnected");
  });

  socket.on("MATCH", (matchData) => {
    console.log("match found!");  // TODO
  });

  socket.on("NEW_BOOKING_SLOT", (userData) => {
    console.log("process new data -- compare against preferences etc, then put to vuex")
  })
  return true; 
}

/**
 * 
 * @param { Object. Fields:
 *  ID -- userId 
 *  preferences -- preferences Object
 *  data -- user data Object to compare against another user's preferences object 
 * } userData -- data to pass in the event 
 * @param {Date} sessionTimeData -- session time in whatever format works the best 
 */
const bookSession = async function(userData, sessionTimeData) {
  if (!socket) {
    throw new Error("No socket. Please initialize socket before use") // TODO
  }

  socket.emit("BOOK_SESSION", userData); // TODO add callbacks and checks
}

const cancelSession = async function (userData, sessionTimeData) {
  if (!socket) {
    throw new Error("No socket. Please initialize socket before use") // TODO
  }

  socket.emit("CANCEL_SESSION", userData);
}