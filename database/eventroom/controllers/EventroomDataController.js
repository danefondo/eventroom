const EventroomModel = require("../models/EventroomModel");

const EventroomDataController = {

  async checkIfEventroomExistsByName(eventroomName) {
    const doesEventroomExist = await EventroomModel.exists({ eventroomName: eventroomName });
    return doesEventroomExist;
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
    let query = {eventroomName: eventroomName};

    try {
      eventroom = await EventroomModel.find(query).exec();
      console.log("@Found Eventroom", eventroom);
      if (!eventroom) throw new Error("Could not find eventroom");
    } catch (err) {
      console.log("@getEventroomByName error", err);
      return { success: false };
    }
    return {success: true, eventroom};
  }
};

module.exports = EventroomDataController;
