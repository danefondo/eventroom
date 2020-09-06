const mongoose = require('mongoose');
let Schema = mongoose.Schema;


const RoomSchema = new Schema({
    name: String,
    description: String,
    instructions: String,       // future
    hostId: String,             
    videoUrl: String,           // future 
    videoId: String,            
    youtubeId: String,              
    // youtubePlaylists: [{youtubeVideoURL: String, youtubeVideoId}],
    dateCreated: Date,
    dateEnded: Date,
    location: String,
    currentParticipants: [String],
    publicStatus: String,
    sessionId: String,
    sessionTokens: [String],
    parentEventId: String
});



const Room = module.exports = mongoose.model('Room', RoomSchema);