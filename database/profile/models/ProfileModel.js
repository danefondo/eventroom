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
  eventrooms: [],
  sessionsCount: Number,
});

const Profile = (module.exports = mongoose.model("Profile", ProfileSchema));
