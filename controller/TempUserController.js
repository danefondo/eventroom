const AccountUtilities = require("../utils/AccountUtilities");
const Dotenv = require("dotenv");
const JWT = require('jsonwebtoken');
const TempUser = require("../models/TempUserModel");

Dotenv.config();

const TempUserController = {
  async createTempUser(req, res) {
    try {
      //- Create temporary user & return the user & tempToken
      const roomId = req.body.roomIdParam;

      const dateCreated = new Date();
      const associatedRoomId = roomId;
      const tempUserToken = await AccountUtilities.generateToken();

      let user = new TempUser({
        associatedRoomId,
        tempUserToken,
        dateCreated,
      });
      await user.save();

      const tempUser = {
        _id: user._id,
        room: associatedRoomId,
        tempVerifTok: tempUserToken,
      };
      const tempToken = JWT.sign({ tempUser: tempUser }, process.env.SECRET, {
        expiresIn: "1d",
      });

      res.status(200).json({
        tempUser: user,
        tempToken
      });

    } catch (error) {
      console.log(error);
      res.status(500).json({
        errors: "An unknown error occurred",
      });
    }
  },
};

module.exports = TempUserController;
