const mongoose = require("mongoose");
let Schema = mongoose.Schema;

const AccountSettingsSchema = new Schema({
  userId: String,
  displayName: String,
  firstName: String,
  lastName: String,
  bio: String,
  location: String,
  username: String,
  email: String,
  profileImage: {
    fileName: String,
    fileUrl: String,
  },
  eventrooms: [],
  sessionsCount: Number,
});

const AccountSettings = (module.exports = mongoose.model(
  "AccountSettings",
  AccountSettingsSchema
));
