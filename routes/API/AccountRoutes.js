const Express = require('express');

const { AuthController } = require('../../server/auth/controllers/AuthController');
const PasswordResetController = require('../../server/auth/controllers/PasswordResetController');
const AccountController = require('../../server/account/controllers/AccountController');
const ConfigurationController = require('../../server/account/controllers/ConfigurationController');
const TempUserController = require('../../server/event/controllers/TempUserController');
const VerificationController = require("../../server/auth/controllers/VerificationController");

const AccountUtilities =  require('../../server/account/utilities/AccountUtilities');
const DataValidator = require('../../server/auth/validators/DataValidator');

const router = Express.Router();

// Verification
router.get('/verify/:verificationToken', VerificationController.verifyToken);

router.post('/resendemailverification', VerificationController.resendEmailVerification);

// Authentication
router.get('/authenticate', AuthController.authenticationHandler);

router.post('/login', AccountUtilities.usernameToLowerCase, DataValidator.login, AuthController.loginHandler);

router.get('/logout', AuthController.logoutHandler);

router.post('/register', AccountUtilities.usernameToLowerCase, DataValidator.register, AuthController.registerHandler);

router.get('/google', AuthController.googleAuthHandler);

router.get('/google/callback', AuthController.googleAuthCallback);

router.get('/facebook', AuthController.facebookAuthHandler);

router.get('/facebook/callback', AuthController.facebookAuthCallback);

// Password reset
router.post('/sendresetpasswordmail', DataValidator.forgotPass, PasswordResetController.sendResetPasswordMail);

router.get('/passresetredirect/:token', PasswordResetController.resetPasswordRedirect);

router.get('/passresetconfirmation', PasswordResetController.resetPasswordConfirmation);

router.post('/passreset', DataValidator.passwordReset, PasswordResetController.resetPassword);

// Profile
router.get('/profile/:username', AuthController.confirmAuthentication, AccountController.sendProfileData);

router.post('/follow', AuthController.confirmAuthentication, AccountController.followUser);

router.post('/unfollow', AuthController.confirmAuthentication, AccountController.unfollowUser);

router.get('/profileData/followList', AuthController.confirmAuthentication, AccountController.sendFollowList);

router.post('/profileData/saveBio', AuthController.confirmAuthentication, AccountController.saveNewBioText);


// Other 
router.post('/createTempUser', TempUserController.createTempUser);

// Configurations
router.get('/getuserconfigurations/eventroom/toolbarconfigurations', ConfigurationController.getEventroomToolbarConfigurations);

router.post('/setuserconfigurations/eventroom/toolbarconfigurations', ConfigurationController.setEventroomToolbarConfigurations);



module.exports = router;