const Express = require('express');
const AccountController = require('../../controller/AccountController');
const LoginRegisterController = require('../../controller/LoginRegisterController');
const AccountUtilities =  require('../../utils/AccountUtilities');
const DataValidator = require('../../controller/DataValidator');

const router = Express.Router();

// router.post('/register', AccountUtilities.usernameToLowerCase, AccountUtilities.emailToLowerCase,  DataValidator.register, LoginRegisterController.register);

router.post('/register', AccountUtilities.usernameToLowerCase, AccountUtilities.emailToLowerCase,  LoginRegisterController.register);

router.post('/login', AccountUtilities.usernameToLowerCase, LoginRegisterController.login);

router.post('/verify/:verificationToken', AccountController.verifyToken);


module.exports = router;