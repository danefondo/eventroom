const AccountSettingsDataController = require("../../../database/settings/controllers/AccountSettingsDataController");

var ImageKit = require("imagekit");

const { processPostRequest } = require("../../../utilities/CRUDAutomation");

const controller = "AccountSettingsDataController";

const AccountSettingsController = {
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

  async getImageKitSignature(req, res) {
    var imagekit = new ImageKit({
      publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
      privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
      urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
    });

    var authenticationParameters = imagekit.getAuthenticationParameters();

    res.set({ "Access-Control-Allow-Origin": "*" });
    res.status(200).send(authenticationParameters);
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

  /**
   *
   * @param {*} req
   * @param {*} res
   *
   * Returns:
   * If success: {success: true}
   * If fail: { errors: UserIdMissing
   *                    OldPasswordMissing
   *                    NewPasswordMissing
   *                    NewPasswordConfirmationMissing
   *                    PasswordsDoNotMatch
   *                    FailedToChangePassword
   *                    IncorrectPassword
   *                    ExceptionError }
   */
  async changePassword(req, res) {
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

    if (!clientData.oldPassword) {
      errors.OldPasswordMissing = true;
      return res.status(500).send({ errors: errors });
    }

    if (!clientData.newPassword) {
      errors.NewPasswordMissing = true;
      return res.status(500).send({ errors: errors });
    }

    if (!clientData.newPasswordConfirmation) {
      errors.NewPasswordConfirmationMissing = true;
      return res.status(500).send({ errors: errors });
    }

    if (clientData.newPassword !== clientData.newPasswordConfirmation) {
      errors.PasswordsDoNotMatch = true;
      return res.status(500).send({ errors: errors });
    }

    try {
      const result = await AccountSettingsDataController.changePassword(
        clientData.userId,
        clientData.oldPassword,
        clientData.newPassword
      );

      if (!result || !result.success) {
        errors.FailedToChangePassword = true;
        return res.status(500).send({ errors: errors });
      }

      let success = result.success;
      res.status(200).send({ success });
    } catch (error) {
      console.log("Error occurred while attempting to delete account.", error);
      if (error.IncorrectPassword) {
        errors.IncorrectPassword = true;
      }
      errors.ExceptionError = true;
      return res.status(500).send({ errors: errors });
    }
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
