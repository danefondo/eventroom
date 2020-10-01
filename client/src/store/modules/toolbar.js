const state = {
  toolbarConfig: {
    settings: false,
    info: false,
  },

  containersConfig: {
    leftSidebar: false,
  },
};

// Synchronous
const mutations = {
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
};

// Asynchronous
const actions = {
  toggleContainer(state, data) {
    state.commit("toggleContainer", data);
  },

  toggleToolbar(state, data) {
    state.commit("toggleToolbar", data);
  },
};

const toolbar = {
  namespaced: true,

  state,
  mutations,
  actions,
};

export default toolbar;
