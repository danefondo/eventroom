const { validationResult } = require('express-validator');
const Passport = require('passport');

const { createUser, getUserByUsernameWithPassword } = require('../../../database/user/controllers/UserDataController');
const { verifyPassword, hashPassword, generateToken, userInJWT, createRefreshToken, signToken } = require('../utilities/Utils');
const { login } = require('../strategies/jwt');
const { verifyRefreshToken, deleteRefreshToken, createNewUserRefreshToken } = require("../../../database/user/controllers/RefreshTokenController");

const MailUtilities = require('../../mail/utilities/MailUtilities');

/*====== Authentication helpers  ======*/
/** DO NOT move to Utils, creates circular dependency and all the accompanying sad stuff */
async function handleNoUser(req, refreshToken) {
	console.log("Handling no user")
  if (refreshToken) {
		console.log("@hnu refreshtoken exists")
		let newRefreshToken, verificationResult;
		try {
			newRefreshToken = await generateToken();
			verificationResult = await verifyRefreshToken(refreshToken, newRefreshToken);
		} catch (err) {
			console.log("@nouser errors:", err);
			return null;
		}
		console.log("@hnu verificationresult: ",verificationResult);
		if (verificationResult.success) {
			try {
				const returnUser = userInJWT(verificationResult.user);
				const newjwtToken = await login(req, returnUser); 
				console.log("@hnu returnuser", returnUser);
				console.log("@hnu newjwrt", newjwtToken);
				return {newjwtToken, newRefreshToken, user: returnUser};
			} catch (err) {
				console.log("@nouser errors:", err);
				return null;
			}
		}
		return null;
  }  
  return null
}

const loginWithTokens = async (req, res, returnUser) => {
  return Promise.all([createRefreshToken(returnUser._id.toString()), login(req, returnUser)])
		.then(result => {
			const refreshToken = result[0]; 
			const token = result[1];
			res.clearCookie('jwt');
			res.clearCookie('refresh');
			console.log("cookies cleared, refreshtoken:", refreshToken);
			console.log("cookies cleared, token:", token);
			return res.status(200)
				//.cookie('jwt', token, { httpOnly: true, sameSite: "None", secure: true, expires: new Date(Date.now() + JWT_EXPIRY) })   // sameSession?
				//.cookie('refresh', refreshToken, { httpOnly: true, sameSite: "None", secure: true, expires: new Date(Date.now() + REFRESH_EXPIRY)})
				.cookie('jwt', token, { httpOnly: true })   // sameSession?
				.cookie('refresh', refreshToken, { httpOnly: true })
				.json({ success: true, user: returnUser });
		})
		.catch(errors => {
			console.log("@lwt error:", errors);
			return res.status(500).send({error: "Internal server error"});
		});
};

