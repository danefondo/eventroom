const mongoose = require("mongoose");
let Schema = mongoose.Schema;

/**
 * Default devices record the device ID which will later be used for identifying the device
 * to activate inside a room
 * 
 */
const UserRoomPreferencesSchema = new Schema({
  userId: String,
  defaultCamera: String,
  defaultMicrophone: String,
  defaultSpeaker: String,
  showPreScreen: Boolean
});

const UserRoomPreferences = (module.exports = mongoose.model(
  "UserRoomPreferences",
  UserRoomPreferencesSchema
));
