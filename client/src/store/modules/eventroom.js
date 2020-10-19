const state = {
  eventroomData: {
    eventroomId: "",
    eventroomName: "",
    dateCreated: Date,
    hostId: "",
    ownerId: "",
    creatorId: "",
  },

  passwordNeedsMatching: Boolean,

  ready: false,
};

// Synchronous
const mutations = {
  setInitialEventroomData(state, eventroomData) {
    console.log("eveData @Vuex", eventroomData);
    state.eventroomData.eventroomId = eventroomData["_id"];
    state.eventroomData.eventroomName = eventroomData["eventroomName"];
    state.eventroomData.dateCreated = eventroomData["dateCreated"];

    if (eventroomData["hostId"]) {
      state.eventroomData.hostId = eventroomData["hostId"];
    }

    if (eventroomData["ownerId"]) {
      state.eventroomData.ownerId = eventroomData["ownerId"];
    }

    if (eventroomData["creatorId"]) {
      state.eventroomData.creatorId = eventroomData["creatorId"];
    }

    if (eventroomData["roomPasswordEnabled"] === true) {
      state.passwordNeedsMatching = true;
    } else {
      state.passwordNeedsMatching = false;
    }
    console.log("finalizde @Vuex", state.eventroomData);
    state.ready = true;
  },

  updateEventroomName(state, eventroomName) {
    state.eventroomData["eventroomName"] = eventroomName;
  },

  updateEventroomOwner(state, ownerId) {
    state.eventroomData["ownerId"] = ownerId;
  },

  passwordMatchedUpdate(state) {
    state.passwordNeedsMatching = false;
  },

  clearEventroom(state) {
    state.eventroomData = {
      eventroomId: "",
      eventroomName: "",
      dateCreated: Date,
      hostId: "",
      ownerId: "",
      creatorId: "",
    };
    // for (var key in state.eventroomData) {
    //   state.eventroomData[key] = "";
    // }
  },
};

// Asynchronous
const actions = {
  setInitialEventroomData(state, eventroomData) {
    eventroomData = JSON.parse(JSON.stringify(eventroomData));
    state.commit("setInitialEventroomData", eventroomData);
  },

  updateEventroomName(state, eventroomName) {
    state.commit("updateEventroomName", eventroomName);
  },

  updateEventroomOwner(state, ownerId) {
    state.commit("updateEventroomOwner", ownerId);
  },

  clearEventroom(state) {
    state.commit("clearEventroom");
  },

  passwordMatchedUpdate(state) {
    state.commit("passwordMatchedUpdate");
  }
};

const eventroom = {
  namespaced: true,

  state,
  mutations,
  actions,
};

export default eventroom;
