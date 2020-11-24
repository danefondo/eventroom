const Express = require("express");

const {
  AuthController,
} = require("../../server/auth/controllers/AuthController");
const AccountSettingsController = require("../../server/settings/controllers/AccountSettingsController");

const DataValidator = require("../../server/auth/validators/DataValidator");

const router = Express.Router();

// Get ImageKit Signature
router.get(
  "/getImageKitSignature",
  AccountSettingsController.getImageKitSignature
);

// Get profile data
router.post(
  "/getProfileDataByUserId",
  AuthController.confirmAuthentication,
  AccountSettingsController.getProfileDataByUserId
);

// Update profile settings
router.post(
  "/updateProfileSettings",
  AuthController.confirmAuthentication,
  AccountSettingsController.updateProfileSettings
);

// Change account password
router.post(
  "/changePassword",
  AuthController.confirmAuthentication,
  AccountSettingsController.changePassword
);

// Delete account
router.post(
  "/deleteAccount",
  AuthController.confirmAuthentication,
  AccountSettingsController.deleteAccount
);

module.exports = router;
