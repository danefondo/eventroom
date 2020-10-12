const Profile = require("../models/ProfileModel");
const TempUser = require("../../room/models/TempUserModel");
const AccountSettings = require("../../settings/models/AccountSettingsModel");
const mongoose = require("mongoose");

const ProfileDataController = {
  async updateProfileByUserId() {},

  async getProfileByUserId(userId) {
    // By userId, not Profile._id
    return Profile.findOne({ userId: userId }).exec();
  },

  async getManyProfilesByUserIds(participantIds) {
    let participants = {};
    let tempUsers = await TempUser.find({ _id: { $in: participantIds } });
    console.log("TEMP USERS LIST", tempUsers);

    let users = await Profile.find({ userId: { $in: participantIds } });
    console.log("USERS LIST", users);

    if (tempUsers) {
      participants.tempUsers = tempUsers;
    }

    if (users) {
      participants.users = users;
    }

    // IF NOTHING IN EITHER, THROW OR RETURN EMPTY
    // OTHERWISE COMBINE
    // Get profiles by ids
    console.log("PARTICIPANTS", participants);
    return participants;
  },

  async saveProfileImageReference(imageData) {
    // save profile image data
    console.log("imageData", imageData);
    let setData = {
      "profileImage.fileName": imageData.fileName,
      "profileImage.fileUrl": imageData.fileUrl,
    };
    let query = { userId: imageData.userId };
    let options = { upsert: true, new: true, setDefaultsOnInsert: true };

    // $set used to update multiple fields
    // https://stackoverflow.com/questions/37267042/mongoose-findoneandupdate-updating-multiple-fields
    let update = { $set: setData };
    console.log("update", update);

    await AccountSettings.findOneAndUpdate(query, update, options).exec();

    let profile = await Profile.findOneAndUpdate(query, update, options).exec();
    return profile;
  },

  async createProfile(profileData) {
    const newProfile = new Profile({
      userId: profileData.userId,
      displayName: profileData.displayName,
      email: profileData.email,
      username: profileData.username,
      firstName: profileData.firstName,
      lastName: profileData.firstName,
    });
    return newProfile.save();
  },

  /**
   * Creates a room with given data.
   * @param {*} roomData
   */
  async createRoom(roomData) {
    console.log("@createroomutil, roomdata", roomData);
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
    try {
      await Room.remove({}).exec();
      await TempUser.remove({}).exec();
    } catch (err) {
      console.log("err");
      return Promise.reject("error");
    }
    return { success: true };
  },
};

module.exports = ProfileDataController;
