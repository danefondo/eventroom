const EventroomUtilities = require("../../../database/eventroom/controllers/EventroomDataController");
const TwilioUtilities = require("../../twilio/utilities/TwilioUtilities");

const EventroomController = {

  async createEventroom(req, res) {
    if (!req.body) {
      return res.status(400).send({ error: "Invalid request 400" });
    }

    if (!req.body.eventroomName) {
      // Ideally just create a new slug here to maximize UX
      return res.status(400).send({ error: "Invalid request: Eventroom name missing" });
    }

    let eventroom;
    let eventroomData = {};
    const userId = req.user._id;
    const hostId = req.body.hostId;
    let userIsHost;
    try {

      // Prepare data for creating an Eventroom
      eventroomData.eventroomName = req.body.eventroomName;
      eventroomData.dateCreated = new Date();

      if (hostId) {
        eventroomData.hostId = hostId;
        userIsHost = hostId == userId;
      }

      // Create Eventroom and return it
      eventroom = await EventroomUtilities.createEventroom(eventroomData);

    } catch (error) {
      console.log("@createEventroom", error);
      res.status(500).send({ error: "An unknown error occurred" });
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
  }
};

module.exports = EventroomController;
