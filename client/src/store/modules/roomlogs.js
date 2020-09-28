const state = {
  allLogs: [],
  lastLog: "",
};

// Synchronous
const mutations = {
  addNewLog(state, logItem) {
    state.allLogs.push(logItem);
    state.lastLog = logItem;
  },
};

// Asynchronous
const actions = {
  addNewLog(state, logMessage) {
    let logItem = {
        logNumber: state.allLogs.length + 1,
        logMessage: logMessage,
    }
    state.commit("addNewLog", logItem);
  },
};

const roomlogs = {
  namespaced: true,

  state,
  mutations,
  actions,
};

export default roomlogs;
