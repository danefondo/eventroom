const { validationResult } = require('express-validator');
const Passport = require('passport');

const User = require('../database/user/UserModel');
const { createUser } = require('../database/user/UserUtilities');
const { verifyPassword, hashPassword, generateToken } = require('./Utils');
const { login } = require('./strategies/jwt');
const MailUtilities = require('../utils/MailUtilities');

const registerHandler = async (req, res) => {
    // Validating input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }
    // Creating a new user in the database
    let verificationToken, hashedPass;
    try {
        verificationToken = await generateToken();
        hashedPass = await hashPassword(req.body.password);
    } catch (error) {
        return res.status(500).send({ error: "Internal server error"});
    }
    let newUser;
    try {
        newUser = await createUser({
            username: req.body.username,
            firstName: "firstname",
            lastName: "lastname",
            email: req.body.email,
            verificationToken,
            hashedPassword: hashedPass,
        });
    } catch (err) {
        return res.status(500).send({ error: "Internal server error - problem with creating the user"});
    }
    // Sending mail
    const link = `${req.protocol}://${req.body.hostname}/verify/${verificationToken}`;
    MailUtilities.sendVerificationMail(req.body.email, link);
    
    // Logging in
    let loginResult;
    try {
        loginResult = await login(req, newUser);
    } catch (err) {
        return res.status(500).send({ error: "Internal server error - problem with logging in"});
    }
    try {
        return res.status(200)
            .cookie('jwt', loginResult, {httpOnly: true}) // sameSession: true? 
            .json({success: true, data: '/'});
    } catch (err) {
        return res.status(500).send({error: "Internal server error"});
    }
};

const loginHandler = async (req, res) => {
    const { username, password } = req.body;
    let user;
    try {
        user = await User.findOne({username: username}).select('+password').exec();
        if (!user) {
            return res.status(400).send({error: "User does not exist"});
        }
    } catch (err) {
        return res.status(500).send({error: "Internal server error"});
    }
    try {
        if (!(await verifyPassword(password, user.password))) {
            return res.status(401).send({error: "Wrong username or password"});
        }
    } catch (err) {
        return res.status(500).send({error: "Internal server error"});
    }

    let token;
    try {
        token = await login(req, user);
    } catch (err) {
        return res.status(500).send({error: "Internal server error"});
    }

    const returnUser = {
        username: user.username,
        _id: user._id,
        isVerified: user.verifiedStatus,
        displayName: user.displayName,
    };

    return res.status(200)
        .cookie('jwt', token, { httpOnly: true })   // sameSession?
        .json({ success: true, user: returnUser, data: "/"});
};

const logoutHandler =  async (req, res) => {
    res.clearCookie('jwt');
    res.status(200).json({ success: true, data: 'User Logged out'});
};

const authenticationHandler = async (req, res, next) => {
    Passport.authenticate('jwt', { session: false, failureRedirect: "/login" }, function (second_req, user) {
        if (!user) {
            console.log("no user");
            return res.status(401).send({ error: "Unauthorized." });
        }

        const returnUser = {
            username: user.username,
            _id: user._id,
            isVerified: user.verifiedStatus,
            displayName: user.displayName,
        };
        return res.json({ user: returnUser});
    })(req, res, next);
};


module.exports = { registerHandler, loginHandler, logoutHandler, authenticationHandler };