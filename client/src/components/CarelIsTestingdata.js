import io from 'socket.io-client';

import { BASE_PATH } from "../constants";

let socket = null;
const CALENDAR_NAMESPACE = BASE_PATH + "/calendar";

export const initializeSocket = function () {
  console.log("Initializing socket...");
  console.log(socket);
  if (socket) {
    socket = null;
  }

  socket = io(CALENDAR_NAMESPACE);

  socket.on("connect", () => {
    console.log("matching socket connected");
  });
  
  socket.on("MATCH", (data) => {
    console.log("received MATCH: ", data);
  });

  socket.on("BOOKINGS_CANCELLED", (data) => {
    console.log("received BOOKINGS_CANCELLED: ", data);
  });

  socket.on("NEW_BOOKINGS", (data) => {
    console.log("received NEW_BOOKINGS: ", data);
  });
  console.log("initialized socket: ", socket);
  return true; 
}

export const bookslots = function (data) {
  console.log("@bookslots: socket: ", socket);
  console.log("@bookslots, data: ", data);
  socket.emit("BOOK_SLOTS", data);
  console.log("@bookslots, emitted!")
}

export const cancelbookings = function (data) {
  console.log("@cancelbookings: socket: ", socket);
  console.log("@cancelbookings, data: ", data);
  socket.emit("CANCEL_BOOKINGS", data);
  console.log("@cancelbookings, emitted!")
}

export const requestmatches = function (data) {
  console.log("@requestmatches: socket: ", socket);
  console.log("@requestmatches, data: ", data);
  socket.emit("REQUEST_MATCHES", data);
  console.log("@requestmatches, emitted!")
}

export const cancelmatches = function (data) {
  console.log("@cancelmatches: socket: ", socket);
  console.log("@cancelmatches, data: ", data);
  socket.emit("CANCEL_MATCHES", data);
  console.log("@cancelmatches, emitted!")
}

export const printredis = function () {
  console.log("@printredis: socket: ", socket);
  console.log("@printredis");
  socket.emit("PRINT_REDIS");
  console.log("@printredis, emitted!")
}

export const deleteredis = function () {
  console.log("@deleteredis: socket: ", socket);
  console.log("@deleteredis");
  socket.emit("DELETE_REDIS");
  console.log("@deleteredis, emitted!")
}