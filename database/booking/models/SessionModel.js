const mongoose = require("mongoose");
let Schema = mongoose.Schema;

const SessionSchema = new Schema({
  // General data
  assignedTasks: [String],
  assignedProjectIds: [String],

  // Scheduled time
  dateTime: Date,

  // Session configurations
  // Chosen length of session, which determines end of session time
  sessionInterval: Number,

  /* First core partner data */
  firstPartnerId: String,
  firstPartnerUsername: String,
  firstPartnerFirstName: String,
  firstPartnerLastName: String,
  firstPartnerDisplayName: String,
  firstPartnerProfileImageUrl: String,
  firstPartnerProfileImageUrlSmall: String,
  firstPartnerSessionCustomTitle: String,

  firstPartnerSessionData: {
    partnerJoinedOnce: Boolean,
    partnerJoinedDuringSession: Boolean,
    partnerWasLate: Boolean,
    partnerWasEarly: Boolean,
    partnerLatenessInMS: Number,
    partnerEarlinessInMS: Number,
    partnerTimestamps: [],
    partnerTotalTimeInSessionInMS: [],

    partnerAttendanceSuccessful: Boolean,

    originalPartnerHasRematched: Boolean,
    originalPartnerHasCanceled: Boolean,
  },

  /* Second core partner data */
  secondPartnerId: String,
  secondPartnerUsername: String,
  secondPartnerFirstName: String,
  secondPartnerLastName: String,
  secondPartnerDisplayName: String,
  secondPartnerProfileImageUrl: String,
  secondPartnerProfileImageUrlSmall: String,
  secondPartnerSessionCustomTitle: String,

  secondPartnerSessionData: {
    partnerJoinedOnce: Boolean,
    partnerJoinedDuringSession: Boolean,
    partnerWasLate: Boolean,
    partnerWasEarly: Boolean,
    partnerLatenessInMS: Number,
    partnerEarlinessInMS: Number,
    partnerTimestamps: [],
    partnerTotalTimeInSessionInMS: [],

    partnerAttendanceSuccessful: Boolean,

    originalPartnerHasRematched: Boolean,
    originalPartnerHasCanceled: Boolean,
  },

  /* Session status */
  sessionHasStarted: Boolean,
  sessionHasFinished: Boolean,

  sessionIsMatched: Boolean,

  sessionThroughMatching: Boolean,

  // In case of group sessions
  manyMatchedPartnerIds: [String],

  sessionPartnerLimit: Number,

  // 0 = two people session
  // 1 = 2-10 people session
  // 2 = 2-25 people session
  // 3 = 2-50 people session-server
  // sessionType can be used to determine which video setup to use
  sessionType: Number,

  sessionRoomInitiated: Boolean,

  sessionURL: String,

  eventroomId: String,

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Session = (module.exports = mongoose.model("Session", SessionSchema));