const AuthController = {
	/**
	 * @param {*} req 
	 * @param {*} res 
	 * @return successful return contains 
	 * status 200
	 * cookie 'jwt' which contains signed jwt login token
	 * cookie 'refresh' which contains a new refreshtoken
	 * data: {success: true, user: returnUser}
	 */
  async registerHandler(req, res) {
      // Validating input
      console.log("@REGISTER")
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
          console.log("@fail")
          console.log(errors)
          return res.status(422).json({ errors: errors.array() });
      }
      // Creating a new user in the database
      return Promise.all([generateToken(), hashPassword(req.body.password)])
        .then(async result => {
          const verificationToken = result[0];
					const hashedPass = result[1];
					console.log("@register verificationtoken: ", verificationToken);
					console.log("@register hashedPass: ", hashedPass);
          let newUser;
          try {
            newUser = await createUser({
              username: req.body.username,
              email: req.body.email,
              verificationToken,
              password: hashedPass,
						});
          } catch (err) {
            console.log("@register err", err);
            return res.status(500).send({ error: "Internal server error - problem with creating the user"});
          }
          console.log("@register newUser", newUser);
          newUser = newUser[0];
          console.log("@register newUser 2: ", newUser);
          // Sending mail
          const link = `${req.protocol}://${req.body.hostname}/account/verify/${verificationToken}`;
          MailUtilities.sendVerificationMail(req.body.email, link);
          
          // Logging in
          const returnUser = userInJWT(newUser)
          return loginWithTokens(req, res, returnUser);
        })
        .catch(error => {
          console.log("@register final error: ", error)
          return res.status(500).send({ error: "Internal server error"});
        })
  },

	/**
	 * @param {*} req 
	 * @param {*} res 
	 * @return successful return contains 
	 * status 200
	 * cookie 'jwt' which contains signed jwt login token
	 * cookie 'refresh' which contains a new refreshtoken
	 * data: {success: true, user: returnUser}
	 */
  async loginHandler(req, res) {
		const errors = validationResult(req);
		console.log("@login\n", req.body);
		console.log("@login errors: ", errors);

		const { username, password } = req.body;

		// if there was an error in the validator, the user logged in via username
		const field = errors.isEmpty() ? 'email' : 'username';    

		// finding user and verifying input
		let user;
		try {
			user = await getUserByUsernameWithPassword(field, username);
			if (!user) {
					return res.status(400).send({error: "Wrong username or password"});
			}
		} catch (err) {         
			console.log("@login error1:", err);
			return res.status(500).send({error: "Internal server error"});
		}
		try {
			console.log("password, ", password);
			console.log("original pw: ", user.password);
			if (!(await verifyPassword(password, user.password))) {
				return res.status(401).send({error: "Wrong username or password"});
			}
		} catch (err) {
			console.log("@login error2: ", err);
			return res.status(500).send({error: "Internal server error"});
		}

		// creating tokens

		const returnUser = userInJWT(user);
		return loginWithTokens(req, res, returnUser);
  },
  
  async logoutHandler(req, res) {
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
					return res.status(500).send({ error: "internal server error" });
				} else if (logoutResult.n != 0 && logoutResult.ok == 0) {
					console.log("@logout error: could not delete document");
					return res.status(500).send({ error: "internal server error" });
				} 
			} catch (err) {
				return res.status(500).send({ error: "internal server error" });
			}
		} 
		return res.status(200).json({ success: true, message: 'User Logged out'});
		
  },

  
  /*
      Used to confirm logged in user data. Is ----> NOT <---- a middleware function
      response.data
          .status === 401 if no user found
          .user === returnUser if user found
  */
  async authenticationHandler(req, res, next) {
		console.log("@authentication handler")
		Passport.authenticate('jwt', { session: false, failureRedirect: "/account/login" }, async function (err, user, info) {
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
							//res.cookie('jwt', newTokens.newjwtToken, { httpOnly: true, sameSite: "None", secure: true, expires: new Date(Date.now() + JWT_EXPIRY) })   // sameSession?
							//res.cookie('refresh', newTokens.newRefreshToken, { httpOnly: true, sameSite: "None", secure: true, expires: new Date(Date.now() + REFRESH_EXPIRY) })
							.json({ success: true, user: newTokens.user });
					}
					return res.status(200)
						.json({success: false});
				} 
				return res.status(200)
					.json({success: false});
				
			} else {
				if (req && req.cookies && !req.cookies['refresh']) {
					
					console.log("@confirmauth creating new refreshtoken")
					let newRefreshToken;
					try {
						newRefreshToken = await generateToken();
						await createNewUserRefreshToken(user._id, newRefreshToken);
						req.user = user;
						res.cookie('refresh', newRefreshToken, { httpOnly: true });
					} catch (error) {
						console.log("@confirmauth error ", error);
						return next();
					}
				}
			}
			// console.log("@authenticate: user", user);
			return res.json({success: true, user: userInJWT(user)});
		})(req, res, next);
  },

  /*
      Middleware function to confirm that the request is allowed. Restricts access to API 
      response
          .status === 401 if no user found
          calls next if authentication was successful i.e. user is logged in
  */
  async confirmAuthentication(req, res, next) {
		console.log("@confirmauth")
		Passport.authenticate('jwt', { session: false, failureRedirect: "/account/login" }, async function (err, user, info) {
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
						req.user = user;
						res.cookie('jwt', newTokens.newjwtToken, { httpOnly: true })   // sameSession?
						res.cookie('refresh', newTokens.newRefreshToken, { httpOnly: true })
						//res.cookie('jwt', newTokens.newjwtToken, { httpOnly: true, sameSite: "None", secure: true, expires: new Date(Date.now() + JWT_EXPIRY) })   // sameSession?
						//res.cookie('refresh', newTokens.newRefreshToken, { httpOnly: true, sameSite: "None", secure: true, expires: new Date(Date.now() + REFRESH_EXPIRY) })
					} else {
						return res.status(401).send({ error: "Unauthorized." });
					}
				} else {
					return res.status(401).send({ error: "Unauthorized." });
				}
			} else {
				if (req && req.cookies && !req.cookies['refresh']) {
					
					console.log("@confirmauth creating new refreshtoken")
					let newRefreshToken;
					try {
						newRefreshToken = await generateToken();
						await createNewUserRefreshToken(user._id, newRefreshToken);
						req.user = user;
						res.cookie('refresh', newRefreshToken, { httpOnly: true });
					} catch (error) {
						console.log("@confirmauth error ", error);
						return next();
					}
				}
			}
			req.user = user;
			return next();
		})(req, res, next);
  },

  /*====== External auth controllers  ======*/

  /*---- Google handlers  ----*/

  async googleAuthHandler(req, res, next) {
      Passport.authenticate('google', {
          scope: [
          'https://www.googleapis.com/auth/userinfo.profile',
          'https://www.googleapis.com/auth/userinfo.email'
          ]
      }
      )(req,res,next);
  },

  async googleAuthCallback(req, res, next) {
      Passport.authenticate('google', { failureRedirect: '/auth/login' }, async function(err,user,info) {

          if (!user) {
              return res.status(401).send({ error: "could not authenticate" });
          }

          let refreshToken;
          try {
              refreshToken = await createRefreshToken(user._id.toString());
          } catch (err) {
              console.log("@gauthcb: err", err);
              return err;
          }
					return res.status(200)
							.cookie('jwt', signToken(user), { httpOnly: true })   // sameSession?
              .cookie('refresh', refreshToken, { httpOnly: true })
              //.cookie('jwt', signToken(user), { httpOnly: true, sameSite: "None", secure: true, expires: new Date(Date.now() + JWT_EXPIRY) })
              //.cookie('refresh', refreshToken, { httpOnly: true, sameSite: "None", secure: true, expires: new Date(Date.now() + REFRESH_EXPIRY) })
              .redirect("/");
          }
      )(req,res,next);
  },
  /*---- Facebook handlers  ----*/

  async facebookAuthHandler(req, res, next) {
      Passport.authenticate('facebook')(req,res,next);
  },

  async facebookAuthCallback(req, res, next) {
      Passport.authenticate('facebook', { failureRedirect: '/auth/login' }, async function(err,user,info) {
          let refreshToken;
          if (!user) {
              return res.status(401).send({ error: "could not authenticate" });
          }
          try {
              refreshToken = await createRefreshToken(user._id.toString());
          } catch (err) {
              console.log("fbcb: err", err);
              return err;
          }
					return res.status(200)
							.cookie('jwt', signToken(user), { httpOnly: true })   // sameSession?
              .cookie('refresh', refreshToken, { httpOnly: true })
              //.cookie('jwt', signToken(user), { httpOnly: true, sameSite: "None", secure: true, expires: new Date(Date.now() + JWT_EXPIRY) })
              //.cookie('refresh', refreshToken, { httpOnly: true, sameSite: "None", secure: true, expires: new Date(Date.now() + REFRESH_EXPIRY) })
              .redirect("/");
          }
      )(req,res,next);
  },
};

module.exports = { AuthController, loginWithTokens } ;