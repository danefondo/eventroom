const UserRefreshToken = require('../models/RefreshTokenModel');

const { getUserById } = require('./UserDataController');

const REFRESH_TOKEN_EXPIRY_DAYS = 7;




const deleteRefreshToken = async function(refreshToken) {
  return await UserRefreshToken.deleteOne({'refreshToken':refreshToken});
};

/*====== Verifying refresh tokens  ======*/

/**
 * Verifies the given refresh token and replaces it with a new one.
 */
const verifyRefreshToken = async function(refreshToken, newRefreshToken) {
  const token = await UserRefreshToken.findOne({'refreshToken': refreshToken}).exec();
  if (!token || !token.refreshToken || !refreshToken || token.refreshToken != refreshToken || token.blacklisted) {
    return { success: false };
  }

  
  // update the refreshtoken and reset the expiration timer
  token.expireAt = new Date(Date.now() + 7*8.64e7);
  token.refreshToken = newRefreshToken;
  
  return Promise.all([getUserById(token.userId), token.save()])
    .then(result => {
      return {success: true, user: result[0]};
    })
    .catch(error => {
      return {success: false, user: null, error: error};
    });
};


/*====== Creation of new refresh tokens ======*/


/**
 * Creates a new user refresh toke for given user and client. 
 * Finds all refreshtokens and synchronously deletes old ones.   
 * 
 */
const createNewUserRefreshToken = async function(userId, newToken) {
  const currentTokenArray = await UserRefreshToken.find({userId: userId}).sort({'clientId' : 1}).exec();
  // console.log("@cnurt: query result:", currentTokenArray);

  let newRefreshToken;
  if (currentTokenArray === undefined || currentTokenArray.length == 0) {
    newRefreshToken = new UserRefreshToken({
      userId,
      clientId: 0,
      refreshToken: newToken
    });
  
    await newRefreshToken.save();
    return true;
  } else {
    let clientId = currentTokenArray.length;
    for (let i=0; i<currentTokenArray.length; i++) {
      if (currentTokenArray[i].clientId != i) {
        clientId = i;
        break;
      }
    }

    newRefreshToken = new UserRefreshToken({
      userId, 
      clientId,
      refreshToken: newToken
    })
  }

  return newRefreshToken.save()
    .then( result => true)
    .catch( error => {
      console.log("@createrefreshtoken, error: ", error);
      return false;
    })
};





module.exports = { createNewUserRefreshToken, verifyRefreshToken, deleteRefreshToken };