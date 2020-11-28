const Passport = require('passport');
const PassportFacebook = require('passport-facebook');

const { getUserByProviderId, createUser } = require('../../../database/user/controllers/UserDataController');
const { userInJWT } = require('../utilities/Utils');

const FacebookStrategy = PassportFacebook.Strategy;

const strategy = () => {
  const strategyOptions = {
    clientID: process.env.FACEBOOK_CLIENT_ID,
    clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
    callbackURL: `${process.env.SERVER_API_URL}/accounts/facebook/callback`,
    profileFields: ['id', 'displayName', 'name', 'emails']
  };

  const verifyCallback = async (accessToken, refreshToken, profile, done) => {
    let user;
    try {
      user = await getUserByProviderId("fb", profile.id);
    } catch (err) {
      console.log("@fstrat err: ", err)
      return done(err, user);
    }
    if (user) {
      return done(null, userInJWT(user));
    }
    const fbUsername = "fb"+String(profile.id);
    try {
      const createdUser = await createUser({
        provider: profile.provider,
        providerId: profile.id,
        firstName: profile.name.givenName,
        lastName: profile.name.familyName,
        displayName: profile.displayName,
        username: fbUsername,
        email: profile.emails ? profile.emails[0].value : null,
        password: null,
        verifiedStatus: true,
      });
      // console.log("@fstrat new user:", createdUser);
      return done(null, userInJWT(createdUser));
    } catch (err) {
      console.log("@fstrat new user wrror: ", err);
      return done(err, null);
    }
  }

  Passport.use(new FacebookStrategy(strategyOptions, verifyCallback))
}

module.exports = { strategy };
