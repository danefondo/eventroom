import axios from 'axios';

import store from "../store/index";
import { BASE_PATH } from "../constants"
//import { verify } from 'jsonwebtoken';

const REGISTRATION_API_URL = `/api/accounts/register`;
const LOGIN_API_URL = `/api/accounts/login`;
const AUTHENTICATION_API_URL = `/api/accounts/authenticate`;
const LOGOUT_API_URL = `/api/accounts/logout`;
const RESETPASS_EMAIL_API_URL = `/api/accounts/sendresetpasswordmail`
const RESETPASS_API_URL = `/api/accounts/passreset`;
const RESETPASS_CONFIRMATION_API_URL = `/api/accounts/passresetconfirmation`;

// ##########################################################
// Axios setup

// Default configurations
const axiosConfig = {
  baseURL: BASE_PATH,
  withCredentials: true
};

// Creating the axios instance
const authAPI = axios.create(axiosConfig);

/**
 * Handling response errors
 */
/*
authAPI.interceptors.response.use(function(response) {
  // console.log("@interceptor")
  return response;
}, async function(error) {
  //if (error.response && error.response.status !== 401 && ) { handleError }
  console.log("ERROR INTERCEPTED")
  return Promise.reject(error);
})
*/
// ##########################################################
// Authentication functionality

const parseAuthenticationResponse = function(response) {
  return {
    authenticationStatus: response.data.success,
    verificationStatus: response.data.success ? response.data.user.verificationStatus : false,
    user: response.data.success ? response.data.user : null,
    userId: response.data.success ? response.data.user._id : null
  };
}


const auth = {
  async register(registrationData) {
    const requestConfig = {
      url: REGISTRATION_API_URL,
      method: 'post',
      data: registrationData
    }
    const response = await authAPI.request(requestConfig);
    console.log("@apiregister: ", response)
    store.commit("auth/updateAll", parseAuthenticationResponse(response));
    return response; 
  },

  async login(loginData) {
    const requestConfig = {
      url: LOGIN_API_URL,
      method: 'post',
      data: loginData
    }

    const response = await authAPI.request(requestConfig);
    console.log("@apilogin: ", response)
    store.commit("auth/updateAll", parseAuthenticationResponse(response));
    return response; 
  },

  async authenticate(authenticationData=null) {
    const requestConfig = {
      url: AUTHENTICATION_API_URL,
      method: 'get',
      data: authenticationData
    };
    const response = await authAPI.request(requestConfig);
    console.log("@apiauthenticate: ", response);
    console.log("@apiauthenticate parsed: ", parseAuthenticationResponse(response));
    store.commit("auth/updateAll", parseAuthenticationResponse(response));
    return response;
  },

  async logout(logoutData=null) {
    const requestConfig = {
      url: LOGOUT_API_URL,
      method: 'get',
      data: logoutData
    };
    const response = await authAPI.request(requestConfig);
    console.log("@apilogout: ", response);
    store.commit("auth/updateAll", {
      authenticationStatus: false,
      verificationStatus: false,
      user: null,
      userId: null
    })
  },
  async verify(verificationData) {
    const requestConfig = {
      url: `/api/accounts/verify/${verificationData.verificationToken}`,
      method: 'get',
    };
    console.log("@apiverify, request", requestConfig);
    const response = await authAPI.request(requestConfig);
    console.log("@apiverify: ", response);
    store.commit("auth/updateAll", {
      authenticationStatus: false,
      user: null,
      userId: null
    });
    return response;
  },

  /* 
  Pass reset stuff 
  */

  async sendResetPasswordMail(mailData) {
    const requestConfig = {
      url: RESETPASS_EMAIL_API_URL,
      method: 'post',
      data: mailData
    };
    const response = await authAPI.request(requestConfig);
    console.log("@apiauthenticate: ", response);
    return response;
  },
  async passreset(resetPasswordData) {
    const requestConfig = {
      url: RESETPASS_API_URL,
      method: 'post',
      data: resetPasswordData
    };
    const response = await authAPI.request(requestConfig);
    console.log("@apireset: ", response);
    return response;
  },
  async passResetConfirmation() {
    const requestConfig = {
      url: RESETPASS_CONFIRMATION_API_URL,
      method: 'get'
    };
    const response = await authAPI.request(requestConfig);
    console.log("@apiconfirmation: ", response);
    return response;
  },
  async passResetRedirect(token) {
    const requestConfig = {
      url: `/api/accounts/passresetredirect/${token}`,
      method: 'get'
    };
    console.log("@apiredirect: ", requestConfig);
    const response = await authAPI.request(requestConfig);
    console.log("@apiredirect: ", response);
    return response;
  }
}


export default auth;
