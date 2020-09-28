const JWT = require('jsonwebtoken');

const { getUserById, getUserByUsername, getUserByVerificationToken } = require('../../../database/user/UserUtilities');
const { generateToken } = require('../../auth/utilities/Utils');

const UserInteractionUtilities = require('../../../database/user/UserInteractionUtilities');
const MailUtilities = require('../../mail/MailUtilities');


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
		
	async resendEmailVerification(req, res, next) {
		if (req.body && req.body.userId) {
			try {
				const user = await getUserById(req.body.userId);
				if (user && user.email) {
					const verificationToken = await generateToken();
					user.verificationToken = verificationToken;
					await user.save();
					const link = `${req.protocol}://${req.body.hostname}/verify/${verificationToken}`;
					MailUtilities.sendVerificationMail(user.email, link);
					return res.status(200).send({ success: true });
				}
			} catch (err) {
				console.log(err);
				return res.status(200).send({ success: true });
			}
		}
		return res.status(500).send({ error: "internal server error" });
	},

	async sendProfileData(req, res) {
		// console.log("@send", req.params);
		const isOwner = req.user.username === req.params.username;
		// console.log("@send isOwner: ", isOwner);
		let user, isFollowed;
		if (isOwner) {
			user = req.user;
		} else {
			try {
				user = await getUserByUsername(req.params.username);	// TODO: escape params or smth
				// console.log("@send user:", user);
			} catch (err) {
				console.log("@send err", err);
				return res.status(500).send({error: "internal server error"});
			}
			if (!user) {
				return res.status(404).send({error: "user does not exist"});
			}
		}
		
		return Promise.all([
			UserInteractionUtilities.getProfileData(user._id),
			UserInteractionUtilities.isFollowed(user._id, req.user._id),
		]).then(result => {
			// console.log("@send isfollowed: ", result[1]);
			const returnObject = {
				success: true,
				userId: user._id,
				followers: result[0].followers,
				following: result[0].following,
				bioText: result[0].bioText,
				isFollowed: result[1],
			};
			// console.log("@send returnobject: ", returnObject);
			return res.status(200).send(returnObject);
		}).catch(err => {
			console.log("@spd error", err);
			return res.status(500).send({success: false, error: "internal server error"});
		})
	},
	
	async followUser(req, res) {
		const userToFollow = req.body.followUserId;
		const userWhoFollows = req.user._id.toString();

		return Promise.all([
				UserInteractionUtilities.addFollower(userToFollow, userWhoFollows), 
				UserInteractionUtilities.addFollowing(userWhoFollows, userToFollow)
			])
			.then(result => {
				return res.status(200).send({ success: true });
			})
			.catch(err => {
				console.log("@followuser error: ", err);
				return res.status(500).send({ success: false, error: "internal server error" });
			})
	},

	async unfollowUser(req, res) {
		const userToUnfollow = req.body.unfollowUserId;
		const userWhoUnfollows = req.user._id.toString();

		return Promise.all([
				UserInteractionUtilities.removeFollower(userToUnfollow, userWhoUnfollows), 
				UserInteractionUtilities.removeFollowing(userWhoUnfollows, userToUnfollow)
			])
			.then(result => {
				return res.status(200).send({ success: true });
			})
			.catch(err => {
				console.log("@followuser error: ", err);
				return res.status(500).send({ success: false, error: "internal server error" });
			})
	},

	/**
	 * Sends back a list of profiles.  
	 * @param {*} req params: 
	 * 	profileUserId - id of the user whose follow list is requested
	 * 	followers - true, if followers are requested, false, if followings are requested
	 * 	nrOfLoadedProfiles - how many profiles have already been loaded
	 * @param {*} res 
	 * @return {*} object 
	 * {
	 * 	success: whether the request was successful
	 * 	followList: {
	 * 		displayName, 
	 * 		username,
	 * 		bio,
	 * 		followersNumber, 
	 * 		followingsNumber, 
	 * 		upcomingPublicEventNumber, 
	 * 		pastPublicEventNumber
	 * 	}
	 * 	allLoaded: whether all profiles have been loaded
	 * }
	 */
	async sendFollowList(req, res) {
		const NR_OF_RESPONSE_PROFILES = 50;
		// console.log("@sfl query:", req.query);
		
		const profileUserId = req.query.profileUserId;
		const followers = req.query.followers === "true";
		const nrOfLoadedProfiles = Number(req.query.nrOfLoadedProfiles);
		// console.log("@sfl data", profileUserId, followers, nrOfLoadedProfiles);
		let response;
		try {
			response = await UserInteractionUtilities.sendFollowList(profileUserId, nrOfLoadedProfiles, followers, NR_OF_RESPONSE_PROFILES);
			// console.log("@sfl FINISHED");
		} catch (err) {
			console.log("@sfl error: ", err);
			return res.status(500).send({ success: false,  error: "internal server error" });
		}
		if (response) {
			// console.log("@sfl response: ", response);
			return res.status(200).send(response);
		}
		console.log("@sfl no response");
		return res.status(200).send();
	},

	async saveNewBioText(req, res) {
		// console.log("@snbt req body", req.body);
		// console.log("@snbt req user: ", req.user._id);

		if (!(req && req.body)) {
			return res.status(400).send({ error: "invalid request" });
		}

		return UserInteractionUtilities.saveNewBioText(req.body.newBioText, req.user._id)
			.then( result => {
				return res.status(200).send({ success: true });
			})
			.catch( err => {
				console.log("err");
				return res.status(500).send({ error: "internal server error" });
			})

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
