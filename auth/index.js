const utils = require('./Utils');
const strategies = require('./strategies/Index');

const pipe = (...functions) => args => functions.reduce((arg, fn) => fn(arg), args)

const initialiseAuthentication = app => {
  utils.setup()

  pipe(strategies.GoogleStrategy, strategies.FacebookStrategy, strategies.JWTStrategy)(app)
}

module.exports =  { utils, initialiseAuthentication, strategies }
