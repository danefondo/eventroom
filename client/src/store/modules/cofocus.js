const getDefaultState = () => {
  return {
    /* Session objects */
    nextSession: null,
    currentSession: null,

    /* Next session querying status */
    gettingNextSession: false,
    gettingNextSessionError: false,

    /* Next session key times in MS */
    nextSessionStartInMS: 0,
    nextSessionEndInMS: 0,
    nextSessionIntervalInMS: 0,

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

    /* Times before and after session start time in MS (full datetime in MS) */
    oneMinToStartInMS: 0,
    tenMinToStartInMS: 0,

    doneLoadingTimes: false,
    timerHasBeenStarted: false,
    timerManagerHasMounted: false,
    initialFinalizeCompleted: false,

    refreshTimerQueue: [],
    currentlyRefreshingNextSession: false,

    // Purpose is to make an exception for Timer & next session getting
    firstBookingForWeek: false,
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

  setIsTenMinToStart(state) {
    state.nextSessionIsTenMinToStart = true;
  },

  setDidTenMinCheck(state) {
    state.didNextSessionTenMinCheck = true;
  },

  pushToRefreshQueue(state) {
    state.refreshTimerQueue.push(Date.now());
  },

  clearRefreshQueue(state) {
    state.refreshTimerQueue = [];
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

  // 10 TO START
  setIsTenMinToStart(state) {
    state.commit("setIsTenMinToStart");
  },

  pushToRefreshQueue(state) {
    state.commit("pushToRefreshQueue");
  },

  clearRefreshQueue(state) {
    state.commit("clearRefreshQueue");
  },
};

const cofocus = {
  namespaced: true,
  state,
  mutations,
  actions,
};

export default cofocus;
