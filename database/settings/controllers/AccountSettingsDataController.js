const AccountSettings = require("../models/AccountSettingsModel");
const ProfileModel = require("../../profile/models/ProfileModel");
const User = require("../../user/models/UserModel");

const { verifyPassword } = require("../../../server/auth/utilities/Utils");

// const aws = require('aws-sdk');

// aws.config.update({
// 	accessKeyId: "AKIARKLMM5TMEHGOSNJC",
// 	secretAccessKey: "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",
// 	region: "us-east-1"
// });

// const s3 = new aws.S3();
// const S3_BUCKET = 'curata';

const AccountSettingsDataController = {
  async updateProfileSettings(data) {
    let profileSettingsData = {
      userId: data.userId,
      displayName: data.displayName,
      firstName: data.firstName,
      lastName: data.lastName,
      bio: data.bio,
      location: data.location,
    };
    let query = { userId: data.userId };
    let options = { upsert: true, new: true, setDefaultsOnInsert: true };

    // $set used to update multiple fields
    // https://stackoverflow.com/questions/37267042/mongoose-findoneandupdate-updating-multiple-fields
    let update = { $set: profileSettingsData };
    console.log("update", update);

    await ProfileModel.findOneAndUpdate(
      query,
      update,
      options
    ).exec();

    let profileData = await AccountSettings.findOneAndUpdate(
      query,
      update,
      options
    ).exec();
    
    return profileData;
  },

  async saveProfileImageReference(imageData) {
    console.log(imageData);
  },

  async getProfileDataByUserId(userId) {
    return AccountSettings.findOne({ userId: userId }).exec();
  },

  async deleteAccount(userId, password) {
    let accountDeleted = false;
    try {
      let response = await User.findOne({ _id: userId })
        .select("+password")
        .exec();

      if (!response) throw { UserNotFoundError: true };
      let cryptedPassword = response.password;

      let passwordMatchCheck = await verifyPassword(password, cryptedPassword);
      if (!passwordMatchCheck) throw { PasswordDoesNotMatchError: true };

      /* 
      HANDLE AN EVENTROOM HAVING OTHER PARTICIPANTS-CONTRIBUTORS
      - PREVENT DELETE & SEND ERROR THAT YOU MUST PASS OVER OWNERSHIP FIRST
      */

      //   User.deleteOne({ _id: userId }).exec(function (err, removed) {
      //     if (err) {
      //       return console.log("Failed to delete account: ", err);
      //     }
      //     console.log("Successfully deleted account.");
      //   });

      //   let images = await Image.find({ streamer_id: user_id });
      //   const imageKeys = [];
      //   images.forEach(function (image) {
      //     // Pull image reference from curataFiles
      //     console.log("One imageId to remove: ", image);

      //     imageKeys.push({
      //       Key: "" + image.imageKey,
      //     });
      //   });

      //   if (imageKeys.length) {
      //     s3.deleteObjects(
      //       {
      //         Bucket: S3_BUCKET,
      //         Delete: {
      //           Objects: imageKeys,
      //         },
      //       },
      //       function (err, data) {
      //         if (err) {
      //           console.log("Error: ", err);
      //         } else {
      //           console.log("Successfully deleted image from AWS.");
      //         }
      //       }
      //     );
      //   }

      //   await Image.deleteMany({ streamer_id: user_id });
      //   console.log("Associated images successfully removed.");

      /*
      1. Delete EventModel entries
      2. Delete EventroomModel entries
      3. Delete RoomModel entries
      4. Delete AccountSettings model entries
      5. Delete UserConfigurationsModel entries
      6. Delete UserInteractionModel entries
      7. Delete UserRefreshTokenModel entries
      8. Delete UserRoomPreferencesModel entries
      9. Delete UserModel
      */

      //   userId = mongoose.Types.ObjectId(userId);
      //   await EventModel.deleteMany({ creatorId: userId });
      //   console.log("Associated streams successfully removed.");

      accountDeleted = true;
    } catch (error) {
      console.log("@deleteAccount error", error);
      return { success: false, accountDeleted, error };
    }
    return { success: true, accountDeleted };
  },
};

module.exports = AccountSettingsDataController;
