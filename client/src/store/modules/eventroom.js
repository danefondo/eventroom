const state = {
    eventroomInfo: {
        eventroomName: '',
    },
  };
  
  // Synchronous
  const mutations = {
    updateEventroomName(state, eventroomName) {
      state.eventroomInfo["eventroomName"] = eventroomName;
    },
  };
  
  // Asynchronous
  const actions = {
    updateEventroomName(state, eventroomName) {
      state.commit("updateEventroomName", eventroomName);
    },
  };
  
  const eventroom = {
    namespaced: true,
  
    state,
    mutations,
    actions,
  };
  
  export default eventroom;
  