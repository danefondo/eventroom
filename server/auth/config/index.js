const utils = require('../utilities/Utils');
const GoogleStrategy = require('../strategies/google').strategy;
const FacebookStrategy = require('../strategies/facebook').strategy;
const JWTStrategy = require('../strategies/jwt').strategy;

const pipe = (...functions) => args => functions.reduce((arg, fn) => fn(arg), args)

const initialiseAuthentication = app => {
  utils.setup()

  pipe(GoogleStrategy, FacebookStrategy, JWTStrategy)(app)
}

strategies = {
  GoogleStrategy,
  FacebookStrategy,
  JWTStrategy
};

module.exports =  { utils, initialiseAuthentication, strategies }
