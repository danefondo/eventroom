import axios from 'axios';

import { BASE_PATH } from "../constants";
import router from "../router";
import  {InvalidArgumentError} from "../utilities/Errors";

/**
 * STANDARD USAGE 
 * 
 * import { REQUEST } from cofocusAPI
 * 
 * const response = REQUEST({
 *   method,
 *   url,     (provide EITHER url OR urlname)
 *   urlname,    (if urlname provided, urlname MUST exist in API_URLS below as a key)  
 *   data,
 *   params,
 *   withCredentials, (for request that require the user to be authenticated)
 *   ignoreErrors, (array of error codes to let through)
 * })
 */


const REDIRECT_TO_ERROR_PAGES = process.env.NODE_ENV === "production"; // set to true in production
// const REDIRECT_TO_ERROR_PAGES = true // uncomment to test error redirecting

const axiosConfig = {
  baseURL: BASE_PATH,
};

// Creating the axios instance
const API = axios.create(axiosConfig);


// Custom general API URL names
// URL_NAME: corresponding API endpoint url string
// name convention: TYPE_name, e.g. AUTH_LOGIN
const API_URLS = {
  PAYMENT_GET_OPTIONS: "/api/payment/getOptionData",
};

/**
 * Performs an HTTP request to the API
 * @param {Object {
 *    ---- GENERAL PARAMETERS ----
 *    method: ** REQUIRED ** HTTP request method to use 
 *    url: {String} URL to request
 *    data: {Object} or data to pass
 *    params: params to pass
 *    withCredentials: Boolean, sets 'withCredentials' parameter
 *    ---- CUSTOM PARAMETERS ----
 *    ignoreErrors: {Array} array of error codes to let through
 *    urlname: {String} name of the URL to request, must exist in API_URLS above
 *  }} requestConfig request configuration object
 * One of either url or name MUST be provided. Throws an error otherwise.
 * Checks name first
 * 
 * @return {Promise} Returns a promise, if the response was successful. 
 * If there was a request error does nothing atm
 * If there was a response error, redirects to the error screen (if error code not whitelisted in ignoreErrors)
 */
const REQUEST = async function(requestConfig) {
  
  // Builds the configuration object
  const configuration = {
    method: requestConfig.method,
  }
  if (requestConfig.urlname) {
    if (API_URLS[requestConfig.urlname]) {
      configuration.url = API_URLS[requestConfig.urlname];
    } else {
      throw new InvalidArgumentError("Invalid API endpoint name", "API request");
    }
  } else if (requestConfig.url) {
    configuration.url = requestConfig.url;
  } else {
    throw new InvalidArgumentError("No API endpoint url provided", "API request");
  }
  if (requestConfig.data) configuration.data = requestConfig.data;
  if (requestConfig.params) configuration.params = requestConfig.params;
  if (requestConfig.withCredentials) configuration.withCredentials = requestConfig.withCredentials;


  // redirects if the response errored and status code was not whitelisted
  // TODO: handle network error FIXME: dsa ds das ds das d's
  const ignoreErrors = requestConfig.ignoreErrors ? requestConfig.ignoreErrors : null;

  API.interceptors.response.use(function(response) {
    console.log("@interceptor", response);
    return response;
  }, function(error) {
    if (ignoreErrors) {
      for (let i=0; i < ignoreErrors.length; i++) {
        if (ignoreErrors[i] == error.response.status) {
          return error;
        }
      }
    }
    if (!REDIRECT_TO_ERROR_PAGES) {
      return error;
    } 
    const routerParams = {
      name: "ErrorPage",
    }
    if (error.response && error.response.status) {
      routerParams.params = {statusCode: error.response.status};
    } 
    console.log("@interceptor router params", routerParams);
    router.push(routerParams);
  });

  API.interceptors.request.use(function(config) {
    return config;
  }, function(error) {
    // TODO something reasonable or remove
    // not sure when should it even reach here
    console.log("ERROR AT REQUEST", error)
    return error;
  });

  console.log("@api request: ", configuration);
  // sends the request and returns the response
  try {
    // console.log("@api request config", configuration);
    const response = await API.request(configuration);
    // console.log("@api request passed,", response);
    return response;
  } catch(error) {
    console.log("@api error happened", error);
  }
  
};

const api = {
  REQUEST 
}

export default api;