const mongoose = require('mongoose');
let Schema = mongoose.Schema;


const RoomSchema = new Schema({
    eventId: mongoose.Types.ObjectId,

    hostId: String,             
    // youtubePlaylists: [{youtubeVideoURL: String, youtubeVideoId}],
    dateCreated: Date,

    sessionId: String,
    sessionTokens: [String],
    
});



const Room = module.exports = mongoose.model('Room', RoomSchema);