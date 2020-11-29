const { validationResult } = require('express-validator');
const JWT = require('jsonwebtoken');

const { verifyToken, generateToken, hashPassword, userInJWT } = require('../utilities/Utils');
const { verifyResetToken, addResetToken, deleteResetTokens } = require('../../../database/user/controllers/ResetPasswordController');
const { getUserByEmail } = require('../../../database/user/controllers/UserDataController');

const { loginWithTokens } = require('./AuthController');

const { sendResetMail } = require('../../mail/utilities/MailUtilities');


const changePassword = async (email, newPassword) => {
  return Promise.all([getUserByEmail(email), hashPassword(newPassword)])
      .then(async ([user, hashedPassword]) => {
          return deleteResetTokens(user._id.toString())
              .then(async (result) => {
              user.password = hashedPassword;
              await user.save();
              return { success: true, returnUser: userInJWT(user) };
              })
              .catch( err => {
                  console.log("@change err 2", err);
                  return { success: false, error: err};
              })
      })
      .catch(err => {
          console.log("@change err", err);
          return { success: false, error: err };
      })

};
const sendResetPassword = async function(email, link) {
  const resetToken = await generateToken();
  let user;
  try {
      user = await getUserByEmail(email);
      if (user && user.verificationStatus) {
          await addResetToken(user._id.toString(), resetToken);
          token = JWT.sign({email: email, token: resetToken}, process.env.JWT_SECRET, {expiresIn:'30min'});
          link += token;
          sendResetMail(email, link);
          return true;
      }
      return false;
  } catch(err) {
      console.log(err);
      return false;
  }
};

const PasswordResetController = {
  async sendResetPasswordMail(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        // has to send success true, to avoid some weird attacks
        return res.status(200).send({ success: true });
    }
    
    const link = `${req.protocol}://${req.body.hostname}/account/resetpassword/`;
    sendResetPassword(req.body.email, link);
    return res.status(200).send({ success: true});
  },

  async resetPasswordConfirmation(req, res) {
    if (req && req.cookies) {
        const token = req.cookies['redirect'];
        const decoded = verifyToken(token);
        if (decoded.success) {
          if (await verifyResetToken(decoded.email, decoded.token)) {
            return res.status(200).send({success: true});
          }
        } 
    }
    return res.status(401).send({success: false});
  },

  resetPasswordRedirect(req, res) {
    const token = req.params.token;
    console.log("@redirect", token)
    const decoded = verifyToken(token);
    if (decoded.success) {
      console.log("success!!");
        return res.status(303)
            .cookie('redirect', token, { httpOnly: true })
            .send({ success: true });
    } else {
        console.log("@redirect no success:", decoded);
        return res.status(401).send({ success: false});
    }
  },

  async resetPassword (req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }

    if (req && req.body && req.cookies) {
      const token = req.cookies['redirect'];
      res.clearCookie('redirect');
      const decoded = verifyToken(token);
      if (decoded.success && await verifyResetToken(decoded.email, decoded.token)) {
        const result = await changePassword(decoded.email, req.body.newPassword);
        
        if (result.success) {
          return await loginWithTokens(req, res, result.returnUser);
        } 
        return res.status(500).send({ success: false, error: "Internal server error" });
      } else {
        return res.status(401).send({ success: false, error: "Unauthorized" });
      }
    } else {
      return res.status(401).send({ success: false, error: "Unauthorized" });
    }
  },
};

module.exports = PasswordResetController;