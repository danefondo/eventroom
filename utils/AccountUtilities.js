const Crypto = require('crypto');
const Bcrypt = require('bcryptjs');

const User = require('../models/UserModel');

const AccountUtilities = {
	generateToken() {
		return new Promise(function(resolve, reject) {
			Crypto.randomBytes(32, function(ex, buf) {
				if (ex) {
					reject();
				}
		 		const token = buf.toString('hex');
		 		console.log("Generated token: ", token);
		 		resolve(token);
			})
		})
	},

	hashPassword(password) {
		return new Promise((resolve, reject) => {
			Bcrypt.genSalt(10, function(err, salt) {
				Bcrypt.hash(password, salt, function(err, hash) {
					return err ? reject(err) : resolve(hash);
				});
			});
		})
	},

	usernameToLowerCase(req, res, next){
		// also strip it from spaces
		let username = req.body.username;
		req.body.username = username.replace(/\s+/g, '');
		req.body.username = req.body.username.toLowerCase();
		next();
	},
	
	emailToLowerCase(req, res, next){
		// also strip it from spaces
		let email = req.body.email;
		req.body.email = email.replace(/\s+/g, '');
		req.body.email = req.body.email.toLowerCase();
		next();
	},

	checkIfUserWithValueExists(field, value) {
		// for checking whether various information, such as username or email give results to detect whether the email is already used or not
		return new Promise((resolve, reject) => {
			User.findOne({ [field]: value }, function (err, user) {
				if (err) {
					return reject(err);
				}
				return user ? resolve(true) : resolve(false);
			})
		})
	},

	async checkUnique(req, res) {
		let value = req.body.value;
		let field = req.body.field;
		console.log('value', value, field);
		let message = '';
		try {
			let fail = await AccountUtilities.checkIfUserWithValueExists(field, value);

			field = field[0].toUpperCase() + field.substring(1)
			if (fail) {
				message = `${field} already taken.`;
			} else {
				message = `${field} available.`;
			}
			res.json({
				fail: fail,
				message: message
			});
		} catch (error) {
			console.log(error);
			res.json({
				message: "An error occurred, we're fixing this now"
			});
		}
	},

    async sendResetPass(req, res) {

	},

	async resendEmailVerification(req, res) {

	}
}

module.exports = AccountUtilities;