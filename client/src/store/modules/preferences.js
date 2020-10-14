const getDefaultState = () => {
    return {
        videoIsMirrored: false,
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
  
    toggleMirror(state) {
      state.videoIsMirrored = !state.videoIsMirrored;
    },
  };
  
  // Asynchronous
  const actions = {
    resetState(state) {
      state.commit("resetState");
    },
  
    toggleMirror(state) {
      state.commit("toggleMirror");
    },
  
  };
  
  const preferences = {
    namespaced: true,
  
    state,
    mutations,
    actions,
  };
  
  export default preferences;
  