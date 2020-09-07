const mongoose = require('mongoose');
let Schema = mongoose.Schema;

const EventSchema = new Schema({
    name: String,
    description: String,
    dateCreated: Date,
    creatorId: String,
    defaultRoomId: String,
    rooms: [String],
    scheduledTime: Date,
});

const Event = module.exports = mongoose.model('Event', EventSchema);