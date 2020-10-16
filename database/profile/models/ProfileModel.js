const mongoose = require("mongoose");
let Schema = mongoose.Schema;

const ProfileSchema = new Schema({
  userId: String,
  displayName: String,
  firstName: String,
  lastName: String,
  username: String,
  email: String,
  bio: String,
  location: String,
  profileImage: {
    fileName: String,
    fileUrl: String,
  },
  eventrooms: [String],
  sessionsCount: Number,
});

const Profile = (module.exports = mongoose.model("Profile", ProfileSchema));

// How long it lasted
// Who was in it
// Name
// Description
// Any other details, e.g. music listened to, videos watched