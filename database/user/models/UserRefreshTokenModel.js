const mongoose = require('mongoose');
let Schema = mongoose.Schema;

const UserRefreshTokenSchema = new Schema({
  userId: String,
  // Should we have different clients, probs way too fancy and/or stupidly complicated without little additional benefits but I almost had fun
  clientRefreshToken: {
    clientId: Number,
    refreshToken: String,
    refreshTokenExpiry: Date,
  }
});

const UserRefreshToken = module.exports = mongoose.model('UserRefreshToken', UserRefreshTokenSchema);