const mongoose = require('mongoose');
let Schema = mongoose.Schema;

const ResetPasswordSchema = new Schema({
  userId: String,
  resetToken: String,
  createdAt: {
    type: Date,
    expires: '30m',
    default: Date.now(),
  }
});

const ResetPassword = module.exports = mongoose.model('ResetPassword', ResetPasswordSchema);