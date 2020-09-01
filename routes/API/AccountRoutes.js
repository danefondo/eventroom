const Express = require('express');

const { AuthController } = require('../../auth/AuthController');
const PasswordResetController = require('../../auth/PasswordResetController');
const AccountController = require('../../account/AccountController');
const TempUserController = require('../../controller/TempUserController');

const AccountUtilities =  require('../../account/AccountUtilities');
const DataValidator = require('../../auth/DataValidator');

const router = Express.Router();

router.get('/verify/:verificationToken', AccountController.verifyToken);

router.get('/profile/:username', AuthController.confirmAuthentication, AccountController.sendProfileData);


router.get('/authenticate', AuthController.authenticationHandler);

router.post('/login', AccountUtilities.usernameToLowerCase, DataValidator.login, AuthController.loginHandler);

router.get('/logout', AuthController.logoutHandler);

router.post('/register', AccountUtilities.usernameToLowerCase, DataValidator.register, AuthController.registerHandler);

// Password reset
router.post('/sendresetpasswordmail', DataValidator.forgotPass, PasswordResetController.sendResetPasswordMail);

router.get('/passresetredirect/:token', PasswordResetController.resetPasswordRedirect);

router.get('/passresetconfirmation', PasswordResetController.resetPasswordConfirmation);

router.post('/passreset', DataValidator.passwordReset, PasswordResetController.resetPassword);



router.post('/createTempUser', TempUserController.createTempUser);

router.get('/google', AuthController.googleAuthHandler);

router.get('/google/callback', AuthController.googleAuthCallback);

router.get('/facebook', AuthController.facebookAuthHandler);

router.get('/facebook/callback', AuthController.facebookAuthCallback);



module.exports = router;