const Express = require("express");
const EventroomController = require("../../server/eventroom/controllers/EventroomController");

const router = Express.Router();

/**
 * Create a new Eventroom with custom slug
 */
router.post("/createEventroom", EventroomController.createEventroom);


/**
 * Generate an Access Token for a chat application user provided via the url
 */
router.get(
  "/generateTwilioAccessToken",
  EventroomController.generateTwilioAccessToken
);

module.exports = router;
