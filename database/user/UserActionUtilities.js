const UserRoomPreferences = require("./models/UserRoomPreferencesModel");

const UserActionUtilities = {
  async updateUserRoomPreferences(req, res) {
    try {
      let userId = req.body.userId;
      if (!userId) {
        return res.status(404).json({
          errors: "User id not provided.",
        });
      }

      let roomPreferenceData = {
        userId: userId,
        defaultCamera: req.body.defaultCamera,
        defaultMicrophone: req.body.defaultMicrophone,
        defaultSpeaker: req.body.defaultSpeaker,
        showPreScreen: req.body.showPreScreen,
      };

      //- Update preferences or create preferences data if does not exist yet
      var query = { userId: userId },
        update = roomPreferenceData,
        options = { upsert: true, new: true, setDefaultsOnInsert: true };

      let userRoomPreferenceData = await UserRoomPreferences.findOneAndUpdate(
        query,
        update,
        options
      ).exec();

      if (!userRoomPreferenceData) {
        return res.status(404).json({
          errors: "Failed to update user room preferences.",
        });
      }
      res.json({
        userRoomPreferenceData: userRoomPreferenceData,
      });

    } catch (error) {
      console.log(error);
      res.status(500).json({
        errors: "An unknown error occurred",
      });
    }
  },

  async updateUserPreScreenPreference(req, res) {
    try {
      let userId = req.body.userId;
      if (!userId) {
        return res.status(404).json({
          errors: "User id not provided.",
        });
      }

      let roomPreferenceData = {
        userId: userId,
        showPreScreen: req.body.showPreScreen
      };

      //- Update preferences or create preferences data if does not exist yet
      var query = { userId: userId },
        update = roomPreferenceData,
        options = { upsert: true, new: true, setDefaultsOnInsert: true };

      let userRoomPreferenceData = await UserRoomPreferences.findOneAndUpdate(
        query,
        update,
        options
      ).exec();

      if (!userRoomPreferenceData) {
        return res.status(404).json({
          errors: "Failed to update user room preferences.",
        });
      }
      res.json({
        userRoomPreferenceData: userRoomPreferenceData,
      });

    } catch (error) {
      console.log(error);
      res.status(500).json({
        errors: "An unknown error occurred",
      });
    }
  },

  async getUserRoomPreferences(req, res) {
    try {
      let userId = req.body.userId;

      let query = { userId: userId };
      let userRoomPreferences = await UserRoomPreferences.findOne(query).exec();
      if (!userRoomPreferences) {
        return res.status(404).json({
          errors: "User preferences do not exist yet.",
        });
      }
      res.status(200).json({
        userRoomPreferences: userRoomPreferences
      });

    } catch(error) {
      console.log(error);
      res.status(500).json({
        errors: "An unknown error occurred",
      });
    }
  },

};

module.exports = UserActionUtilities;
