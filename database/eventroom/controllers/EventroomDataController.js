const EventroomModel = require("../models/EventroomModel");

const EventroomDataController = {
  async createEventroom(eventroomData) {
    console.log("Creating new Eventroom...");

    const eventroom = new EventroomModel({
      eventroomName: eventroomData.eventroomName,
      dateCreated: eventroomData.dateCreated,
    });

    if (eventroomData.hostId) {
      eventroom.hostId = eventroomData.hostId;
    }

    return eventroom.save();
  },
};

module.exports = EventroomDataController;
