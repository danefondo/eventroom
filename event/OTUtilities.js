const OpenTok = require("opentok");

const apiKey = process.env.API_KEY;
const apiSecret = process.env.API_SECRET;

if (!apiKey || !apiSecret) {
  console.log("You must specify API_KEY and API_SECRET environment variables");
}

const OT = new OpenTok(apiKey, apiSecret);


const OTUtilities = {
  // API Key 
  apiKey,

   /**
   * Creates Vonage session. 
   * @return sessionId of created session
   */
  async createSession() {
    return new Promise((resolve, reject) => {
      let session_id;
      OT.createSession({ mediaMode: "routed" }, function (error, session) {
        if (error) {
          console.log("Error creating session:", error);
          reject(error);
        } else {
          console.log("@createsession id:", session.sessionId);
          resolve(session.sessionId);
        }
      });
    })
      
  },

  createToken(room) {
    const tokenOptions = {
      role: "publisher",
      data: `roomid=${room._id.toString()}`,
    };
    // console.log("@creattoken room:", room);
    return OT.generateToken(room.sessionId, tokenOptions);
  },
}

module.exports = OTUtilities;