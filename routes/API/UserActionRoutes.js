
const Express = require('express');

const { AuthController } = require('../../auth/AuthController');
const UserActionUtilities = require('../../database/user/UserActionUtilities');

const router = Express.Router();

// Eventroom preferences configuration
router.post('/updateUserRoomPreferences', AuthController.confirmAuthentication, UserActionUtilities.updateUserRoomPreferences);

router.get('/getUserRoomPreferences', AuthController.confirmAuthentication, UserActionUtilities.getUserRoomPreferences);

module.exports = router;