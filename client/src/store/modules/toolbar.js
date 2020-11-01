const getDefaultState = () => {
  return {
    toolbarConfig: {
      settings: false,
      info: false,
      participants: false,
      chat: false,
      chatIndicator: false,
    },

    timerConfig: {
      timerOpen: false,
      timerExpanded: false,

      resetTimer: false,
      pauseTimer: false,
      resumeTimer: false,
      setNewValue: 0,
    },

    containersConfig: {
      leftSidebar: false,
    },
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

  toggleContainer(state, data) {
    console.log("configcont", state.containersConfig);
    for (var key in state.containersConfig) {
      state.containersConfig[key] = false;
    }
    console.log("contbool", state.containersConfig);
    if (data.boolean == false) {
      state.containersConfig[data.container] = false;
    } else {
      state.containersConfig[data.container] = true;
    }
  },

  toggleToolbar(state, data) {
    console.log("bool", data.boolean);
    console.log("configtool", state.toolbarConfig);
    for (var key in state.toolbarConfig) {
      state.toolbarConfig[key] = false;
    }
    console.log("configtool", state.toolbarConfig);
    if (data.boolean == false) {
      state.toolbarConfig[data.toolbarTool] = false;
      state.containersConfig["leftSidebar"] = false;
    } else {
      state.containersConfig["leftSidebar"] = true;
      state.toolbarConfig[data.toolbarTool] = true;
    }
  },

  toggleChatIndicator(state, newState) {
    state.toolbarConfig.chatIndicator = newState;
  },

  toggleTimer(state) {
    state.timerConfig.timerOpen = !state.timerConfig.timerOpen;
  },

  resetTimer(state) {
    state.timerConfig.resetTimer = !state.timerConfig.resetTimer;
  },

  pauseTimer(state) {
    state.timerConfig.pauseTimer = !state.timerConfig.pauseTimer;
  },

  resumeTimer(state) {
    state.timerConfig.resumeTimer = !state.timerConfig.resumeTimer;
  },

  receiveSetAndStartTimerCustom(state, seconds) {
    state.timerConfig.setNewValue = seconds;
  },

  resetTimerValue(state) {
    state.timerConfig.setNewValue = 0;
  }
};

// Asynchronous
const actions = {
  resetState(state) {
    state.commit("resetState");
  },

  toggleContainer(state, data) {
    state.commit("toggleContainer", data);
  },

  toggleToolbar(state, data) {
    state.commit("toggleToolbar", data);
  },

  toggleChatIndicator(state, newState) {
    state.commit("toggleChatIndicator", newState);
  },

  toggleTimer(state) {
    state.commit("toggleTimer");
  },

  resetTimer(state) {
    state.commit("resetTimer");
  },

  pauseTimer(state) {
    state.commit("pauseTimer");
  },

  resumeTimer(state) {
    state.commit("resumeTimer");
  },

  receiveSetAndStartTimerCustom(state, seconds) {
    state.commit("receiveSetAndStartTimerCustom", seconds);
  },

  resetTimerValue(state) {
    state.commit("resetTimerValue");
  }
};

const toolbar = {
  namespaced: true,

  state,
  mutations,
  actions,
};

export default toolbar;
