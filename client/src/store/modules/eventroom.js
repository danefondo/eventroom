const state = {
    eventroom: {
        eventroomName: '',
    },
  };
  
  // Synchronous
  const mutations = {
    updateEventroomName(state, eventroomName) {
      state.eventroom["eventroomName"] = eventroomName;
    },
    clearEventroom(state) {
      for (var key in state.eventroom) {
        state.eventroom[key] = '';
      }
    },
  };
  
  // Asynchronous
  const actions = {
    updateEventroomName(state, eventroomName) {
      state.commit("updateEventroomName", eventroomName);
    },
    clearEventroom(state) {
      state.commit("updateEventroomName");
    },
  };
  
  const eventroom = {
    namespaced: true,
  
    state,
    mutations,
    actions,
  };
  
  export default eventroom;
  