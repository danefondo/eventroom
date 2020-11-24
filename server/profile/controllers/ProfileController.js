const { processPostRequest } = require("../../../utilities/CRUDAutomation");
const controller = "ProfileDataController";

const ProfileController = {
  async getProfileByUserId(req, res) {
    const options = {
      validate: ["userId"],
      funcToRun: "getProfileByUserId",
      dataToPass: req.body.userId,
      selfComplete: true,
    };
    await processPostRequest(req, res, controller, options);
    return;
  },
  async getManyProfilesByUserIds(req, res) {
    const options = {
      validate: ["participantIds"],
      funcToRun: "getManyProfilesByUserIds",
      dataToPass: req.body.participantIds,
      selfComplete: true,
    };
    await processPostRequest(req, res, controller, options);
    return;
  },

  async updateProfileByUserId(req, res) {},

  async saveProfileImageReference(req, res) {
    const options = {
      validate: ["userId", "fileName", "fileUrl", "fileId"],
      funcToRun: "saveProfileImageReference",
      dataToPass: req.body,
      selfComplete: true,
    };
    await processPostRequest(req, res, controller, options);
    return;
  },

  async deleteProfileImage(req, res) {
    const options = {
      validate: ["userId", "fileId"],
      funcToRun: "deleteProfileImage",
      dataToPass: req.body,
      selfComplete: true,
    };
    await processPostRequest(req, res, controller, options);
    return;
  },
};

// let requestInformation = {
//   validatorOptions: {
//     dataToValidate: ["participantIds"],
//     selfCompleteRequest: true,
//   },
//   mongooseOptions: {
//     controller: "ProfileDataController",
//     controllerFunctionToRun: "getManyProfilesByUserIds",
//     queryDataToPass: req.body.participantIds,
//   },
//   req,
//   res,
// };
// await processGenericPostRequest(requestInformation);
// return;

module.exports = ProfileController;
