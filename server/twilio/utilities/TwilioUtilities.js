const AccessToken = require("twilio").jwt.AccessToken;
const VideoGrant = AccessToken.VideoGrant;

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
};

module.exports = TwilioUtilities;
