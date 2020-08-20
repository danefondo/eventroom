const Express = require('express');
const Passport = require('passport');

const AccountController = require('../../controller/AccountController');
const TempUserController = require('../../controller/TempUserController');
const AccountUtilities =  require('../../utils/AccountUtilities');

const AuthController = require('../../auth/AuthController');
const DataValidator = require('../../auth/DataValidator');

const router = Express.Router();

router.get('/verify/:verificationToken', AccountController.verifyToken);

router.get('/authenticate', AuthController.authenticationHandler);

router.post('/login', AccountUtilities.usernameToLowerCase, AuthController.loginHandler);

router.get('/logout', AuthController.logoutHandler);

router.post('/register', DataValidator.register, AuthController.registerHandler);


router.post('/createTempUser', TempUserController.createTempUser);




module.exports = router;