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
  displayName: String,
  firstName: String,
  lastName: String,
  businessName: String,

  // External providers
  googleId: String,
  fbId: String,

  // Date
  createdAt: {
    type: Date,
    default: Date.now(),
  },

  lastLogin: Date,

  verificationStatus: {
    type: Boolean,
    default: false,
  },
  verificationToken: String,
  verificationTokenExpiry: Date,

  // Reset
  resetToken: String,
  //Date
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

  preferences: {
    theme: {
      type: String,
      default: "light",
    },

    general: {
      directMatchRequests: {
        type: Boolean,
        default: true,
      },
    },

    matchingPreferences: {
      workType: {
        preference: {
          type: Number,
          default: 0,
        },
        priority: {
          type: Number,
          default: 0,
        },
      },
      microphone: {
        preference: {
          type: Number,
          default: 0,
        },
        priority: {
          type: Number,
          default: 1,
        },
      },
      screenshare: {
        preference: {
          type: Number,
          default: 0,
        },
        priority: {
          type: Number,
          default: 2,
        },
      },
    },

    preferPeopleFromLists: {
      type: Boolean,
      default: false,
    },
    preferPeopleFromGroups: {
      type: Boolean,
      default: false,
    },
    preferSimilarActivity: {
      type: Boolean,
      default: false,
    },

    calendarPreferences: {
      prefer24HourFormat: {
        type: Boolean,
        default: false,
      },
      preferRealTimeUpdates: {
        type: Boolean,
        default: true,
      },
      rematchingEnabled: {
        type: Boolean,
        default: true,
      },
    },
    // Session preferences
    sessionNotifications: {
      type: Array,
      default: [
        {
          notificationSound: {
            type: String,
            default: "default",
          },
          // notificationInterval: String,
          // notificationMessage: String,
        },
      ],
    },
  },

  groups: [
    {
      groupId: String,
      priority: Number,
    },
  ],

  lists: [
    {
      listId: String,
      priority: Number,
    },
  ],
  blocked: [String],
  doNotMatchAgain: [String],

  // Gamification
  completedSessions: [String],
  attendanceScore: Number,

  what: [Date],
});

const User = (module.exports = mongoose.model("User", UserSchema));
