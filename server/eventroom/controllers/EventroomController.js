const {
  checkIfEventroomExistsByName,
} = require("../utilities/EventroomUtilities");
const EventroomDataController = require("../../../database/eventroom/controllers/EventroomDataController");
const TwilioUtilities = require("../../twilio/utilities/TwilioUtilities");

const EventroomController = {
  async checkIfEventroomExistsByName(req, res) {
    if (!req.body) {
      return res.status(400).send({ error: "Invalid request 400" });
    }

    if (!req.body.eventroomName) {
      // Ideally just create a new slug here to maximize UX
      return res
        .status(400)
        .send({ error: "Invalid request: Eventroom name missing" });
    }

    try {
      let eventroomName = req.body.eventroomName;

      // Check if Eventroom already exists
      let eventroom = await checkIfEventroomExistsByName(eventroomName);

      let alreadyExists = false;
      if (eventroom) {
        alreadyExists = true;
      }
      return res.status(200).send({ alreadyExists });
    } catch (error) {
      console.log("@createEventroom", error);
      res.status(500).send({ error: "An unknown error occurred" });
    }
  },

  async createEventroom(req, res) {
    if (!req.body) {
      return res.status(400).send({ error: "Invalid request 400" });
    }

    let eventroomName = req.body.eventroomName;
    if (!eventroomName) {
      // Ideally just create a new slug here to maximize UX
      return res
        .status(400)
        .send({ error: "Invalid request: Eventroom name missing" });
    }
    let eventroomData = {};
    // const userId = req.user._id;
    const hostId = req.body.hostId;
    // let userIsHost;
    try {
      // Prepare data for creating an Eventroom
      eventroomData.eventroomName = eventroomName;

      // Check if Eventroom already exists
      let eventroomExists = await checkIfEventroomExistsByName(eventroomName);


      let alreadyExists = false;
      if (eventroomExists) {
        alreadyExists = true;
        return res.status(200).send({ alreadyExists });
      }

      eventroomData.dateCreated = new Date();

      if (hostId) {
        eventroomData.hostId = hostId;
        // userIsHost = hostId == userId;
      }

      // Create Eventroom and return it
      let eventroom = await EventroomDataController.createEventroom(
        eventroomData
      );
      return res.status(200).send({ eventroom });
    } catch (error) {
      console.log("@createEventroom", error);
      res.status(500).send({ error: "An unknown error occurred" });
    }
  },

  async getEventroomByName(req, res) {
    try {
      console.log("paramparam", req.params);
      const eventroomName = req.params.eventroomName;
      const eventroom = await EventroomDataController.getEventroomByName(
        eventroomName
      );
      if (!eventroom || !eventroom.success) {
        return res.status(500).send({ error: "Error finding event" });
      }
      console.log("@getevent data", eventroom);
      res.status(200).send({ eventroom });
    } catch (error) {
      console.log(error);
      return res.status(500).send({ error: "An unknown error occurred" });
    }
  },

  /**
   * Generate an Access Token for a chat application user provided via the url
   */
  async generateTwilioAccessToken(req, res) {
    try {
      var identity = req.query["identity"];

      if (!identity) {
        return res.status(400).send({
          body: "An identity is needed",
        });
      }

      let token = await TwilioUtilities.generateTwilioAccessToken(identity);

      // Serialize the token to a JWT string and include it in a JSON response.
      res.status(200).send({
        identity: identity,
        token: token.toJwt(),
      });
    } catch (error) {
      console.log("@generateTwilioAccessToken", error);
      res.status(500).send({ error: "An unknown error occurred" });
    }
  },
};

module.exports = EventroomController;
