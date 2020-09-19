// import PublisherHandler from '../../session/PublisherHandler';
// import SubscriberHandler from '../../session/SubscriberHandler';


const state = {
  // Static data
  apiKey: "",
  sessionId: "",
  sessionToken: "",

  thisConnectionId: "",
  thisSessionId: "",
  // Room and user data
  room: {},
  userIsHost: false,

  // Errors
  publisherFirstConnectionStatus: false,
  publisherFirstConnectionMessage: "",

  publisherNetworkDisconnected: false,

  // Existing container ID-s
  CENTRAL_AREA: {
    central_1: null,
    central_2_1: null,
    central_2_2: null,
    central_3_1: null,
    central_3_2: null,
    central_3_3: null,
    central_3_4: null,
  },
  RIGHT_AREA: {
    right_1: null,
    right_2: null,
    right_3: null,
    right_4: null,
    right_5: null,
  },

  // Central area
  centralLayoutType: "1",  
  
  // Old
  containersReady: [],

  streamsWaitingForContainer: [],
};

const getters = {
  getStaticSessionData: (state) => {
    return {
      apiKey: state.apiKey, 
      sessionId: state.sessionId, 
      sessionToken: state.sessionToken
    };
  },
  getCurrentCentralLayoutType: (state) => state.centralLayoutType,

  currentlyAvailableRight: (state) => {
    return Object.keys(state.RIGHT_AREA).filter(e => state.RIGHT_AREA[e] === null);
  },
  currentlyAvailableCentral: (state) => {
    console.log()
    return Object.keys(state.CENTRAL_AREA).filter(e => state.CENTRAL_AREA[e] === null && e[8] === state.centralLayoutType);
  },
  /* eslint-disable no-unused-vars */
  currentlyAvailableKeys: (state, getters) => {
    let availableRight = getters.currentlyAvailableRight;
    let availableCentral = getters.currentlyAvailableCentral;
    if (availableRight) {
      return availableRight.concat(availableCentral);
    } else if (availableCentral) {
      return availableCentral;
    } 
    return null;
  },
  /* eslint-enable no-unused-vars */

  

  getEmptyRightKey: (state) => {
    return Object.keys(state.RIGHT_AREA).find(e => state.RIGHT_AREA[e] === null);
  },

  // Central getters
  centralContainsStreams: (state) => {
    const value = Object.values(state.CENTRAL_AREA).find(e => e !== null);
    if (value) return true;
    return false;
  },
  getCentralStreamKeys: (state) => {
    return Object.keys(state.CENTRAL_AREA).filter(e => state.CENTRAL_AREA[e] !== null).sort();
  },
  getRightStreamKeys: (state) => {
    return Object.keys(state.RIGHT_AREA).filter(e => state.RIGHT_AREA[e] !== null).sort();
  }
};

const mutations = {
  setThisConnectionId(state, newId) {
    state.thisConnectionId = newId;
  },
  setThisSessionId(state, newId) {
    state.thisSessionId = newId;
  },
  setApiKey(state, newApiKey) {
    state.apiKey = newApiKey;
  },
  setRoom(state, newRoom) {
    state.room = newRoom;
  },
  setSessionId(state, newSessionId) {
    state.sessionId = newSessionId;
  },
  setSessionToken(state, newSessionToken) {
    state.sessionToken = newSessionToken;
  },
  setUserIsHost(state, isHost) {
    state.userIsHost = isHost;
  },
  setPublisherFirstConnectionStatus(state, status) {
    state.publisherFirstConnectionStatus = status;
  },
  setPublisherFirstConnectionMessage(state, message) {
    state.publisherFirstConnectionMessage = message;
  },
  setPublisherNetworkDisconnected(state, status) {
    state.publisherNetworkDisconnected = status;
  },

  addToCentral(state, payload) {
    state.CENTRAL_AREA[payload.key] = payload.streamId;
  },
  addToRight(state, payload) {
    state.RIGHT_AREA[payload.key] = payload.streamId;
  },
  removeFromCentral(state, key) {
    state.CENTRAL_AREA[key] = null;
  },
  removeFromRight(state, key) {
    state.RIGHT_AREA[key] = null;
  },

  // Central area mutations
  setCentralLayoutType(state, newLayout) {
    state.centralLayoutType = newLayout;
  },






  /// OLD
  addReadyContainer(state, containerObject) {
    state.containersReady.push(containerObject);
  },

  removeFinalizedContainer(state, containerObjectId) {
    let index = state.containersReady.findIndex((data) => data.objectId === containerObjectId);
    state.containersReady.splice(index, 1);
  },

  setStreamOnHold(state, streamObject) {
    state.streamsWaitingForContainer.push(streamObject);
  },

  removeStreamOnHold(state, streamObjectId) {
    let index = state.streamsWaitingForContainer.findIndex((data) => data.objectId === streamObjectId);
    state.streamsWaitingForContainer.splice(index, 1);
  },
};

