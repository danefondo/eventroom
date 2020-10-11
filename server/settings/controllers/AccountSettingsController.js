const AccountSettingsDataController = require("../../../database/settings/controllers/AccountSettingsDataController");
const { verifyPassword } = require("../../auth/utilities/Utils");

const { signS3 } = require("../utilities/AWS");

const {
  validatePostRequest,
  processPostRequest,
} = require("../../../utilities/CRUDAutomation");

const controller = "AccountSettingsDataController";

const AccountSettingsController = {
  //   async createEventroom(req, res) {
  //     if (!req.body) {
  //       return res.status(400).send({ error: "Invalid request 400" });
  //     }

  //     let eventroomName = req.body.eventroomName;
  //     if (!eventroomName) {
  //       // Ideally just create a new slug here to maximize UX
  //       return res
  //         .status(400)
  //         .send({ error: "Invalid request: Eventroom name missing" });
  //     }
  //     eventroomName = eventroomName.replace(/[^0-9a-z_-]/gi, "");
  //     let eventroomData = {};
  //     // const userId = req.user._id;
  //     const hostId = req.body.hostId;
  //     // let userIsHost;
  //     try {
  //       // Prepare data for creating an Eventroom
  //       eventroomData.eventroomName = eventroomName;

  //       // Check if Eventroom already exists
  //       let eventroomExists = await checkIfEventroomExistsByName(eventroomName);

  //       let alreadyExists = false;
  //       if (eventroomExists) {
  //         alreadyExists = true;
  //         return res.status(200).send({ alreadyExists });
  //       }

  //       eventroomData.dateCreated = new Date();

  //       if (hostId) {
  //         eventroomData.hostId = hostId;
  //         // userIsHost = hostId == userId;
  //       }

  //       // Create Eventroom and return it
  //       let eventroom = await EventroomDataController.createEventroom(
  //         eventroomData
  //       );
  //       return res.status(200).send({ eventroom });
  //     } catch (error) {
  //       console.log("@createEventroom", error);
  //       res.status(500).send({ error: "An unknown error occurred" });
  //     }
  //   },
  async getProfileDataByUserId(req, res) {
    const options = {
      validate: ["userId"],
      funcToRun: "getProfileDataByUserId",
      dataToPass: req.body.userId,
      selfComplete: true,
    };
    await processPostRequest(req, res, controller, options);
    return;
  },

  async getS3Signature(req, res) {
    let clientData = req.body;
    let errors = {};

    if (!clientData) {
      errors.InvalidRequest = true;
      return res.status(400).send({ errors: errors });
    }

    let fileName = clientData.fileName;
    let fileType = clientData.fileType;

    if (!fileName || !fileType) {
      errors.MissingImageData = true;
      return res.status(500).send({ errors: errors });
    }

    try {
      let result = await signS3(fileName, fileType);

      if (!result || !result.success || result.error || !result.returnData) {
        errors.FailedToGetUploadPermission = true;
        return res.status(500).send({ errors: errors });
      }

      console.log("returnData", result.returnData);

      let success = result.success;
      let returnData = result.returnData;
      res.status(200).send({ success, returnData });
    } catch (error) {
      console.log("Error occurred while attempting to sign S3.", error);
      errors.exceptionError = true;
      return res.status(500).send({ errors: errors });
    }
  },

  // async saveProfileImageReference(req, res) {
  //   const options = {
  //     validate: ["userId", "fileName", "fileUrl"],
  //     funcToRun: "saveProfileImageReference",
  //     queryToPass: req.body.userId,
  //     selfComplete: true,
  //   };
  //   await processPostRequest(req, res, controller, options);
  //   return;
  // },

  async saveProfileImageReference(req, res) {
    let clientData = req.body;
    let errors = {};

    if (!clientData) {
      errors.InvalidRequest = true;
      return res.status(400).send({ errors: errors });
    }

    let fileName = clientData.fileName;
    let fileUrl = clientData.fileUrl;

    if (!fileName || !fileUrl) {
      errors.MissingImageData = true;
      return res.status(500).send({ errors: errors });
    }

    let imageData = {
      fileName,
      fileUrl,
    };

    try {
    } catch (error) {
      let uploadResult = await AccountSettingsDataController.saveProfileImageReference(
        imageData
      );

      if (!result || !result.success || result.error || !result.returnData) {
        errors.FailedToGetUploadPermission = true;
        return res.status(500).send({ errors: errors });
      }

      console.log("returnData", result.returnData);

      let success = result.success;
      let returnData = result.returnData;
      res.status(200).send({ success, returnData });
    }
  },

  async changeProfileImage(req, res) {
    console.log(req, res);
  },

  async deleteProfileImage(req, res) {
    console.log(req, res);
  },

  async updateProfileSettings(req, res) {
    const options = {
      validate: ["userId"],
      funcToRun: "updateProfileSettings",
      dataToPass: req.body,
      selfComplete: true,
    };
    await processPostRequest(req, res, controller, options);
    return;
  },

  async deleteAccount(req, res) {
    let clientData = req.body;
    let errors = {};
    if (!clientData) {
      errors.InvalidRequest = true;
      return res.status(400).send({ errors: errors });
    }

    if (!clientData.userId) {
      errors.UserIdMissing = true;
      return res.status(500).send({ errors: errors });
    }

    if (!clientData.password) {
      errors.PasswordIsMissing = true;
      return res.status(500).send({ errors: errors });
    }

    try {
      const result = await AccountSettingsDataController.deleteAccount(
        clientData.userId,
        clientData.password
      );

      if (!result || !result.success) {
        if (result.error) {
          console.log(result.error);
          if (result.error.PasswordDoesNotMatchError) {
            errors.PasswordDoesNotMatchError = true;
          } else if (result.error.UserNotFoundError) {
            errors.UserNotFoundError = true;
          } else {
            errors.UnknownError = true;
          }
        }
        return res.status(500).send({ errors: errors });
      }

      // FORCE LOG USER OUT

      let success = result.success;
      res.status(200).send({ success });
    } catch (error) {
      console.log("Error occurred while attempting to delete account.", error);
      errors.exceptionError = true;
      return res.status(500).send({ errors: errors });
    }

    /**
     * 1. Get userId
     * 2. Get user password
     * 3. Find user & match passwords
     * 4. If passes don't match, return error
     * 5. If passes match, proceed deleting
     * 6. Find and delete any images linked to that userId
     * 7. Find and delete any rooms linked to that userId, where that userId is also the hostId
     * 8. Find and delete user account settings data
     * 9. Find and delete user room configuration settings data
     * 10. Find and delete user relationships with other users data
     * 11. Find and delete user
     */
  },
};

module.exports = AccountSettingsController;
