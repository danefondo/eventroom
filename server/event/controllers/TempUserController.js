const { generateToken } = require("../../auth/utilities/Utils");
const Dotenv = require("dotenv");
const JWT = require("jsonwebtoken");
const TempUser = require("../../../database/room/models/TempUserModel");

const {
  uniqueNamesGenerator,
  adjectives,
  colors,
  animals,
} = require("unique-names-generator");

Dotenv.config();

const TempUserController = {
  async createTempUser(req, res) {
    try {
      //- Create temporary user & return the user & tempToken
      const eventroomName = req.body.eventroomName;
      console.log("@createTempUser: eventroomName", eventroomName);

      if (!eventroomName) {
        res.status(500);
      }

      const tempUserDisplayName = uniqueNamesGenerator({
        dictionaries: [adjectives, colors, animals],
        separator: '',
        style: 'capital'
      });

      const dateCreated = new Date();
      const associatedRoomName = eventroomName;
      const tempUserToken = await generateToken();

      let user = new TempUser({
        associatedRoomName,
        tempUserToken,
        tempUserDisplayName,
        dateCreated,
      });
      await user.save();
      console.log("@tempUser", user);

      const tempUser = {
        _id: user._id,
        eventroom: associatedRoomName,
        tempUserDisplayName,
        tempVerifTok: tempUserToken,
      };

      const tempToken = JWT.sign({ tempUser: tempUser }, process.env.SECRET, {
        expiresIn: "1d",
      });

      console.log("@tempToken", tempToken);

      res.status(200).json({
        tempUser: user,
        tempToken,
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
