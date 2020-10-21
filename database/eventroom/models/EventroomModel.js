const mongoose = require("mongoose");
let Schema = mongoose.Schema;

// Events are not rooms. Events are scheduled, rooms are assigned and used for events.

let EventroomSchema = new Schema({
  eventroomName: String,

  creatorId: String,

  hostId: String,
  coHosts: [String],
  dateCreated: Date,

  createdAt: {
    type: Date,
    default: Date.now,
  },

  // youtubePlaylists: [
  //   {
  //     videoUrl: String,
  //     videoId: String,
  //     name: String,
  //     description: String,
  //   },
  // ],

  permissions: {
    canAccessWithoutHostPresent: Boolean,
    canAccessWithoutOwnerPresent: Boolean,
    requiresPassword: Boolean,
    requiresUser: Boolean,
    requiresVerification: Boolean,
    requiresFriendship: Boolean,
    requiresKnocking: Boolean,
    requiresPayment: Boolean,
  },

  roomPassword: String,
  roomPasswordEnabled: Boolean,

  currentParticipantsIds: [String],
  allParticipantsIdsWhoHaveJoined: [String],
  anonParticipantsIdsWhoHaveJoined: [String],

  expireAt: { type: Date, default: Date.now, expires: 86400 },

  ownerId: String,
  ownerUsername: String,

  cofocusSessionId: String,

  // sessionId: String,
  // sessionTokens: [String],
});

const Eventroom = (module.exports = mongoose.model(
  "Eventroom",
  EventroomSchema
));
