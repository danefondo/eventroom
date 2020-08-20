
const User = require('../database/user/UserModel')
const JWT = require('jsonwebtoken');
// AUTHENTICATION STUFF WILL BE MOVED TO /auth/AuthController
const AccountController = {
	async verifyToken(req, res, next) {
		const { verificationToken } = req.params;
		User.findOne({ verificationToken }, (verifyError, user) => {
			if (verifyError) {
				console.log('DB error', verifyError);
				return res.status(500).json({ message: "verification.error-occurred" });
			}
			if (!user) {
				console.log('Please ensure you have created an account');
				return res.status(401).json({ message: "verification.ensure-account" });
			}
		
			user.verifiedStatus = true;
			user.save((err, savedUser) => {
				const tokenUser = { username: savedUser.username, _id: savedUser._id }
				const token = JWT.sign({ user: tokenUser }, process.env.SECRET, {
					expiresIn: '1d',
				});
				return res.status(200).json({ user: user, token, message: "verification.verified" });
			})
		});
    },
    
    async resetPassword(req, res) {

    },

    async deleteAccount(req, res) {

    },  

    async updateName(req, res) {

    }, 

    async updateUsername(req, res) {

    }, 

    async updateDescription(req, res) {

    }, 

    async updateEmail(req, res) {

    }, 

    async updateSocial(req, res) {

    }, 
};

module.exports = AccountController;
