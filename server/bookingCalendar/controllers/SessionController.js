const { processPostRequest } = require("../../../utilities/CRUDAutomation");

const controller = "SessionDataController";

const SessionController = {
  async registerJoinTimestamp(req, res) {
    const options = {
      validate: ["participantId", "timestamp", "type", "sessionId"],
      funcToRun: "registerJoinTimestamp",
      dataToPass: req.body,
      selfComplete: true,
    };
    await processPostRequest(req, res, controller, options);
    return;
  },

  async registerLeaveTimestamp(req, res) {
    const options = {
      validate: ["participantId", "timestamp", "type", "sessionId"],
      funcToRun: "registerLeaveTimestamp",
      dataToPass: req.body,
      selfComplete: true,
    };
    await processPostRequest(req, res, controller, options);
    return;
  },
};

module.exports = SessionController;
