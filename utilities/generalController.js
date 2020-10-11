// UNDER CONSTRUCTION

// NEEDS TIME THINKING THROUGH TO MAKE MAXIMALLY GENERAL YET STILL EFFICIENT


/*
TODO

- GENERIC MONGODB MODEL ACCESS db[VarContainingModelName].findOne().exec();
https://stackoverflow.com/questions/39353936/how-to-pass-variable-name-as-collection-name-for-mongo-db-in-nodejs

- GENERIC MONGOOSE HANDLER, JUST PASS COMMAND + OPTIONS & IT TAKES CARE
OF PICKING THE RIGHT TASK TO DO, THEN IT WILL JUST BE:
db[modelName][varWithMongooseFunction](query, options).exec();

https://stackoverflow.com/questions/1723287/calling-a-javascript-function-named-in-a-variable

https://stackoverflow.com/questions/359788/how-to-execute-a-javascript-function-when-i-have-its-name-as-a-string

That will allow for not having to set up new DataControllers most of the time;

All that will need to be done is just specifying ControllerConfig + Setting up route, that's it!

- EFFICIENCY --> Find ways to create filters to more quickly post first if-then get to narrow down to the right and fastest possible path to take care of task so that automation would not slow down app and be as direct as possible


*/


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