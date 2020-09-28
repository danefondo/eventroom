const UserRefreshToken = require('../models/UserRefreshTokenModel');

const { getUserById } = require('./UserUtilities');

const REFRESH_TOKEN_EXPIRY_DAYS = 7;



const deleteRefreshToken = async function(refreshToken) {
  return await UserRefreshToken.deleteOne({'clientRefreshToken.refreshToken':refreshToken});
};

/*====== Verifying refresh tokens  ======*/

/**
 * Verifies the given refresh token and replaces it with a new one.
 */
const verifyRefreshToken = async function(refreshToken, newRefreshToken) {
  const token = await UserRefreshToken.findOne({'clientRefreshToken.refreshToken': refreshToken}).exec();
  if (!token || !token.clientRefreshToken.refreshToken || !refreshToken || token.clientRefreshToken.refreshToken != refreshToken) {
    return { success: false };
  }

  // Checking validity of given refresh token, if too old, delete all too old tokens for this user
  const now = new Date();
  if (token.clientRefreshToken.refreshTokenExpiry < now) {
    deleteOldRefreshTokens(token.userId);
    return { success: false, user: null };
  }
  const expiryDate = new Date(Date.now() + REFRESH_TOKEN_EXPIRY_DAYS*8.64e+7);     // 1 week from now

  token.clientRefreshToken.refreshTokenExpiry = expiryDate;
  token.clientRefreshToken.refreshToken = newRefreshToken;
  
  return Promise.all([getUserById(token.userId), token.save()])
    .then(result => {
      return {success: true, user: result[0]};
    })
    .catch(error => {
      return {success: false, user: null, error: error};
    });
};


/*====== Creation of new refresh tokens ======*/


const deleteOldRefreshTokens = (userId) => {
  return new Promise((resolve, reject) => {
    const now = new Date();
    UserRefreshToken.deleteMany({userId: userId, 'clientRefreshToken.refreshTokenExpiry': {$lte: now}})
      .then( () => resolve(true))
      .catch( (err) => reject(err));
  });
};

const addNewRefreshToken = (userId, clientId, token, expiryDate) => {

  return new Promise((resolve, reject) => {
    const newToken = new UserRefreshToken({
      userId,
      clientRefreshToken: {
        clientId,
        refreshToken: token,
        refreshTokenExpiry: expiryDate
      }
    });
    newToken.save(err => reject(err));
    resolve(true);
  });
};

/**
 * Creates a new user refresh toke for given user and client. 
 * Finds all refreshtokens and synchronously deletes old ones.   
 * 
 */
const createNewUserRefreshToken = async function(userId, newToken) {
  const currentTokenArray = await UserRefreshToken.find({userId: userId}).sort({'clientRefreshToken.clientId' : 1}).exec();
  // console.log("@cnurt: query result:", currentTokenArray);

  const expiryDate = new Date(Date.now() + REFRESH_TOKEN_EXPIRY_DAYS*8.64e+7);     // 1 week from now

  if (currentTokenArray === undefined || currentTokenArray.length == 0) {
    const newRefreshToken = new UserRefreshToken({
      userId,
      clientRefreshToken: {
        clientId: 0,
        refreshToken: newToken,
        refreshTokenExpiry: expiryDate
      },
    });
  
    await newRefreshToken.save();
    return true;
  } 

  let clientId = currentTokenArray.length;
  for (let i=0; i<currentTokenArray.length; i++) {
    if (currentTokenArray[i].clientRefreshToken.clientId != i) {
      clientId = i;
      break;
    }
  }

  return Promise.all([deleteOldRefreshTokens(userId), addNewRefreshToken(userId, clientId, newToken, expiryDate)])
    .then(result => {
      return true;
    })
    .catch(errors => {
      return false;
    });  
};





module.exports = { createNewUserRefreshToken, verifyRefreshToken, deleteRefreshToken };