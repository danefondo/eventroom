const mongoose = require("mongoose");
let Schema = mongoose.Schema;

const SessionSchema = new Schema({

  // General data
  title: String,
  assignedTasks: [String],
  assignedProjectIds: [String],

  // Session configurations
  sessionLength: Number,

  // Scheduling
  scheduledDate: Date,
  scheduledStartTime: String,
  scheduledEndTime: String,


  // This is to quickly query everyone else's sessions
  rawDateTime: Date,

  // String to speed up database lookup + easy calendar display
  // in the format of 'yearNumber-monthNumber-dayNumber-startTime-endTime'
  // e.g. '2020-10-25-08:15-23:45'
  queryDateTime: String,

  firstPartnerId: String,
  firstPartnerUsername: String,
  firstPartnerFirstName: String,
  firstPartnerLastName: String,
  firstPartnerDisplayName: String,

  secondPartnerId: String,
  secondPartnerUsername: String,
  secondPartnerFirstName: String,
  secondPartnerLastName: String,
  secondPartnerDisplayName: String,

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
  sessionCustomName: String,

  eventroomId: String,

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Session = (module.exports = mongoose.model("Session", SessionSchema));