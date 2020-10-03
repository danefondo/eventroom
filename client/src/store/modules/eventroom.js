const state = {
  eventroomData: {
    eventroomId: "",
    eventroomName: "",
    dateCreated: Date,
    hostId: "",
  },
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
    console.log("finalizde @Vuex", state.eventroomData);
  },

  updateEventroomName(state, eventroomName) {
    state.eventroomData["eventroomName"] = eventroomName;
  },

  clearEventroom(state) {
    state.eventroomData = {
      eventroomId: "",
      eventroomName: "",
      dateCreated: Date,
      hostId: "",
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

  clearEventroom(state) {
    state.commit("clearEventroom");
  },
};

const eventroom = {
  namespaced: true,

  state,
  mutations,
  actions,
};

export default eventroom;
