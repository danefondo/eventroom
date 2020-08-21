const Passport = require('passport');
const Crypto = require('crypto');
const JWT = require('jsonwebtoken');
const Bcrypt = require('bcryptjs')
const Dotenv = require('dotenv');

const User = require('../database/user/UserModel');

Dotenv.config();

/*====== Passport setup  ======*/

const setup = () => {
    Passport.serializeUser((user, done) => done(null, user._id));

    Passport.deserializeUser(async (id, done) => {
        try {
            const user = await User.findById(id);
            return done(null, user);
        } catch (err) {
            return done(err, null);
        }
    });
};

/*====== Crypto helpers  ======*/

const signToken = (user) => {
    return JWT.sign({data: user}, process.env.JWT_SECRET, {expiresIn:'1d'});
};

const hashPassword = function(password) {
    return new Promise((resolve, reject) => {
        Bcrypt.genSalt(10, function(err, salt) {
            Bcrypt.hash(password, salt, function(err, hash) {
                return err ? reject(err) : resolve(hash);
            });
        });
    });
};

const generateToken = function() {
    return new Promise(function(resolve, reject) {
        Crypto.randomBytes(32, function(ex, buf) {
            if (ex) {
                reject();
            }
             const token = buf.toString('hex');
             console.log("Generated token: ", token);
             resolve(token);
        })
    })
};

const verifyPassword = async (candidate, actual) => {
    return await Bcrypt.compare(candidate, actual);
};

module.exports = { setup, signToken, hashPassword, generateToken, verifyPassword }; 