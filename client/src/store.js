import Vue from "vue";
import Vuex from "vuex";

// import auth from "./config/auth";
// import { authAxios } from "./config/axios";

Vue.use(Vuex);

const state = {
    user: null,

    authenticationStatus: false,
    verificationStatus: false,


    count: 0
};

const mutations = {
    increment (state) {
        state.count++;
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
    // async login ( { state, commit }) {
        
    // },
};


const store = new Vuex.Store({
    // To ensure we get errors in dev (for better debugging) but not in production
    strict: process.env.NODE_ENV !== "production",  

    state: state,
    
    mutations: mutations,

    actions: actions,
});

export default store;