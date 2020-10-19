const EventroomModel = require("../models/EventroomModel");
const ProfileModel = require("../../profile/models/ProfileModel");

const EventroomDataController = {
  async checkIfEventroomExistsByName(eventroomName) {
    const query = { eventroomName: eventroomName };
    const doesEventroomExist = await EventroomModel.exists(query);
    return doesEventroomExist;
  },

  async checkIfEventroomExistsById(eventroomId) {
    const query = { _id: eventroomId };
    const doesEventroomExist = await EventroomModel.exists(query);
    return doesEventroomExist;
  },

  async addUserToRoomData(roomData) {
    // find room & add if nott there

    let eventroom;
    let query = { eventroomName: roomData.eventroomName };
    let errors = {};

    try {
      eventroom = await EventroomModel.findOne(query).exec();
      if (!eventroom) {
        errors.FailedToGetRoom = true;
        throw { errors: errors };
      }

      let participantId = roomData.participant;

      if (roomData.isAnon) {
        eventroom.anonParticipantsIdsWhoHaveJoined.push(participantId);
      }

      eventroom.currentParticipantsIds.push(participantId);
      eventroom.allParticipantsIdsWhoHaveJoined.push(participantId);
      await eventroom.save();
    } catch (error) {
      if (error.errors) {
        errors = error.errors;
      } else {
        errors.error = error;
      }
      throw { errors: errors };
    }
    return eventroom;
  },

  async updateRoomPassword(eventroomData) {
    let errors = {};
    let query = { _id: eventroomData.eventroomId };
    let eventroom;

    try {
      eventroom = await EventroomModel.findById(query).exec();
      if (!eventroom) {
        errors.FailedToFindRoom = true;
        throw { errors: errors };
      }

      console.log("data", eventroomData);
      console.log("eventry", eventroom);
      if (eventroom.creatorId !== eventroomData.userId) {
        console.log("eventroomCREATOR", eventroom.creatorId);
        console.log("USERID", eventroomData.userId);
        errors.UserLacksPermissionToModifyRoomPassword = true;
        throw { errors: errors };
      }

      eventroom.roomPassword = eventroomData.roomPassword;
      eventroom.roomPasswordEnabled = true;

      await eventroom.save();
    } catch (error) {
      if (error.errors) {
        errors = error.errors;
      } else {
        errors.error = error;
      }
      throw { errors: errors };
    }
    return eventroom;
  },

  async checkIfRoomPasswordMatches(passCheckData) {
    // Validate password as valid string?
    // Select password specifically
    let errors = {};
    let query = { _id: passCheckData.eventroomId };
    let matching = false;

    try {
      let eventroom = await EventroomModel.findById(query).exec();
      if (!eventroom) {
        errors.FailedToFindRoom = true;
        throw { errors: errors };
      }

      if (eventroom.roomPassword == passCheckData.roomPasswordCheck) {
        matching = true;
      } 

      if (!matching) {
        errors.PasswordDidNotMatch = true;
        throw { errors: errors };
      }

    } catch (error) {
      if (error.errors) {
        errors = error.errors;
      } else {
        errors.error = error;
      }
      throw { errors: errors };
    }
    return matching;
  },

  async disableRoomPassword(eventroomData) {
    let errors = {};
    let query = { _id: eventroomData.eventroomId };
    let eventroom;

    try {
      eventroom = await EventroomModel.findById(query).exec();
      if (!eventroom) {
        errors.FailedToFindRoom = true;
        throw { errors: errors };
      }

      console.log("data", eventroomData);
      console.log("eventry", eventroom);
      if (eventroom.creatorId !== eventroomData.userId) {
        console.log("eventroomCREATOR", eventroom.creatorId);
        console.log("USERID", eventroomData.userId);
        errors.UserLacksPermissionToModifyRoomPassword = true;
        throw { errors: errors };
      }

      eventroom.roomPassword = "";
      eventroom.roomPasswordEnabled = false;

      await eventroom.save();
    } catch (error) {
      if (error.errors) {
        errors = error.errors;
      } else {
        errors.error = error;
      }
      throw { errors: errors };
    }
    return eventroom;
  },

  async claimRoom(eventroomData) {
    let errors = {};
    let query = { eventroomName: eventroomData.eventroomName };
    let eventroom;

    try {
      eventroom = await EventroomModel.findOne(query).exec();
      if (!eventroom) {
        errors.FailedToFindRoom = true;
        throw { errors: errors };
      }

      console.log("data", eventroomData);
      console.log("eventry", eventroom);
      if (eventroom.creatorId !== eventroomData.userId) {
        console.log("eventroomCREATOR", eventroom.creatorId);
        console.log("USERID", eventroomData.userId);
        errors.UserLacksPermissionToClaim = true;
        throw { errors: errors };
      }

      // Todo: Make sure expire date has not arrived yet or that it doesn't before save;
      eventroom.expire_at = null;
      eventroom.ownerId = eventroomData.userId;
      eventroom.ownerUsername = eventroomData.username;

      await eventroom.save();

      let userQuery = { userId: eventroomData.userId };
      let user = await ProfileModel.findOne(userQuery).exec();
      if (!user) {
        errors.FailedToFindUser = true;
        throw { errors: errors };
      }
      user.push(eventroom._id);
      await user.save();
    } catch (error) {
      if (error.errors) {
        errors = error.errors;
      } else {
        errors.error = error;
      }
      throw { errors: errors };
    }
    return eventroom;
  },

  async getUserRooms(userData) {
    let query = { ownerId: userData.userId };
    let errors = {};
    let eventrooms;
    try {
      eventrooms = await EventroomModel.find(query).exec();
    } catch (error) {
      if (error.errors) {
        errors = error.errors;
      } else {
        errors.error = error;
      }
      throw { errors: errors };
    }
    return eventrooms;
  },

  async createEventroom(eventroomData) {
    console.log("Creating new Eventroom...");

    let eventroom = new EventroomModel({
      eventroomName: eventroomData.eventroomName,
      dateCreated: eventroomData.dateCreated,
    });

    console.log("@Created Eventroom", eventroom);

    if (eventroomData.hostId) {
      eventroom.hostId = eventroomData.hostId;
      eventroom.creatorId = eventroomData.hostId;
    }

    return eventroom.save();
  },

  async getEventroomByName(eventroomName) {
    console.log("@Getting Eventroom by name", eventroomName);
    let eventroom;
    let query = { eventroomName: eventroomName };

    try {
      eventroom = await EventroomModel.find(query).exec();
      console.log("@Found Eventroom", eventroom);
      if (!eventroom) throw new Error("Could not find eventroom");
    } catch (err) {
      console.log("@getEventroomByName error", err);
      return { success: false };
    }
    return { success: true, eventroom };
  },

  async changeEventroomName(eventroomData) {
    console.log("@Changing Eventroom new name and id:", eventroomData);
    let eventroom;
    let filter = { _id: eventroomData.eventroomId };
    let update = { eventroomName: eventroomData.newEventroomName };

    try {
      eventroom = await EventroomModel.findOneAndUpdate(filter, update, {
        new: true,
      });
      console.log("@Successfully changed Eventroom name", eventroom);

      if (!eventroom) throw new Error("Could not find eventroom");
    } catch (err) {
      console.log("@getEventroomByName error", err);
      return { success: false, err };
    }
    return { success: true, eventroom };
  },
};

module.exports = EventroomDataController;
