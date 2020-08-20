const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const LocalStrategy = require('passport-local').Strategy;
const User = require('../database/user/UserModel');
const bcrypt = require('bcryptjs');
const userRegex = /^[A-Za-z0-9]+$/;
const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,20})+$/;

module.exports = function (passport) {
  // jwt Strategy
  passport.use(new LocalStrategy(function (username, password, done) {
    // check is username is used as username
    if (!(userRegex).test(username)) {
      // check if email is used as username
      if (!(emailRegex).test(username)) {
        return done(null, false, { message: 'Your username and/or password is incorrect.' });
      } else {
        let query = { email: username };

        User.findOne(query).select('+password').exec(function (err, user) {
          if (err) throw err;
          if (!user) {
            return done(null, false, { message: 'No user found' });
          }
          // Match Password
          bcrypt.compare(password, user.password, function (err, isMatch) {
            if (err) throw err;
            if (isMatch) {
              return done(null, user);
            } else {
              return done(null, false, { message: 'Wrong password' });
            }
          });
        });
      }

    } else {
      let query = { username: username };

      User.findOne(query).select('+password').exec( function (err, user) {
        console.log(`Login error: ${err}`)
        if (err) throw err;
        if (!user) {
          return done(null, false, { message: 'No user found' });
        }
        // Match Password
        bcrypt.compare(password, user.password, function (err, isMatch) {
          if (err) throw err;
          if (isMatch) {
            return done(null, user);
          } else {
            return done(null, false, { message: 'Wrong password' });
          }
        });
      });
    }

  }));

  passport.use(new JwtStrategy({
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.SECRET
  },
    function (jwtPayload, cb) {
      //find the user in db if needed. This functionality may be omitted if you store everything you'll need in JWT payload.
      return cb(null, jwtPayload.user);
    }
  ));
}