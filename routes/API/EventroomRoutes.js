const Express = require("express");
const EventroomController = require("../../server/eventroom/controllers/EventroomController");

const router = Express.Router();

/**
 * Create a new Eventroom with custom slug
 */
router.post("/createEventroom", EventroomController.createEventroom);

// Get user rooms
router.post("/getUserRooms", EventroomController.getUserRooms);

router.post("/claimRoom", EventroomController.claimRoom);

router.post("/updateRoomPassword", EventroomController.updateRoomPassword);

router.post("/disableRoomPassword", EventroomController.disableRoomPassword);

router.post("/checkIfRoomPasswordMatches", EventroomController.checkIfRoomPasswordMatches);

/**
 * Add room participant to room data
 */
router.post("/addUserToRoomData", EventroomController.addUserToRoomData);

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
 * Check if Eventroom exists by Id
 */
router.post(
  "/checkIfEventroomExistsById",
  EventroomController.checkIfEventroomExistsById
);

/**
 * Change existing Eventroom name
 */
router.post(
  "/changeEventroomName",
  EventroomController.changeEventroomName
);

/**
 * Generate an Access Token for a chat application user provided via the url
 */
router.post(
  "/generateTwilioAccessToken",
  EventroomController.generateTwilioAccessToken
);

module.exports = router;
