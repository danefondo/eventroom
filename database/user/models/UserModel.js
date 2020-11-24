const mongoose = require("mongoose");
let Schema = mongoose.Schema;

const UserSchema = new Schema({
  // Auth
  username: String,
  email: String,
  password: {
    type: String,
    required: false, // unnecessary for FB, Google auth strategies
    select: false,
  },

  // Personal
  firstName: String,
  lastName: String,
  businessName: String,
  displayName: String,

  // Provider
  providerId: String,
  provider: String,

  // Verification
  verificationToken: String,
  verifiedStatus: Boolean,

  // Date
  dateCreated: Date,
  lastLogin: Date,

  // Reset
  resetToken: String,
  resetTokenExpires: Number,

  // User details
  bio: String,
  location: String,
  profileImage: {
    fileName: String,
    fileUrl: String,
    fileId: String,
  },
  eventrooms: [String],
  claimedEventrooms: [String],

  /* ====== COFOCUS ======*/

  // Sessions (ids)
  sessions: [String],
  lastTwentySessions: [],

  // Array to help prevent overlapping bookings (same time or 45m before/after range)
  bookedSessionTimes: [Date],

  // Session preferences
  sessionNotifications: [
    {
      notificationSound: String,
      notificationInterval: String,
      notificationMessage: String,
    },
  ],

  // Gamification
  completedSessions: [String],
  attendanceScore: Number,

  what: [Date],
});

const User = (module.exports = mongoose.model("User", UserSchema));
