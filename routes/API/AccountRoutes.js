const Express = require('express');
const AccountController = require('../../controller/AccountController');
const TempUserController = require('../../controller/TempUserController');
const LoginRegisterController = require('../../controller/LoginRegisterController');
const AccountUtilities =  require('../../utils/AccountUtilities');
const DataValidator = require('../../controller/DataValidator');

const router = Express.Router();

// router.post('/register', AccountUtilities.usernameToLowerCase, AccountUtilities.emailToLowerCase,  DataValidator.register, LoginRegisterController.register);
router.get('/verify/:verificationToken', AccountController.verifyToken);

//router.get('/register/facebook', LoginRegisterController.registerFacebook);

// router.post('/register', AccountUtilities.usernameToLowerCase, AccountUtilities.emailToLowerCase, DataValidator.register, LoginRegisterController.register);
router.post('/register', DataValidator.register, LoginRegisterController.register);

router.post('/login', AccountUtilities.usernameToLowerCase, LoginRegisterController.login);

router.post('/createTempUser', TempUserController.createTempUser);




module.exports = router;