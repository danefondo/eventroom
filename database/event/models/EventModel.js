const mongoose = require('mongoose');
let Schema = mongoose.Schema;

const EventSchema = new Schema({
    // General data
    name: String,
    description: String,
    dateCreated: Date,
    
    // Creators and admins
    creatorId: mongoose.Types.ObjectId,
    hostId: mongoose.Types.ObjectId,

    // Scheduling
    scheduledStartTime: Date,
    scheduledEndTime: Date,     // not sure if needed

    // Rooms
    roomCreationAllowed: Boolean,
    rooms: [String],
});

const Event = module.exports = mongoose.model('Event', EventSchema);