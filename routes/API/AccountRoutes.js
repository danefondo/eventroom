const Express = require('express');
const Passport = require('passport');

const AccountController = require('../../controller/AccountController');
const TempUserController = require('../../controller/TempUserController');
const LoginRegisterController = require('../../controller/LoginRegisterController');
const AccountUtilities =  require('../../utils/AccountUtilities');

const AuthController = require('../../auth/AuthController');
const DataValidator = require('../../auth/DataValidator');

const router = Express.Router();

// router.post('/register', AccountUtilities.usernameToLowerCase, AccountUtilities.emailToLowerCase,  DataValidator.register, LoginRegisterController.register);

//router.get('/register/facebook', LoginRegisterController.registerFacebook);

// router.post('/register', AccountUtilities.usernameToLowerCase, AccountUtilities.emailToLowerCase, DataValidator.register, LoginRegisterController.register);

router.get('/verify/:verificationToken', AccountController.verifyToken);

router.get('/authenticate', function(req,res,next) {
    console.log("@authenticate req cookies vol1: ", req.cookies);
    next();
    },
    Passport.authenticate('jwt', {failureRedirect:'/login'}));

router.post('/login', AccountUtilities.usernameToLowerCase, AuthController.loginHandler);

router.post('/register', function(req,res,next) {
    console.log("req:", req);
    console.log("req.body:", req.body);
    console.log("req.withcredentials:", req.withCredentials);
    next();
    },
    DataValidator.register, AuthController.registerHandler);

// OLD

// router.get('/verify/:verificationToken', AccountController.verifyToken);

// router.post('/register', DataValidator.register, LoginRegisterController.register);

//router.post('/login', AccountUtilities.usernameToLowerCase, LoginRegisterController.login);

router.post('/createTempUser', TempUserController.createTempUser);




module.exports = router;