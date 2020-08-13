const { validationResult } = require('express-validator');
const AccountUtilities = require('../utils/AccountUtilities')
const MailUtilities = require('../utils/MailUtilities');
const JWT = require('jsonwebtoken');
const Passport = require('passport');
const User = require('../models/UserModel');

const LoginRegisterController = {

	async register(req, res) {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			console.log('errors', errors)
			return res.status(422).json({ errors: errors.array() });
		}
		const email = req.body.email;
		const username = req.body.username;
		const password = req.body.password;
		const dateCreated = new Date();

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
            
            const link = `${req.protocol}://${req.get('host')}/verify/${verificationToken}`;
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
