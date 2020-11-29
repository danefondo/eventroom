const { InvalidArgumentError, UnknownLogicError } = require("../../../utilities/Errors");

const User = require("../models/UserModel");

/**
 * Confirms, whether the user identified by the identifiers result in a unique 
 * @param {Object} userData contains allowed unique identifiers
 * @return {Object} If no match in DB, success===true, otherwise success===false and 
 */
async function confirmUniqueness(userData) {
  let searchArray = []
  fields = ["email", "username", "fbId", "googleId"];
  fields.forEach((key, index) => {
    if (userData[key]) {
      let obj = {}
      obj[key] = userData[key]
      searchArray.push(obj);
    }
  })
  if (!searchArray) {
    throw new InvalidArgumentError(String(userData));
  }
  user = await User.findOne({"$or": searchArray});
  if (!user) return {success: true}
  return { success: false, user: user}
}

/**
 * Handles the case when the user has logged in with another method + sanity checks
 * @param {*} userData 
 * @param {*} user 
 */
async function handleFoundUser(userData, user) {
  if (user.username && userData.username && user.username == userData.username) {
    return {success: false, message: "Username already exists"};
  }
  /*
  Cases:
  1. First, creates with username, then with provider
  2. First, creates with one provider, then with another provider
  3. First, creates with one provider, then with username

  In each case, emails have to match
  */
  if (user.email && userData.email && userData.email == user.email) {
    // Has logged in with FB before, now wants to register with same email but with an username, not FB auth
    if (user.username && user.fbId && userData.username) {
      
      const fbString = "fb"+String(fbId);
      if (fbString === user.username && fbString !== userData.username) {
        user.username = userData.username
        const secondResult = await confirmUniqueness({username: userData.username});
        if (!secondResult.success) {
          // Should only reach here if someone fucked up somewhere else
          return {success: false, message: "Username already exists"}
        }
        if (!userData.hashedPassword) {
          return {success: false, message: "No password provided"}
        }
        user.username = userData.username;
        user.password = userData.hashedPassword;
        const returnUser = await user.save();
        return {success: true, user: returnUser};
      }      
    }
    // Has logged in with Google before, now wants to register with same email but with an username, not Google auth
    if (user.username && user.googleId && userData.username) {
      if (!userData.hashedPassword) {
        return {success: false, message: "No password provided"}
      }
      const googleString = "google"+String(googleId);
      if (googleString === user.username && googleString !== userData.username) {
        user.username = userData.username
        const secondResult = await confirmUniqueness({username: userData.username});
        if (!secondResult.success) {
          // Should only reach here if someone fucked up somewhere else
          return {success: false, message: "Username already exists"}
        }
        
        user.username = userData.username;
        user.password = userData.hashedPassword;
        const returnUser = await user.save();
        return {success: true, user: returnUser};
      }
    }
    // Has logged in with Google before, now wants to register with same email, but with FB auth
    if (user.googleId && !user.fbId && userData.fbId) {
      user.fbId = userData.fbId;
      const returnUser = await user.save();
      return {success: true, user: returnUser};
    }
    // Has logged in with FB before, now wants to register with same email, but with Google auth
    if (user.fbId && !user.googleId && userData.googleId) {
      user.googleId = userData.googleId;
      const returnUser = await user.save();
      return {success: true, user: returnUser};
    }
  }
  return {success: false, message: "Unknown error"};
}

  

const UserDataController = {

  async createUser(userData) {
    const identificationResult = await confirmUniqueness(userData);
    console.log("@dbcreateuser, idresult:", identificationResult);
    if (!identificationResult.success) {
      const user = identificationResult.user;
      const handled = await handleFoundUser(userData, user);
      if (!handled.success) {
        console.log("Midagi mäda")
        throw new UnknownLogicError();
      }
      return handled.user;
    }
    const newUser = new User(userData);
    if (userData.googleId || userData.fbId) {
      newUser.verificationStatus = true;
    } else {
      newUser.verificationTokenExpiry = new Date(Date.now()+60*60000)
    }
    console.log("@dbcreateuser, newuser:", newUser);
    return Promise.all([
      newUser.save(),
    ])
  },

  async getUserByEmail(email) {
    const users = await User.find({ email: email }).select("+password").exec();
    // console.log("users: ", users);
    // console.log("type of users: ", typeof(users));
    if (users) {
      for (let i = 0; i < users.length; i++) {
        if (
          (!users[i].provider || users[i].provider === null) &&
          users[i].password != null
        ) {
          // console.log("return user", users[i]);
          // console.log("Type of return user", typeof(users[i]));
          return users[i];
        }
      }
    }
    console.log("Return null");
    return null;
  },
  async getUserByProviderId(provider, providerId) {
    if (provider === "google") {
      return User.findOne({"googleId": providerId}).exec();
    } else if (provider === "fb") {
      return User.findOne({"fbId": providerId}).exec();
    }
    throw new InvalidArgumentError(String({provider, providerId}));
  },
  async getUserById(id) {
    return User.findById(id).exec();
  },

  async checkIfUserExists(userData) {
    const result = await confirmUniqueness(userData);
    return !result.success;
  },
  async getUserByUsernameWithPassword(field, username) {
    return await User.findOne({ [field]: username })
      .select("+password")
      .exec();
  },
  async getUserByVerificationToken(verificationToken) {
    return await User.findOne({ verificationToken }).exec();
  }


}

module.exports = UserDataController;
