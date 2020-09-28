const Room = require('../../database/room/models/RoomModel');
const TempUser = require('../../database/room/models/TempUserModel');
const mongoose = require('mongoose');

const RoomUtilities = {

  /**
   * Creates a room with given data. 
   * @param {*} roomData 
   */
  async createRoom(roomData) {
    console.log("@createroomutil, roomdata", roomData)
    const room = new Room({
      eventId: roomData.eventId,
      hostId: roomData.hostId,             
      dateCreated: new Date(),
      sessionId: roomData.sessionId,
    });
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
  },
  
  async deleteAll() {
    try{
      await Room.remove({}).exec();
      await TempUser.remove({}).exec();
    } catch (err) {
      console.log("err")
      return Promise.reject("error");
    }
    return { success: true};
  }
}

module.exports = RoomUtilities;