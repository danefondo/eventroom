const ProfileDataController = require("../database/profile/controllers/ProfileDataController");
const AccountSettingsDataController = require("../database/settings/controllers/AccountSettingsDataController");
const EventroomDataController = require("../database/eventroom/controllers/EventroomDataController");
const BookingDataController = require("../database/booking/controllers/BookingDataController");


const DataControllers = {
  ProfileDataController,
  AccountSettingsDataController,
  EventroomDataController,
  BookingDataController
};

const CRUDAutomation = {
  /*
  1. processPostRequest
  2. It gets the data;
  3. Validate post request
  4. I must try-catch so that when validatePostRequest fails, it would not attempt to trygetdata
  5. A try-catch --> console.log might be enough;
  

  // This will take care of all the try-catch logic
  // Should be sufficient for most cases

  // It will both return errors
  // and send back data requested 

  // And therefore controller just needs to send the 'demand'

  It is possible to in the future specify further configuration options,
  and based on that implement quite specific error returns and messages or codes;

  For OPTIONS passed from controllers, I could create a 'customValidate' or 'securityValidate'
  where it does not validate against whether there's data, but rather makes sure the data is safe and secure but won't throw error if data is missing

  TODO:
  - Specify case, e.g. 'customValidation: true, and then it uses another function to process the data to validate; e.g. then you can specify  instead of a string array, an object array, where you can specify which kind of validation is required, if any special validation is required, and then a special validator can be applied
- Automate Data Controller processes, e.g. setting up the errors, specifying query in initial request, setting up empty variables, sending and awaiting and returning query, setting errors based on error types and then returning and handling any data and then in the initial request specifying what action is to be performed and if any changes are to be made, then what are those changes; that could lead to additional saving of hundreds of hours on the backend, whilst only having to continue refining, improving a single function set, which is the CRUD automation system, to make it more and more general purpose;
  */

  async processPostRequest(req, res, controller, options) {
    let result;
    try {
      await CRUDAutomation.validatePostRequest(
        req,
        res,
        options.validate,
        options.selfComplete
      );

      result = await CRUDAutomation.tryGetData(
        res,
        controller,
        options.funcToRun,
        options.dataToPass,
        options.selfComplete
      );
    } catch (error) {
      console.log(error);
      if (error.statusCode == 500) {
        error.exceptionError = true;
      }
      return res.status(error.statusCode).send(error);
    }
    return res.status(200).send({ result, success: true });
  },

  async tryGetData(res, controller, funcToRun, dataToPass, selfComplete) {
    let result;
    try {
      result = await DataControllers[controller][funcToRun](dataToPass);

      result = await CRUDAutomation.processDataControllerResult(
        result,
        res,
        selfComplete
      );
    } catch (error) {
      console.log("Failed to get participants data", error);
      let errors = {};
      if (error.errors) {
        errors = error.errors;
      } else {
        errors.error = error;
      }
      throw { errors, statusCode: 500 };
    }

    return result;
  },

  /**
   *
   * @param {*} req
   * @param {*} dataToValidate -- Array of data to find & validate in client provided data
   * @param {*} options
   *
   * General purpose POST request validator
   *
   * Possible to improve this general purpose function to handle more scenarios
   * and have more custom options one can pass along
   * to be able to perform repetitive tasks
   * simply through passing or specifying a keyword
   *
   * E.g. if any sort of matching needs to be done
   * Or string validation, etc.
   *
   * Can have something like, if dataItem == firstName, perform a specific check
   */
  async validatePostRequest(
    req,
    res = null,
    dataToValidate,
    selfCompleteRequest = false,
    options = null
  ) {
    let errors = {
      MissingClientData: [],
    };

    try {
      let clientData = req.body;

      // Check if valid request from client
      if (!clientData) {
        errors.InvalidRequest = true;
        throw { errors: errors };
      }

      console.log("CRUD req.body", clientData);
      // Validate any data to be validated
      dataToValidate.forEach(function (dataItem) {
        let clientDataItem = clientData[dataItem];
        console.log("CRUD toValidate", dataToValidate);
        console.log("dataItem", dataItem);
        console.log("finalItem", clientDataItem);
        if (!clientDataItem) {
          errors.ClientDataItemMissing = true;
          errors.MissingClientData.push(dataItem);
        }
      });

      // Check if any errors were discovered
      if (errors.MissingClientData.length) throw { errors: errors };
    } catch (error) {
      console.log(error);

      if (selfCompleteRequest) {
        // To hit the parent's catch block, must throw here rather than return;
        throw { errors: error.errors, statusCode: 400 };
      } else {
        // Return errors when found
        return { success: false, errors: error.errors };
      }
    }

    if (selfCompleteRequest) {
      return;
    } else {
      // Return success if no errors were found
      return { success: true };
    }
  },

  /**
   *
   * @param {*} req
   * @param {*} dataToValidate
   * @param {*} options
   *
   * Function to process more complex validations that are more expensive,
   * have more exceptions, require more iterations or take more time
   */
  async advancedValidatePostRequest(req, dataToValidate, options = null) {
    console.log(req, dataToValidate);
  },

  /**
   *
   * @param {*} result
   * @param {*} res -> only there and only used if selfCompleteRequest == true
   * @param {*} selfCompleteRequest -> if true, complete request, else return
   *
   * Result must contain returnData,
   * which must be provided by the DataController.
   *
   * If selfCompleteRequest == false, can use the following code
   * 
   
    if (!processedResult.success) {
      return res.status(500).send({ errors: processedResult.errors });
    } else {
      res.status(200).send({ processedResult });
    }

   * 
   */
  async processDataControllerResult(
    result,
    res = null,
    selfCompleteRequest = false
  ) {
    let errors = {};

    try {
      if (!result) {
        errors.DataControllerError = true;
        errors.errorMessage = "Data controller could not find or provide data.";
        throw { errors: errors };
      }
      // console.log("@processDataControllerResult", result);
    } catch (error) {
      console.log(error);

      if (selfCompleteRequest) {
        // When true, don't send anything back and complete request response here
        throw { errors: error.errors, statusCode: 500 };
      } else {
        return { success: false, errors };
      }
    }

    if (selfCompleteRequest) {
      // Send validated result back, sometimes it might change, sometimes it will stay the same;
      return result;
    } else {
      // When result passes processing
      return { success: true, result };
    }
  },

  // async processCatchError(res, error) {
  //   console.log("Failed to get participants data", error);
  //   let errors = { exceptionError: true };

  //   //- Returns and exists processCatchError
  //   //- Executes res.status
  //   //- Returns to parent function
  //   return res.status(500).send({ errors: errors });
  // },
};

module.exports = CRUDAutomation;


// If anyone ever steals any of Elysium's code. I will make you regret it for the rest of your life.
