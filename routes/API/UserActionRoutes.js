
const Express = require('express');

const { AuthController } = require('../../server/auth/controllers/AuthController');
const UserActionUtilities = require('../../database/user/UserActionUtilities');

const router = Express.Router();

// Eventroom preferences configuration
router.post('/updateUserRoomPreferences', AuthController.confirmAuthentication, UserActionUtilities.updateUserRoomPreferences);

router.post('/updateUserPreScreenPreference', AuthController.confirmAuthentication, UserActionUtilities.updateUserPreScreenPreference);

// Using 'post' for getting data to pass data through body
router.post('/getUserRoomPreferences', AuthController.confirmAuthentication, UserActionUtilities.getUserRoomPreferences);

module.exports = router;