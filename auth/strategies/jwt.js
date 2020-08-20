const Passport = require('passport');
const PassportJWT = require('passport-jwt');
const { to } = require('await-to-js');

const { getUserById } = require('../../database/user/UserUtilities');
const { signToken } = require('../Utils');

const JWTStrategy = PassportJWT.Strategy;

const strategy = () => {
  const strategyOptions = {
    jwtFromRequest: req => {
      let token = null;
      if (req && req.cookies) { token = req.cookies['jwt'];}
      console.log("@strat: token", token);
      return token;
    },
    secretOrKey: process.env.JWT_SECRET,
    passReqToCallback: true,
  };
  
  const verifyCallback = async (req, jwtPayload, cb) => {
    console.log("@strat payload: ", jwtPayload);
    const [err, user] = await to(getUserById(jwtPayload.data._id));
    if (err) return cb(err);

    console.log("@strat user: ", user);
    req.user = user;
    return cb(null, user);

  };

  Passport.use(new JWTStrategy(strategyOptions, verifyCallback));
}

const login = (req, user) => {
  console.log("@jwtlogin: req: ", req.body, req.header);
  console.log("@jwtlogin: user: ", user);
  return new Promise((resolve, reject) => {
    req.login(user, {session: false}, err => {
      if (err) return reject(err);
      console.log("@jwtlogin: user, token: ", user, signToken(user));
      return resolve(signToken(user));
    });
  });
};

module.exports = { strategy, login };
