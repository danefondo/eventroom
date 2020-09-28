const JWTStrategy = require('./jwt').strategy;
const GoogleStrategy = require('./google').strategy;
const FacebookStrategy = require('./facebook').strategy;

module.exports = { JWTStrategy, GoogleStrategy, FacebookStrategy };
