const Crypto = require('crypto');
const Bcrypt = require('bcryptjs');

const { checkIfUserWithValueExists } = require('../database/user/UserUtilities');

const AccountUtilities = {
	usernameToLowerCase(req, res, next){
		// also strip it from spaces
		let username = req.body.username;
		req.body.username = username.replace(/\s+/g, '');
		req.body.username = req.body.username.toLowerCase();
		next();
	},

}

module.exports = AccountUtilities;