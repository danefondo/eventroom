const { validationResult, check } = require('express-validator');
const AccountUtilities = require('../utils/AccountUtilities')
const MailUtilities = require('../utils/MailUtilities');
const JWT = require('jsonwebtoken');
const Passport = require('passport');
const User = require('../models/UserModel');

const LoginRegisterController = {

	async register(req, res) {
		console.log("start here!");
		console.log("---------------------------------");
		//console.log("req: ", req);
		const errors = validationResult(req);
		console.log("Errors: ", errors);
		console.log(req.errors);
		console.log("---------------------------------");
		if (!errors.isEmpty()) {
			console.log('errors', errors)
			return res.status(422).json({ errors: errors.array() });
		}
		const email = req.body.email;
		const username = req.body.username;
		const password = req.body.password;
		const dateCreated = new Date();
		const hostname = req.body.hostname;
		console.log("username: ", username, "password: ", password);
		try {
            const verificationToken = await AccountUtilities.generateToken();
            const hashedPass = await AccountUtilities.hashPassword(password);

			let newUser = new User({
				email,
				verifiedStatus: false,
				verificationToken,
				username,
				password: hashedPass,
				dateCreated
			});
			
            await newUser.save();
            
            const link = `${req.protocol}://${hostname}/verify/${verificationToken}`;
            MailUtilities.sendVerificationMail(email, link);
            
            const user = { username: newUser.username, _id: newUser._id}
			const token = JWT.sign({ user: user }, process.env.SECRET, {
				expiresIn: '1d',
			});
			return res.status(200).json({ user, token });
		} catch (err) {
			console.log(err);
		}
    },
	
	/*
	Validates the registration
	*/
	async validateRegistration(req, res, next) {
		console.log("here11");
		check('username').trim()
			.not().isEmail().withMessage("Username cannot be an email address");
		check('email').trim()
			.isEmail();
		check('password').trim()
			.isLength({min: 8, max: 80});

		next();
	},

	async login(req, res, next) {
        Passport.authenticate('local', { session: false }, function (err, user, info) {
			console.log("user", user);
            if (err) { 
				console.log("err1", err);
				return next(err) }
            if (!user) {
				console.log("no user");
                return res.status(401).send({ error: "Your username and/or password is incorrect." });
            }
            req.login(user, { session: false }, function (err) {
                if (err) { 
					console.log("err2", err);
					return next(err) }
                const theUser = {
                    username: user.username,
                    _id: user._id
                }
                const token = JWT.sign({ user: theUser }, process.env.SECRET, {
                    expiresIn: '30d',
                });
                return res.json({ user: theUser, token });
            });
        })(req, res, next);
	}

};

module.exports = LoginRegisterController;
