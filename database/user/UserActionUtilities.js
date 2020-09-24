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
        defaultSpeaker: req.body.defaultCamera,
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

  async getUserRoomPreferences(req, res) {
    try {
      let video = new WorkoutVideo();
      let video_data = req.body;
      console.log("video data", video_data);

      video.name = video_data.name;

      // let tags = stream_data.stream_tags;
      // tags = JSON.parse(tags);

      await video.save();
      console.log("vidyo", video);

      res.json({
        video: video,
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        errors: "An unknown error occurred",
      });
    }
  },
};

module.exports = UserActionUtilities;
