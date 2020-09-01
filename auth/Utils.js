const Passport = require('passport');
const Crypto = require('crypto');
const JWT = require('jsonwebtoken');
const Bcrypt = require('bcryptjs')
const Dotenv = require('dotenv');

const { createNewUserRefreshToken } = require('../database/user/UserRefreshTokenUtilities');
const { getUserById } = require('../database/user/UserUtilities');

Dotenv.config();

/*====== Passport setup  ======*/

const setup = () => {
    Passport.serializeUser((user, done) => done(null, user._id));

    Passport.deserializeUser(async (id, done) => {
        try {
            const user = await getUserById(id);
            return done(null, user);
        } catch (err) {
            return done(err, null);
        }
    });
};



/*====== Data in JWT  ======*/

const userInJWT = function(user) {
    const returnUser = {
        username: user.username,
        _id: user._id,
        isVerified: user.verifiedStatus,
        displayName: user.displayName,
    };

    return returnUser;
};

/*====== Crypto helpers  ======*/

const signToken = function(user){
    return JWT.sign({data: user}, process.env.JWT_SECRET, {expiresIn:'30min'});
};

const verifyToken = function(token) {
    try { 
        const decoded = JWT.verify(token, process.env.JWT_SECRET);
        decoded.success = true;
        return decoded;
    } catch (err) {
        return {success: false, error: err};
    }
}

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




/*====== Refresh token helpers  ======*/

/**
 * Creates refresh token. First, checks whether a refreshtoken already exists 
 * for the given user and given client (we have just one client). 
 * If so, replaces the token and returns the new one. 
 * 
 * Refresh token expires in 7 days. 
 * 
 * Otherwise creates a new refreshtoken and returns the token 
 * @param {*} userId
 * @returns refreshtoken
 */
const createRefreshToken = async function(userId) {
    const clientId = 1;
    const token = await generateToken();
    try {
        const success = await createNewUserRefreshToken(userId, token);
        if (success) {
            return token;
        } 
    } catch (err) {
        console.log("@crt: error", err);
        throw err;
    }
    return null;
    
};



module.exports = { setup, signToken, verifyToken, hashPassword, 
    generateToken, verifyPassword, userInJWT, createRefreshToken }; 