const Passport = require('passport');
const PassportGoogle = require('passport-google-oauth');

const { getUserByProviderId, createUser } = require('../../../database/user/UserUtilities');
const { userInJWT } = require('../utilities/Utils');

const GoogleStrategy = PassportGoogle.OAuth2Strategy

const strategy = () => {
  const strategyOptions = {
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: `${process.env.SERVER_API_URL}/accounts/google/callback`
  }

  const verifyCallback = async (accessToken, refreshToken, profile, done) => {
    let user;
    try {
      user = await getUserByProviderId(profile.id);
    } catch (err) {
      console.log("@gstrat err: ", err)
      return done(err, user);
    }
    if (user) {
      return done(null, userInJWT(user));
    }

    const verifiedEmail = profile.emails.find(email => email.verified) || profile.emails[0];

    try {
      const createdUser = await createUser({
        provider: profile.provider,
        providerId: profile.id,
        firstName: profile.name.givenName,
        lastName: profile.name.familyName,
        displayName: profile.displayName,
        username: profile.displayName,
        email: verifiedEmail.value,
        password: null,
        verifiedStatus: true,
      });
      // console.log("@gstrat new user:", createdUser);
      return done(null, userInJWT(createdUser));
    } catch (err) {
      return done(err, null);
    }
  }

  Passport.use(new GoogleStrategy(strategyOptions, verifyCallback))
}

module.exports = { strategy };
