const mongoose = require("mongoose");
let Schema = mongoose.Schema;

const SessionSchema = new Schema({
  // User data
  userId: String,

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

  matchedPartnerId: String,
});

const Session = (module.exports = mongoose.model("Session", SessionSchema));