const actions = {
  setInitialData({ commit, rootState }, obj) {
    // console.log("@setinit obj", obj);
    commit("setApiKey", obj.apiKey);
    commit("setSessionId", obj.sessionId);
    commit("setSessionToken", obj.sessionToken);
    commit("setRoom", obj.room);
    // console.log("@setinit id-s", obj.room.hostId, rootState.auth.user._id);
    if (obj.room.hostId == rootState.auth.user._id) {
      commit("setUserIsHost", true);
    }
  },

  /**
   * Used to get an empty videobox area for the next subscriber (or publisher).
   */
  getTargetElement({ commit, getters }, streamId) {
    const rightKey = getters.getEmptyRightKey;
    console.log("@gettargetelement streamid, righKey: ", streamId, rightKey);
    if (rightKey === undefined) {
      console.log("@getsub NO EMPTY ID!");
      return null;
    }
    commit("addToRight", {
      key: rightKey,
      streamId
    });
    return rightKey;
  },

  getStreamLocation({ state, getters }, streamId) {
    const centralKey = getters.getCentralStreamKeys.find(e => state.CENTRAL_AREA[e] === streamId)
    if (centralKey !== undefined) return [centralKey, "central"];
    const rightKey = getters.getRightStreamKeys.find(e => state.RIGHT_AREA[e] === streamId);
    if (rightKey !== undefined) return [rightKey, "right"];
    return null;
  },

  moveFromCentralToCentral({ state, commit }, payload) {
    const streamId = state.CENTRAL_AREA[payload.beforeKey];
    console.log("@c2c move " + streamId + " from " + payload.beforeKey + " to " + payload.afterKey);
    
    commit("addToCentral", {
      key: payload.afterKey, 
      streamId
    });
    commit("removeFromCentral", payload.beforeKey);
    return streamId;
  },
  moveFromCentralToRight({ state, commit }, payload) {
    const streamId = state.CENTRAL_AREA[payload.centralKey];
    console.log("@c2r move "+ streamId + " from " + payload.centralKey + " to " + payload.rightKey);
    
    commit("addToRight", {
      key: payload.rightKey, 
      streamId
    });
    commit("removeFromCentral", payload.centralKey);
    return streamId;
  },
  moveFromRightToCentral({ state, commit }, payload) {
    const streamId = state.RIGHT_AREA[payload.rightKey];
    console.log("@r2c move "+ streamId + " from " + payload.rightKey + " to " + payload.centralKey);
    
    commit("addToCentral", {
      key: payload.centralKey, 
      streamId
    });
    commit("removeFromRight", payload.rightKey);
    return streamId;
  },
  moveFromRightToRight({ commit }, payload) {
    const streamId = state.RIGHT_AREA[payload.beforeKey];
    console.log("@c2c move "+ streamId + " from " + payload.beforeKey + " to " + payload.afterKey);
    
    commit("addToRight", {
      key: payload.afterKey, 
      streamId
    });
    commit("removeFromRight", payload.beforeKey);
    return streamId;
  },


  moveVideo({ dispatch }, payload) {
    const currentKey = payload.currentId;
    const targetKey = payload.targetId;
    
    console.log("@moveVideo keys and value:", currentKey, targetKey);
    // super boring stuff dont look
    const currentFirstLetters = currentKey.substring(0,3);
    const targetFirstLetters = targetKey.substring(0,3);
    if (currentFirstLetters === "cen") {
      if (targetFirstLetters === "cen") {
        return dispatch("moveFromCentralToCentral", {
          beforeKey: currentKey,
          afterKey: targetKey,
        });
      } else if (targetFirstLetters === "rig") {
        return dispatch("moveFromCentralToRight", {
          centralKey: currentKey,
          rightKey: targetKey,
        });
      }
    } else if (currentFirstLetters === "rig") {
      if (targetFirstLetters === "cen") {
        return dispatch("moveFromRightToCentral", {
          rightKey: currentKey,
          centralKey: targetKey,
        });
      } else if (targetFirstLetters === "rig") {
        return dispatch("moveFromRightToRight", {
          afterKey: targetKey,
          beforeKey: currentKey,
        });
      }
    } 
    return null;
  },

  





  /// OLD
  addReadyContainer(state, containerObject) {
    state.commit("addReadyContainer", containerObject);
  },

  removeFinalizedContainer(state, containerObjectId) {
    state.commit("removeFinalizedContainer", containerObjectId);
  },

  setStreamOnHold(state, streamObject) {
    state.commit("setStreamOnHold", streamObject);
  },

  removeStreamOnHold(state, streamObjectId) {
    state.commit("removeStreamOnHold", streamObjectId);
  },
};

const session = {
  namespaced: true,
  
  state,
  getters,
  mutations,
  actions
};

export default session;