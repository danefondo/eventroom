const ResetPassword = require('../models/ResetPasswordModel');

const { hashPassword, verifyPassword } = require('../../../server/auth/utilities/Utils');
const { getUserByEmail } = require('./UserDataController');

const verifyResetToken = async function(email, token) {
  try {
    const user = await getUserByEmail(email);
    const userId = user._id.toString();
    const resetPasswords = await ResetPassword.find({userId: userId}).exec();
    for (let i=0; i<resetPasswords.length; i++) {
      if (resetPasswords[i].resetToken && (await verifyPassword(token, resetPasswords[i].resetToken))) {
        return true;
      }
    }
    console.log("@verify pws failure");
  } catch (err) {
    console.log("err:", err);
    return false;
  }
  return false;
}

const addResetToken = async function(userId, token) {
  try {
    const hashedToken = await hashPassword(token);
    const resetPassword = new ResetPassword({
      userId,
      resetToken: hashedToken,
    });
    await resetPassword.save()
      .then(console.log("saved!"));
  } catch (err) {
    return err;
  }
}

const deleteResetTokens = async function(userId) {
  return ResetPassword.deleteMany({userId: userId}, function(err, result) {
    if (err) return err;
    else return result;
  });
}

module.exports = { addResetToken, verifyResetToken, deleteResetTokens };