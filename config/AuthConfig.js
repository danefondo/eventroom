const Passport = require('passport');
const JWT = require('jsonwebtoken');

const ensureAuthenticated = Passport.authenticate('jwt', { session: false });

const checkAuthenticated = (req, res, next) => {
  const { authorization } = req.headers;
  if (authorization && !authorization.includes('null')) {
    const token = req.headers.authorization.split('Bearer ')[1];
    const decoded = JWT.verify(token, process.env.SECRET)
    if (decoded.user) {
      req.user = decoded.user;
    }
  }
  next();
}

const checkTempToken = (req, res, next) => {
  const { authorization } = req.headers;
  if (authorization && !authorization.includes('null')) {
    const tempToken = req.headers.authorization.split('BearerTemp ')[1];
    const decoded = JWT.verify(tempToken, process.env.SECRET)
    if (decoded.tempHost) {
      req.tempHost = decoded.tempHost;
    }
  }
  next();
}


module.exports = {
    ensureAuthenticated,
    checkAuthenticated,
    checkTempToken
}