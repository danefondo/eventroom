const mongoose = require('mongoose');
let Schema = mongoose.Schema;

const EventSchema = new Schema({
    name: String,
    description: String,
    dateCreated: Date,
});

const Event = module.exports = mongoose.model('Event', EventSchema);