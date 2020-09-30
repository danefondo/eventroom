const Express = require("express");
const EventroomController = require("../../server/eventroom/controllers/EventroomController");

const router = Express.Router();

/**
 * Create a new Eventroom with custom slug
 */
router.post("/createEventroom", EventroomController.createEventroom);

/**
 * Get an Eventroom initialization
 */
router.get("/:eventroomName", EventroomController.getEventroomByName);

/**
 * Check if Eventroom with the name already exists
 */
router.post(
  "/checkIfEventroomExistsByName",
  EventroomController.checkIfEventroomExistsByName
);

/**
 * Generate an Access Token for a chat application user provided via the url
 */
router.get(
  "/generateTwilioAccessToken",
  EventroomController.generateTwilioAccessToken
);

module.exports = router;
