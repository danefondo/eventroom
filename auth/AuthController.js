const { validationResult } = require('express-validator');
const Passport = require('passport');

const User = require('../database/user/UserModel');
const { createUser } = require('../database/user/UserUtilities');
const { verifyRefreshToken, deleteRefreshToken } = require('../database/user/UserRefreshTokenUtilities');

const { verifyPassword, hashPassword, generateToken, userInJWT, createRefreshToken } = require('./Utils');
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
    let loginResult, refreshToken;
    try {
        loginResult = await login(req, userInJWT(newUser));
    } catch (err) {
        return res.status(500).send({ error: "Internal server error - problem with logging in"});
    }
    
    try {
        refreshToken = await createRefreshToken(newUser._id.toString());
    } catch (err) {
        console.log("errors", err)
        return res.status(500).send({error: "Internal server error"});
    }

    res.clearCookie('jwt');
    res.clearCookie('refresh');
    try {
        return res.status(200)
            .cookie('jwt', loginResult, {httpOnly: true}) // sameSession: true? 
            .cookie('refresh', refreshToken, {httpOnly: true}) // sameSession: true? 
            .json({success: true, data: '/'});
    } catch (err) {
        return res.status(500).send({error: "Internal server error"});
    }
};

const loginHandler = async (req, res) => {
    const errors = validationResult(req);

    const { username, password } = req.body;

    // if there was an error in the validator, the user logged in via username
    const field = errors.isEmpty() ? 'email' : 'username';    

    // finding user and verifying input
    let user;
    try {
        user = await User.findOne({[field]: username}).select('+password').exec();
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

    // creating tokens

    const returnUser = userInJWT(user);
    return Promise.all([createRefreshToken(user._id.toString()), login(req, returnUser)])
        .then(result => {
            const refreshToken = result[0]; 
            const token = result[1];

            res.clearCookie('jwt');
            res.clearCookie('refresh');
            return res.status(200)
                .cookie('jwt', token, { httpOnly: true })   // sameSession?
                .cookie('refresh', refreshToken, { httpOnly: true })
                .json({ success: true, user: returnUser, data: "/"});
        })
        .catch(errors => {
            return res.status(500).send({error: "Internal server error"});
        });
};
 
const logoutHandler =  async (req, res) => {
    let refreshToken;
    if (req && req.cookies) {
        refreshToken = req.cookies['refresh'];
    }

    res.clearCookie('jwt');
    res.clearCookie('refresh');
    if (refreshToken) {
        try {
            const logoutResult = await deleteRefreshToken(refreshToken);
            if (logoutResult.n > 1) {
                console.log("@logout error: matching documents");
                res.status(500).send({ error: "internal server error" });
            } else if (logoutResult.n != 0 && logoutResult.ok == 0) {
                console.log("@logout error: could not delete document");
                res.status(500).send({ error: "internal server error" });
            } 
        } catch (err) {
            res.status(500).send({ error: "internal server error" });
        }
    } 
    res.status(200).json({ success: true, message: 'User Logged out'});
    
};

/*
    Used to confirm logged in user data. Is ----> NOT <---- a middleware function
    response
        .status === 401 if no user found
        .user === returnUser if user found
*/
const authenticationHandler = async (req, res, next) => {
    Passport.authenticate('jwt', { session: false, failureRedirect: "/login" }, async function (err, user, info) {
        if (err) {
            res.status(500).send({error: "Internal server error"});
        }
        if (!user) {
            if (req && req.cookies) {
                jwt = req.cookies['jwt'];
                refreshToken = req.cookies['refresh'];
                
                const newTokens = await handleNoUser(req, refreshToken);

                res.clearCookie('refresh');
                if (newTokens) {
                    return res.status(200)
                        .cookie('jwt', newTokens.newjwtToken, { httpOnly: true })   // sameSession?
                        .cookie('refresh', newTokens.newRefreshToken, { httpOnly: true })
                        .json({ success: true, user: newTokens.user, data: "/"});
                }
                return res.status(200)
                    .json({success: false});
            } 
            return res.status(200)
                .json({success: false});
            
        }
        return res.json({success: true, user});
    })(req, res, next);
};

/*
    Middleware function to confirm that the request is allowed. Restricts access to API 
    response
        .status === 401 if no user found
        calls next if authentication was successful i.e. user is logged in
*/
const confirmAuthentication = async (req, res, next) => {
    Passport.authenticate('jwt', { session: false, failureRedirect: "/login" }, async function (err, user, info) {
        if (err) {
            res.status(500).send({error: "Internal server error"});
        }
        
        if (!user) {
            if (req && req.cookies) {
                refreshToken = req.cookies['refresh'];
                const newTokens = await handleNoUser(req, refreshToken);

                res.clearCookie('jwt');
                res.clearCookie('refresh');
                if (newTokens) {
                    user = newTokens.user;
                    res.cookie('jwt', newTokens.newjwtToken, { httpOnly: true })   // sameSession?
                    res.cookie('refresh', newTokens.newRefreshToken, { httpOnly: true })
                } else {
                    return res.status(401).send({ error: "Unauthorized." });
                }
            } else {
                return res.status(401).send({ error: "Unauthorized." });
            }
        } 
        return next();
    })(req, res, next);
};


/*====== Authentication helpers  ======*/
/** DO NOT move to Utils, creates circular dependency and all the accompanying sad stuff */
const handleNoUser = async (req, refreshToken) => {
    console.log("@nouser----------------------------");
    if (refreshToken) {
        console.log("@nouser jwt available");
        let newRefreshToken, verificationResult;
        try {
            newRefreshToken = await generateToken();
            verificationResult = await verifyRefreshToken(refreshToken, newRefreshToken);
        } catch (err) {
            console.log("@nouser errors:", err);
            return null;
        }

        console.log("@nouser verificationResult:", verificationResult);

        if (verificationResult.success) {
            console.log("@nouser user:", verificationResult.user);
            const returnUser = userInJWT(verificationResult.user);
            console.log("@nouser returnuser:", returnUser);
            const newjwtToken = await login(req, returnUser); 
            return {newjwtToken, newRefreshToken, user: returnUser};
        }
        return null;
    }  
    return null
};

module.exports = { registerHandler, loginHandler, logoutHandler, authenticationHandler, confirmAuthentication };