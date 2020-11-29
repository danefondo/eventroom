const { getUserById, getUserByVerificationToken } = require('../../../database/user/controllers/UserDataController');
const { generateToken } = require('../utilities/Utils');

const MailUtilities = require('../../mail/utilities/MailUtilities');


const VerificationController = {
	async verifyToken(req, res, next) {
		const { verificationToken } = req.params;
		try {
			const user = await getUserByVerificationToken(verificationToken);
			if (!user) {
				return res.status(401).send({ error: "verification.ensure-account"});
      }
      if (!user.verificationTokenExpiry) {
        return res.status(500).send({ error: "Verification failed due to invalid database state" });
      }
      if (user.verificationTokenExpiry < Date.now()) {
        return res.status(401).send({ error: "Verification token has been expired"})
      }
      user.verificationStatus = true;
      user.verificationTokenExpiry = null;
      user.verificationToken = null;
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
          user.verificationTokenExpiry = new Date(Date.now()+ 60*60000)
					await user.save();
					const link = `${req.protocol}://${req.body.hostname}/account/verify/${verificationToken}`;
					MailUtilities.sendVerificationMail(user.email, link);
					return res.status(200).send({ success: true });
				}
			} catch (err) {
				console.log(err);
				return res.status(200).send({ success: true });
			}
		}
		return res.status(500).send({ error: "internal server error" });
  }
}

module.exports = VerificationController;