import axios from "axios" // eslint-disable-line
import { BASE_PATH } from "../constants"

export const setAuth = (token, redirect = true) => {
    if (!token) {
        localStorage.clear()
        localStorage.removeItem('token');
        delete axios.defaults.headers.common.Authorization;
    }
    if (redirect) {
        window.location.replace('/')
    }
    localStorage.setItem("token", token);
    axios.defaults.headers.common.Authorization = `Bearer ${token}`
}

export const setTempToken = (tempToken) => {
    if (tempToken) {
        localStorage.setItem("tempToken", tempToken);
        axios.defaults.headers.common.Authorization = `BearerTemp ${tempToken}`
    }
}

export const setGlobals = () => {
    axios.defaults.baseURL = BASE_PATH
    if (localStorage.getItem('token')) {
        axios.defaults.headers.common.Authorization = `Bearer ${localStorage.getItem('token')}`
    }
}

const authAxios = axios.create({
    baseURL: BASE_PATH,
    withCredentials: true,
    //timeout: 10000,
});

export { authAxios };