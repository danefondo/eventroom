const Room = require('./models/RoomModel');
const mongoose = require('mongoose');

const RoomUtilities = {

  /**
   * Creates a room with given data. 
   * @param {*} roomData 
   */
  async createRoom(roomData) {
    const room = new Room({
      eventId: roomData.event_id,
      hostId: roomData.host_id,             
      dateCreated: new Date(),
      sessionId: roomData.sessionId,
    });
    console.log("@createroom room:", room);
    return room.save();
  },

  /**
   * Sets Vonage session id for the room
   * @param {*} roomId 
   * @param {*} sessionId 
   */
  async setSessionId(roomId, sessionId) {
    let room;
    try {
      room = Room.findById(roomId).exec();
      if (!room) throw Error("no room found");
    } catch (err) {
      console.log("@addsessionid error:", err);
      return Promise.reject("problem while adding session id");
    }

    room.sessionId = sessionId;
    return room.save();
  },

  /**
   * Adds a session token to the room
   * @param {*} roomId 
   * @param {*} sessionToken 
   */
  async addSessionToken(roomId, sessionToken) {
    let room;
    try {
      room = Room.findById(roomId).exec();
      if (!room) throw Error("no room found");
    } catch (err) {
      console.log("@addsessiontoken error", err);
      return Promise.reject("error while adding session token");
    }

    if (room.sessionTokens) {
      room.sessionTokens.push(sessionToken);
    } else {
      room.sessionTokens = [sessionToken];
    }

    return room.save();
  },

  async getRoomById(roomId) {
    return Room.findById(roomId).exec();
  }
}

module.exports = RoomUtilities;