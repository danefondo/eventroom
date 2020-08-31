const JWT = require('jsonwebtoken');

const { getUserByUsername, getUserByVerificationToken } = require('../database/user/UserUtilities');
// AUTHENTICATION STUFF WILL BE MOVED TO /auth/AuthController
const AccountController = {
	async verifyToken(req, res, next) {
		const { verificationToken } = req.params;
		try {
			const user = await getUserByVerificationToken(verificationToken);
			if (!user) {
				return res.status(401).send({ error: "verification.ensure-account"});
			}
			user.verifiedStatus = true;
			return user.save()
				.then(() => res.status(200).send({ success:true, message: "verification.verified" }))
				.catch(err => res.status(500).send({error: "internal server error"}));
		} catch (err) {
			return res.status(500).send({ error: "internal server error"});
		}
  },
		
	async sendProfileData(req, res) {
		console.log("@send", req.params);
		const isOwner = req.user.username === req.params.username;
		console.log("@send isOwner: ", isOwner);
		let user;
		if (isOwner) {
			user = req.user;
		} else {
			try {
				user = await getUserByUsername(req.params.username);	// TODO: escape params or smth
				console.log("@send user:", user);
			} catch (err) {
				console.log("@send err", err);
				return res.status(500).send({error: "internal server error"});
			}
			if (!user) {
				return res.status(404).send({error: "user does not exist"});
			}
		}
		
		
		// FURTHER PROCESSING
		return res.status(200).send({user});
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
