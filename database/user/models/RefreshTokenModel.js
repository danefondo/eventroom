const mongoose = require('mongoose');
let Schema = mongoose.Schema;

const UserRefreshTokenSchema = new Schema({
  userId: String,
  /*
  blacklisted: {
    type: Boolean,
    default: false
  },
  */
  clientId: Number,
  refreshToken: String,
  expireAt: {
    type: Date,
    default: new Date(new Date().valueOf() + 7*8.64e7),
    expires: '60s'
  },
});

const UserRefreshToken = module.exports = mongoose.model('UserRefreshToken', UserRefreshTokenSchema);