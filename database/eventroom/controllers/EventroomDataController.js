const EventroomModel = require("../models/EventroomModel");

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
      eventroom.anonParticipants.push(roomData.participant);
      await eventroom.save();
    } catch (error) {
      if (error.errors) {
        errors = error.errors;
      } else {
        errors.error = error;
      }
      throw { errors: errors }
    }
    return eventroom;
  },

  async createEventroom(eventroomData) {
    console.log("Creating new Eventroom...");

    const eventroom = new EventroomModel({
      eventroomName: eventroomData.eventroomName,
      dateCreated: eventroomData.dateCreated,
    });

    console.log("@Created Eventroom", eventroom);

    if (eventroomData.hostId) {
      eventroom.hostId = eventroomData.hostId;
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
