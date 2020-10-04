const state = {
  allLogs: [],
  lastLog: "",
};

// Synchronous
const mutations = {
  addNewLog(state, logMessage) {
    let length = state.allLogs.length + 1;
    console.log("leeeength", length);
    let logItem = {
        logNumber: length,
        logMessage: logMessage,
    }
    console.log("logggoitme", logItem);
    state.allLogs.push(logItem);
    state.lastLog = logItem;
  },
};

// Asynchronous
const actions = {
  addNewLog(state, logMessage) {
    state.commit("addNewLog", logMessage);
  },
};

const roomlogs = {
  namespaced: true,

  state,
  mutations,
  actions,
};

export default roomlogs;
