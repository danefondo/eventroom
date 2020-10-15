const Express = require("express");

const {
  AuthController,
} = require("../../server/auth/controllers/AuthController");
const AccountSettingsController = require("../../server/settings/controllers/AccountSettingsController");

const DataValidator = require("../../server/auth/validators/DataValidator");

const router = Express.Router();

// Get AWS Signature
router.post("/getS3Signature", AccountSettingsController.getS3Signature);

// Get profile data
router.post(
  "/getProfileDataByUserId",
  AuthController.confirmAuthentication,
  AccountSettingsController.getProfileDataByUserId
);

// Upload profile image
router.post(
  "/saveProfileImageReference",
  AccountSettingsController.saveProfileImageReference
);

// Delete profile image
router.delete(
  "/deleteProfileImage",
  AccountSettingsController.deleteProfileImage
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
