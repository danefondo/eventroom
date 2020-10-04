const AccessToken = require("twilio").jwt.AccessToken;
const VideoGrant = AccessToken.VideoGrant;

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

const client = require("twilio")(accountSid, authToken);

const TwilioUtilities = {
  /**
   * Generate an Access Token for a chat application user provided via the url
   */
  generateTwilioAccessToken(identity) {
    // Create an access token which we will sign and return to the client,
    // containing the grant we just created.
    let token = new AccessToken(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_EVENTROOM_TO_API_SID_KEY,
      process.env.TWILIO_EVENTROOM_TO_API_SECRET_KEY
    );
    // Assign the generated identity to the token.
    token.identity = identity;

    // Grant the access token Twilio Video capabilities.
    var grant = new VideoGrant();
    token.addGrant(grant);

    return token;
  },

  /*
    Some available options when creating a room:
    
    let options = {
      recordParticipantsOnConnect: true, // only works w/ groups & small groups
      enableTurn: true,
      statusCallback: "http://example.org",
      type: "peer-to-peer",
      uniqueName: "YourUniqueRoomName",
    }

    * Not all rooms allow for all options: 
    * https://www.twilio.com/docs/video/tutorials/understanding-video-rooms#comparing-room-types
    
    Available room type:
    - "go"
    - "peer-to-peer"
    - "group"
    - "group-small"
   */

  createTwilioRoom(options) {
    client.video.rooms.create(options).then((room) => console.log(room.sid));
  },

  
   /*
    Some available options when getting a room:
    (Note that this returns a list of all matching results)
    
    let options = {
      status: "completed",
      uniqueName: "YourUniqueRoomName",
      limit: 20
    }

    - Can get by specific name
    - Can get by specific status
    - Can get by name+status

   */

  getTwilioRoom(options) {
    client.video.rooms
      .list(options)
      .then((rooms) => rooms.forEach((r) => console.log(r.sid)));
  },
};

module.exports = TwilioUtilities;

/*
Once a Room is created, generate an
Access Token containing the Room name
and use one of Twilio's Video SDKs
to connect to the Room.

Rooms created in this way get
deleted if no one joins within
5 minutes of room creation

Twilio.Video.connect("$AccessTokenContainingRoomName").then(
  function (room) {
    console.log("Successfully joined a Room: ", room);
  },
  function (error) {
    console.error("Unable to connect to Room: " + error.message);
  }
);
*/
