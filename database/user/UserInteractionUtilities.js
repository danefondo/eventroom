const UserInteraction = require('./models/UserInteractionModel');
const mongoose = require('mongoose');

const UserInteractionUtilities = {
  
  async createUserInteraction(user_id, userDisplayName, userUsername) {
    const userInteraction = await UserInteraction.findById(user_id).exec();
    if (userInteraction) {
      return Promise.reject("user interaction exists");
    }
    const newUserInteraction = new UserInteraction({
      _id: user_id,
      displayName: userDisplayName,
      username: userUsername,
    });
    return newUserInteraction.save();
  },

  async getProfileData(user_id) {
    const userInteraction = await UserInteraction.findById(user_id).exec();
    if (!userInteraction) {
      return Promise.reject("no user interaction with this id");
    }
    const returnObject = {
      following: userInteraction.followingsNumber,
      followers: userInteraction.followersNumber,
      bioText: userInteraction.bio,
      username: userInteraction.username,
    };
    return returnObject;
  },

  async isFollowed(user_id, userFollowingFirst) {
    const userInteraction = await UserInteraction.findById(user_id).exec();
    if (!userInteraction) {
      return Promise.reject("no user interaction with this id");
    }

    if (!userInteraction.followers) {
      console.log("@isfollowed false");
      return Promise.resolve(false);
    }
    let index = userInteraction.followers.indexOf(userFollowingFirst);
    if (index == -1) {
      // console.log("@isfollowed false2");
      return Promise.resolve(false);
    } else {
      // console.log("@isfollowed true");
      return Promise.resolve(true);
    }
  },

  async sendFollowList(profileUserId, nrOfLoadedProfiles, followers, NR_OF_RESPONSE_PROFILES) {
    user_id = mongoose.Types.ObjectId(profileUserId);
    const userInteraction = await UserInteraction.findById(user_id).exec();
    if (!userInteraction) {
      return Promise.reject("no user interaction");
    }
    let followIdList = [];
    let operationalArray;
    let allLoaded = false;
    if (followers && userInteraction.followers) {
      operationalArray = userInteraction.followers;
    } else if (!followers && userInteraction.followings) {
      operationalArray = userInteraction.followings;
    }
    if (operationalArray) {
      if (nrOfLoadedProfiles < operationalArray.length) {
        const beginIndex = nrOfLoadedProfiles;
        const endIndex = Math.min(beginIndex+NR_OF_RESPONSE_PROFILES, operationalArray.length);
        if (endIndex == operationalArray.length) allLoaded = true;
        followIdList = operationalArray.slice(beginIndex, endIndex);  
      }
    }
    
    return UserInteraction.find({'_id': {$in: followIdList}})
      .select('displayName username bio followersNumber followingsNumber upcomingPublicEventNumber pastPublicEventNumber')
      .exec()
      .then(function(result) {
        
        // console.log("@sflutil cb no error");
        // console.log("@sflutil query result: ", result);
        const responseObject = {
          success: true,
          followList: result,
          allLoaded,
        } 
        // console.log("@sflutil response", responseObject);
        return responseObject;
      })
      .catch(function(err) {
        console.log("@sflutil cb error", err);
        return err;
      });
    
  },

  async saveNewBioText(newBioText, userId) {
    user_id = mongoose.Types.ObjectId(userId);
    const userInteraction = await UserInteraction.findById(user_id).exec();
    if (!userInteraction) {
      console.log("@snbt utils no userinteraction");
    }
    // Just in case if somehow the user managed to do something suspicious.

    const BIO_TEXT_MAX_LENGTH = 240;
    if (newBioText.length > BIO_TEXT_MAX_LENGTH) {
      newBioText = newBioText.slice(0, BIO_TEXT_MAX_LENGTH);
    }

    userInteraction.bio = newBioText;

    return userInteraction.save();
  },
  
  async addFollower(user_id, followingUser_id) {
    user_id = mongoose.Types.ObjectId(user_id);
    followingUser_id = mongoose.Types.ObjectId(followingUser_id);
    const userInteraction = await UserInteraction.findById(user_id).exec();
    if (!userInteraction) {
      return Promise.reject("no user interaction");
    }

    if (userInteraction.followers) {
      userInteraction.followers.push(followingUser_id);
      userInteraction.followersNumber += 1;
    } else {
      userInteraction.followers = [followingUser_id];
      userInteraction.followersNumber = 1;
    }
    return userInteraction.save();
  },

  async addFollowing(user_id, followedUser_id) {
    user_id = mongoose.Types.ObjectId(user_id);
    followedUser_id = mongoose.Types.ObjectId(followedUser_id);
    const userInteraction = await UserInteraction.findById(user_id).exec();
    if (!userInteraction) {
      console.log("@adduserfollowed no user interaction");
      return Promise.reject("no user interaction");
    }

    if (userInteraction.followings) {
      userInteraction.followings.push(followedUser_id);
      userInteraction.followingsNumber += 1;
    } else {
      userInteraction.followings = [followedUser_id];
      userInteraction.followingsNumber = 1;
    }
    return userInteraction.save();
  },
  
  async removeFollower(user_id, unfollowingUser_id) {
    user_id = mongoose.Types.ObjectId(user_id);
    unfollowingUser_id = mongoose.Types.ObjectId(unfollowingUser_id);
    const userInteraction = await UserInteraction.findById(user_id).exec();
    if (!userInteraction) {
      return Promise.reject("no user interaction");
    }

    if (userInteraction.followers) {
      let index = userInteraction.followers.indexOf(unfollowingUser_id);
      if (index != -1) {
        userInteraction.followers.splice(index, 1);
        userInteraction.followersNumber -= 1;
      }
    } else {
      console.log("there are NO users following");
    }
    return userInteraction.save();
  },

  async removeFollowing(user_id, unfollowedUser_id) {
    user_id = mongoose.Types.ObjectId(user_id);
    unfollowedUser_id = mongoose.Types.ObjectId(unfollowedUser_id);
    const userInteraction = await UserInteraction.findById(user_id).exec();
    if (!userInteraction) {
      console.log("@removeuserfollowed no user interaction");
      return Promise.reject("no user interaction");
    }

    if (userInteraction.followings) {
      let index = userInteraction.followings.indexOf(unfollowedUser_id);
      if (index != -1) {
        userInteraction.followings.splice(index, 1);
        userInteraction.followingsNumber -= 1;
      }
    } else {
      console.log("there are NO users followed");
    }
    return userInteraction.save();
  },

};

module.exports = UserInteractionUtilities;