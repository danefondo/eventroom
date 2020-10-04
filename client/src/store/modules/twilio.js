const state = {
    twilioRoomData: {
        roomName: "",
    },
  };
  
  // Synchronous
  const mutations = {
    createNewRoom(state, roomName) {
      state.twilioRoomData.roomName = roomName;
    },
  };
  
  // Asynchronous
  const actions = {
    createNewRoom(state, roomName) {
      state.commit("createNewRoom", roomName);
    },
  };
  
  const twilio = {
    namespaced: true,
  
    state,
    mutations,
    actions,
  };
  
  export default twilio;
  