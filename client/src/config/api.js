import axios from 'axios';
import { BASE_PATH } from "../constants"
import router from "../router";
import auth from "./auth";


const globalConfig = {
  baseURL: BASE_PATH,
};
/*
    Used to send requests if user authentication is required. 
    DOES NOT verify user roles, only login status

    example usage: 
    const result = await requestWithAuthentication('post', `api/events/createEvent`, eventData, true);

    If server sends 401 error, logs the user out and redirects to login page

    Returns server response, if response was successful.
*/
const requestWithAuthentication = async function(method, url, data=null, requiresAuthentication=true) {
  const instanceConfig = {
    ...globalConfig,
    method,
    data, 
    url,
    withCredentials: requiresAuthentication,
  };

  const instance = axios.create(instanceConfig);

  instance.interceptors.response.use(function(response) {
    console.log("@intercept resp", response);
    return response;
  }, async function(error) {
    // TODO add 401 error page - same as login page, but with text that says to do this action you have to be logged in or smth
    // TODO handle case, where user is logged in, but does not have admin access or smth
    if (error.response && error.response.status === 401) {
      await auth.logout();
      router.push("/login");
    }
    return Promise.reject(error);
  })

  return await instance.request(instanceConfig);

}

export { requestWithAuthentication };