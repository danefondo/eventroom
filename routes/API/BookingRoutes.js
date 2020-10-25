const Express = require("express");
const BookingController = require("../../server/bookingCalendar/controllers/BookingController");

const router = Express.Router();

/**
 * 1. Schedule a session for a specific time specified in client data
 * 2. Attempt instantly match with someone from the pool of available people based on
 * 3. Notify any affected people & perform any visual rematching post server-side rematching
 */
router.post("/bookSessionSlot", BookingController.bookSessionSlot);

router.post("/bookManySessionSlots", BookingController.bookManySessionSlots);

/* Cancel a booked session */
router.post("/cancelCalendarSlot", BookingController.cancelCalendarSlot);

/* Get all user's booked sessions */
router.post(
  "/getUserBookedSessionsForThisWeek",
  BookingController.getUserBookedSessionsForThisWeek
);

/* Get all booked sessions by all users from a particular time, for a particular week*/
router.post(
  "/getAllBookedUsersForSpecificWeek",
  BookingController.getAllBookedUsersForSpecificWeek
);

/* Get all booked sessions for a specific day */
router.post(
  "/getBookedSessionsForOneDay",
  BookingController.getBookedSessionsForOneDay
);

/**
 * Second tier PAID MEMBER FEATURES.
 * Set booking configuration, e.g. 'only be seen by X person' or 'only get matched with people from X group'
 * Match by gender
 */

module.exports = router;
