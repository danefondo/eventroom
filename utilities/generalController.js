// UNDER CONSTRUCTION

// NEEDS TIME THINKING THROUGH TO MAKE MAXIMALLY GENERAL YET STILL EFFICIENT



const generalController = {
  /**
   * What stays same?
   * What changes here?
   *
   * 1. Data is different
   * 2. Collection to query is different
   * 3. Mongoose to use is different
   */

  async preparePostRequestOptions(req, res) {
    let options = {
      req,
      res,
      dataToValidate: ["participantIds"],
      selfCompleteRequest: true,
      advancedRequest: false,
      mongooseOptions: {
        queryData: req.body["participantIds"],
        queryType: "findMany",
        queryKind: "findByMany",
        collection: "Profile",
        query: {
          userId: { $in: req.body["participantIds"] },
        },
      },
      customErrorHandler: null,
    };

    await this.handleAnyGenericPostRequest(options);
    return;
  },

  /**
   * findOne
   * find
   * findById
   *
   * findByOne
   * findByMany
   */

  async findAnyGenericProfileData() {
    // ProfileDataController["getProfileByUserId"](userId);
  },

  async handleAnyGenericPostRequest(options) {
    let validationResult;
    if (options.selfCompleteRequest) {
      await validatePostRequestData(
        options.req,
        options.dataToValidate,
        options.res,
        true
      );
    } else {
      validationResult = await validatePostRequestData(
        options.req,
        options.dataToValidate
      );
    }
    // 1. Specify data to validate || Find function to auto-iterate + specify to speed up
    // 2. Specify additional specifiers, to tell which Mongoose function to use (e.g. 'many' and 'type')
    // 3. Specify processing details

    try {
      let result = await ProfileDataController.getManyProfilesByUserIds(
        req.body.participantIds
      );

      await processDataControllerResult(result, res, true);
      return;
    } catch (error) {
      processCatchError(res, error);
    }
  },
};

module.exports = generalController;