const getDefaultState = () => {
    return {
        messagesInThread: [],
    };
  };
  
  const state = getDefaultState();
  
  // Synchronous
  const mutations = {
    resetState(state) {
      // Merge rather than replace so we don't lose observers
      // https://github.com/vuejs/vuex/issues/1118
      Object.assign(state, getDefaultState());
    },
  
    addMessage(state, message) {
        state.messagesInThread.push(message);

    },

  };
  
  // Asynchronous
  const actions = {
    resetState(state) {
      state.commit("resetState");
    },
  
    addMessage(state, message) {
      state.commit("addMessage", message);
    },
  
  };
  
  const chat = {
    namespaced: true,
  
    state,
    mutations,
    actions,
  };
  
  export default chat;
  