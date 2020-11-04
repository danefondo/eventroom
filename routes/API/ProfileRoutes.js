const Express = require("express");
const ProfileController = require("../../server/profile/controllers/ProfileController");

const router = Express.Router();

// Update profile data by user id
router.post("/updateProfileByUserId", ProfileController.updateProfileByUserId);

// Get profile data by user id
router.post("/getProfileByUserId", ProfileController.getProfileByUserId);

// Get the data of many profiles by user ids
router.post(
  "/getManyProfilesByUserIds",
  ProfileController.getManyProfilesByUserIds
);

// Save profile image reference
router.post(
  "/saveProfileImageReference",
  ProfileController.saveProfileImageReference
);


module.exports = router;
