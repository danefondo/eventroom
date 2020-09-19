const mongoose = require('mongoose');
let Schema = mongoose.Schema;

const tempUserSchema = new Schema({
    associatedRoomId: String,
    tempUserToken: String,
    dateCreated: Date
});

const tempUser = module.exports = mongoose.model('TempUser', tempUserSchema);