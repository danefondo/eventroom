const {
  checkIfEventroomExistsByName,
} = require("../../../database/eventroom/controllers/EventroomDataController");
const EventroomDataController = require("../../../database/eventroom/controllers/EventroomDataController");

const EventroomUtilities = {
  async checkIfEventroomExistsByName(eventroomName) {
    if (!eventroomName) {
      return console.log("@checkIfEventroomExistsByName: No name provided.");
    }
    try {
      // Check if Eventroom already exists
      let eventroom = await EventroomDataController.checkIfEventroomExistsByName(
        eventroomName
      );

      let boolean = false;
      if (eventroom) {
        boolean = true;
      }
      return boolean;
    } catch (error) {
      return console.log("@checkIfEventroomExistsByName: Failed check.", error);
    }
  },
};

module.exports = EventroomUtilities;
