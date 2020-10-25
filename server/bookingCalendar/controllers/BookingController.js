const BookingDataController = require("../../../database/booking/controllers/BookingDataController");

const { processPostRequest } = require("../../../utilities/CRUDAutomation");

const controller = "BookingDataController";

const BookingController = {
  async getUserBookedSessionsForThisWeek(req, res) {
    const options = {
      validate: ["userId"],
      funcToRun: "getUserBookedSessionsForThisWeek",
      dataToPass: req.body,
      selfComplete: true,
    };
    await processPostRequest(req, res, controller, options);
    return;
  },

  async getAllBookedUsersForSpecificWeek(req, res) {
    const options = {
      validate: ["endOfWeekDate"],
      funcToRun: "getAllBookedUsersForSpecificWeek",
      dataToPass: req.body,
      selfComplete: true,
    };
    await processPostRequest(req, res, controller, options);
    return;
  },

  async getBookedSessionsForOneDay(req, res) {
    const options = {
      validate: ["endOfDay"],
      funcToRun: "getBookedSessionsForOneDay",
      dataToPass: req.body,
      selfComplete: true,
    };
    await processPostRequest(req, res, controller, options);
    return;
  },

  async bookSessionSlot(req, res) {
    const options = {
      validate: ["userId", "queryDate", "username"],
      funcToRun: "bookSessionSlot",
      dataToPass: req.body,
      selfComplete: true,
    };
    await processPostRequest(req, res, controller, options);
    return;
  },

  async bookManySessionSlots(req, res) {
    const options = {
      validate: ["userId", "username", "sessionsToBook"],
      funcToRun: "bookManySessionSlots",
      dataToPass: req.body,
      selfComplete: true,
    };
    await processPostRequest(req, res, controller, options);
    return;
  },

  async cancelCalendarSlot(req, res) {
    const options = {
      validate: ["eventroomName", "participant"],
      funcToRun: "addUserToRoomData",
      dataToPass: req.body,
      selfComplete: true,
    };
    await processPostRequest(req, res, controller, options);
    return;
  },
};
module.exports = BookingController;
