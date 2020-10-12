const mongoose = require("mongoose");
let Schema = mongoose.Schema;

const EventroomSchema = new Schema({
  eventroomName: String,

  // eventId: mongoose.Types.ObjectId,

  hostId: String,
  // youtubePlaylists: [{youtubeVideoURL: String, youtubeVideoId}],
  dateCreated: Date,

  createdAt: {
    type: Date,
    expires: 86400,
    default: Date.now,
  },
  currentParticipantsIds: [String],
  allParticipantsIdsWhoHaveJoined: [String],
  anonParticipantsIdsWhoHaveJoined: [String],

  // sessionId: String,
  // sessionTokens: [String],
});

const Eventroom = (module.exports = mongoose.model(
  "Eventroom",
  EventroomSchema
));
