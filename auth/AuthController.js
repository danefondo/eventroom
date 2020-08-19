const { validationResult } = require('express-validator');

const User = require('../database/user/UserModel');
const { createUser } = require('../database/user/UserUtilities');
const { verifyPassword, hashPassword, generateToken } = require('./Utils');
const { login } = require('./strategies/jwt');
const MailUtilities = require('../utils/MailUtilities');

const registerHandler = async (req, res) => {
    // Validating input
    // console.log("@ACr");
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log('errors', errors);
        return res.status(422).json({ errors: errors.array() });
    }
    // console.log("@ACr: here");
    // Creating a new user in the database
    let verificationToken, hashedPass;
    try {
        verificationToken = await generateToken();
        hashedPass = await hashPassword(req.body.password);
    } catch (error) {
        return res.status(500).send({ error: "Internal server error"});
    }
    // console.log("@ACr: token:", verificationToken);
    // console.log("@ACr: hashedpass: ", hashedPass);
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
    console.log("@ACr: user created: ", newUser);
    // Sending mail
    const link = `${req.protocol}://${req.body.hostname}/verify/${verificationToken}`;
    MailUtilities.sendVerificationMail(req.body.email, link);
    // console.log("@ACr: mail sent!");
    // Logging in
    let loginResult;
    try {
        loginResult = await login(req, newUser);
    } catch (err) {
        return res.status(500).send({ error: "Internal server error - problem with logging in"});
    }
    // console.log("@ACr: logged in");
    // console.log("@ACr: login cookie: ", loginResult);
    try {
        return res.status(200)
            .cookie('jwt', loginResult, {httpOnly: true}) // sameSession: true? 
            .json({success: true, data: '/'});
    } catch (err) {
        console.log("@ACr: error at return: ", err);
        return res.status(500).send({error: "Internal server error"});
    }
};

const loginHandler = async (req, res) => {
    const { username, password } = req.body;
    // console.log("@AC: ", username, password);
    let user;
    try {
        user = await User.findOne({username: username}).select('+password').exec();
        // console.log(user);
        if (!user) {
            // console.log("@ac: user does not exist");
            return res.status(400).send({error: "User does not exist"});
        }
    } catch (err) {
        // console.log("@ac: error", err);
        return res.status(500).send({error: "Internal server error"});
    }
    // console.log("@ac: user", user);
    // console.log("@ac: user pw", user.password);
    // console.log("@ac: user email:", user.email);
    try {
        if (!(await verifyPassword(password, user.password))) {
            // console.log("@ac: wrong un / pw");
            return res.status(401).send({error: "Wrong username or password"});
        }
    } catch (err) {
        // console.log("@ac: error verifying,", err);
        return res.status(500).send({error: "Internal server error"});
    }

    let token;
    try {
        token = login(req, user);
    } catch (err) {
        return res.status(500).send({error: "Internal server error"});
    }
    // console.log("@ac: token: ", token);
    return res.status(200)
        .cookie('jwt', token, { httpOnly: true })   // sameSession?
        .json({ success: true, data: "/"});
};


module.exports = { registerHandler, loginHandler };