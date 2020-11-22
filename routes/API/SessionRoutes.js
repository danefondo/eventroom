const Express = require("express");

const SessionController = require("../../server/bookingCalendar/controllers/SessionController");

const router = Express.Router();

router.post("/registerJoinTimestamp", SessionController.registerJoinTimestamp);

router.post(
  "/registerLeaveTimestamp",
  SessionController.registerLeaveTimestamp
);

module.exports = router;
