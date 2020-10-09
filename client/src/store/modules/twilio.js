const getDefaultState = () => {
  return {
    twilioRoomData: {
      roomName: "",
    },
    loading: false,
    data: {},
    localTrack: false,
    remoteTrack: "",
    activeRoom: "",
    previewTracks: "",
    identity: "",
    roomId: null,
    room: null,
    localVideoTrack: null,
    localVideoBlock: null,
    participants: [],
    remoteParticipant: {
      identity: "",
      sid: "",
    },
    localParticipant: {
      identity: "",
      sid: "",
    },
  };
};

const state  = getDefaultState()

// Synchronous
const mutations = {
  resetState(state) {
    // Merge rather than replace so we don't lose observers
    // https://github.com/vuejs/vuex/issues/1118
    Object.assign(state, getDefaultState());
  },

  createNewRoom(state, roomName) {
    state.twilioRoomData.roomName = roomName;
  },
};

// Asynchronous
const actions = {
  resetState(state) {
    state.commit("resetState");
  },
  createNewRoom(state, roomName) {
    state.commit("createNewRoom", roomName);
  },
};

const twilio = {
  namespaced: true,

  state,
  mutations,
  actions,
};

export default twilio;
