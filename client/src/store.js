import Vue from "vue";
import Vuex from "vuex";

// import auth from "./config/auth";
import { authAxios } from "./config/axios";

Vue.use(Vuex);

const state = {
    ready: false,

    user: null,

    authenticationStatus: false,
    verificationStatus: false,
};

const mutations = {
    ready(state) {
        state.ready = true;
    },

    updateAuthenticationStatus(state, newStatus) {
        // console.log("before: ", state.authenticationStatus);
        state.authenticationStatus = newStatus;
        // console.log("after:", state.authenticationStatus);
    },

    updateVerificationStatus(state, newStatus) {
        // console.log("before: ", state.verificationStatus);
        state.verificationStatus = newStatus;
        // console.log("after:", state.verificationStatus);
    },

    updateUser(state, newUser) {
        state.user = newUser;
    }

};

const actions = {
    authenticate: async ({ commit }) => {
        let response;
        try {
            response = await authAxios.get(`/api/accounts/authenticate`);
        } catch (err) {
            console.log("@store err:", err);
            return(err);
        }
        if (response && response.data && response.data.success) {
            commit("updateAuthenticationStatus", true);
            commit('updateVerificationStatus', response.data.user.isVerified);
            commit('updateUser', response.data.user);
            commit('ready');
        } else {
            commit("updateAuthenticationStatus", false);
            commit('updateVerificationStatus', false);
            commit('updateUser', null);
            commit('ready');
        }
        return true;
    }    
    
};


const store = new Vuex.Store({
    // To ensure we get errors in dev (for better debugging) but not in production
    strict: process.env.NODE_ENV !== "production",  

    state: state,
    
    mutations: mutations,

    actions: actions,
});

export default store;