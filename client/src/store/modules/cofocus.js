const getDefaultState = () => {
  return {
    /* Session objects */
    nextSession: null,
    currentSession: null,

    /* Next session key times in sec */
    nextSessionStartInSec: 0,
    nextSessionEndInSec: 0,
    nextSessionIntervalInSec: 0,

    /* Session status states */
    sessionHasStarted: null,
    sessionHasFinished: null,
    nextSessionIsTenMinToStart: false,
    sessionStartedLessThanFiveMinAgo: false,

    /* User session status states */
    userHasJoinedSessionOnceDuring: false,
    userIsCurrentlyInSession: false,

    /* Session partner status states */
    sessionMatchIsPresent: false,

    /* Status of checks done before session */
    didNextSessionOneMinCheck: false,
    didNextSessionTenMinCheck: false,
    didSessionFinishedCheck: false,
    didSessionStartedCheck: false,

    didNextSessionLateCheck: false,

    /* Times before and after session start time in seconds (full datetime in seconds) */
    oneMinToStartInSec: 0,
    tenMinToStartInSec: 0,

    doneLoadingTimes: false,
  };
};

const state = getDefaultState();

// Synchronous
const mutations = {
  resetSessionData(state) {
    // https://github.com/vuejs/vuex/issues/1118
    Object.assign(state, getDefaultState());
  },

  changeSingleState(state, changeData) {
    let field = changeData.field;
    state[field] = changeData.newValue;
  },

  setNextSession(state, session) {
    state.nextSession = session;
  },

  setNextSessionStartInSec(state, startInSec) {
    state.nextSessionStartInSec = startInSec;
  },

  setNextSessionIntervalInSec(state, intervalInSec) {
    state.nextSessionIntervalInSec = intervalInSec;
  },

  setNextSessionEndInSec(state, endInSec) {
    state.nextSessionEndInSec = endInSec;
  },

  setIsTenMinToStart(state) {
    state.nextSessionIsTenMinToStart = true;
  },

  setDidTenMinCheck(state) {
    state.didNextSessionTenMinCheck = true;
  },

  setOneMinToStart(state, oneMinToStartInSec) {
    state.oneMinToStartInSec = oneMinToStartInSec;
  },

  setTenMinToStart(state, tenMinToStartInSec) {
    state.tenMinToStartInSec = tenMinToStartInSec;
  },
};

// Asynchronous
const actions = {
  resetSessionData(state) {
    state.commit("resetSessionData");
  },

  changeSingleState(state, changeData) {
    state.commit("changeSingleState", changeData);
  },

  setNextSession(state, session) {
    state.commit("setNextSession", session);
  },

  setNextSessionStartInSec(state, startInSec) {
    state.commit("setNextSessionStartInSec", startInSec);
  },

  setNextSessionIntervalInSec(state, intervalInSec) {
    state.commit("setNextSessionIntervalInSec", intervalInSec);
  },

  setNextSessionEndInSec(state, endInSec) {
    state.commit("setNextSessionEndInSec", endInSec);
  },

  // 10 TO START
  setIsTenMinToStart(state) {
    state.commit("setIsTenMinToStart");
  },

  setOneMinToStart(state, oneMinToStartInSec) {
    state.commit("setOneMinToStart", oneMinToStartInSec);
  },

  setTenMinToStart(state, tenMinToStartInSec) {
    state.commit("setTenMinToStart", tenMinToStartInSec);
  },
};

const cofocus = {
  namespaced: true,
  state,
  mutations,
  actions,
};

export default cofocus;
