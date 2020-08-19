const Passport = require('passport');
const PassportJWT = require('passport-jwt');
const { to } = require('await-to-js');

const { getUserById } = require('../../database/user/UserUtilities');
const { signToken } = require('../Utils');

const JWTStrategy = PassportJWT.Strategy;

const strategy = () => {
  const strategyOptions = {
    jwtFromRequest: req => req.cookies.jwt,
    secretOrKey: process.env.JWT_SECRET,
    passReqToCallback: true,
  };
  console.log("@jwts: stuff");
  const verifyCallback = async (req, jwtPayload, cb) => {
    const [err, user] = await to(getUserById(jwtPayload.data.__id));

    if (err) return cb(err);

    req.user = user;

    return cb(null, user);

  };

  Passport.use(new JWTStrategy(strategyOptions, verifyCallback));
}

const login = (req, user) => {
  return new Promise((resolve, reject) => {
    req.login(user, {session: false}, err => {
      if (err) return reject(err);
      return resolve(signToken(user));
    });
  });
};

module.exports = { strategy, login };
