const UserConfigurationUtilities = require('../../../database/user/utilities/UserConfigurationsUtilities');

const ConfigurationController = {
  async getEventroomToolbarConfigurations(req, res) {
    const userId = req.query ? req.query.userId : null;
    let configurations;
    try {
      configurations = await UserConfigurationUtilities.getEventroomToolbarConfigurations(userId);
      if (configurations == null) throw new Error("somethings wrong");
    } catch (err) {
      console.log("@getconfig error:", err);
      return res.status(500).send({ error: "internal server error "});
    }
    const eventroomToolbar = configurations.eventroomToolbar
    // console.log("@getconfig config", configurations);
    return res.status(200).send({ success: true, eventroomToolbar });
  },

  async setEventroomToolbarConfigurations(req, res) {
    // console.log("@settoolbar body", req.body);
    if (!req.body) {
      return res.status(400).send({ error: "invalid request" });
    }
    const userId = req.body.userId;
    delete req.body.userId;
    let eventroomToolbar;
    try {
      eventroomToolbar = (await UserConfigurationUtilities.setEventroomToolbarConfigurations(userId, req.body)).eventroomToolbar;
    } catch (err) { 
      console.log("@settoolbar error:", err);
      return res.status(500).send({ error: "internal server error" });
    }
    // console.log("@settoolbar config ", eventroomToolbar);
    return res.status(200).send({ success: true, eventroomToolbar });
  }
}

module.exports = ConfigurationController;