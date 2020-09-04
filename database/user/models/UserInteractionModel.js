const mongoose = require('mongoose');
let Schema = mongoose.Schema;

/**
 * This collection contains user interactions. The field '_id' is the db id of user this model belongs to. 
 * This collection *DOES NOT* contain the events followed by the user and other more detailed interactions.
 * 
 * This collection contains the following data
 * 
 * the bio of *this user*
 * users following *this user*
 * users followed by *this user*
 * number of upcoming public events hosted by *this user*
 * number of past public events hosted by *this user*
 */
const UserInteractionSchema = new Schema({
  _id: mongoose.Types.ObjectId,
  username: String,
  displayName: String,
  bio: { 
    type: String,
    maxLength: 240,
  },
  followers: [mongoose.Types.ObjectId],                   // array of user _id-s
  followersNumber: {
    type: Number,
    default: 0,
  },
  followings: [mongoose.Types.ObjectId],                  // array of user _id-s
  followingsNumber: {
    type: Number,
    default: 0,
  },
  upcomingPublicEventNumber: {
    type: Number,
    default: 0,
  },
  pastPublicEventNumber: {
    type: Number,
    default: 0,
  }
});

const UserInteraction = module.exports = mongoose.model('UserInteraction', UserInteractionSchema);