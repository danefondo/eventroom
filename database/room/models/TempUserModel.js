const mongoose = require("mongoose");
let Schema = mongoose.Schema;

const tempUserSchema = new Schema({
  associatedRoomName: String,
  tempUserToken: String,
  tempUserDisplayName: String,
  dateCreated: Date,
  createdAt: {
    type: Date,
    expires: 86400,
    default: Date.now,
  },
});

const tempUser = (module.exports = mongoose.model("TempUser", tempUserSchema));
