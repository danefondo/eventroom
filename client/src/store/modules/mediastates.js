const getDefaultState = () => {
  return {
    RTCConfig: {
      twilio: true,
      vanillaRTC: false,
    },
    userMediaSettings: {
      cameraOn: false,
      microphoneOn: false,
      speakerOn: false,
      pictureInPictureEnabled: false,
      screenBeingShared: false,
    },
    vanillaRTC: {
      localStream: null,
    },
    twilioVideo: {
      localVideoTrack: null,
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

  toggleMediaSetting(state, settingToToggle) {
    console.log("ABOUT TO TOGGLE: ", settingToToggle);
    state.userMediaSettings[settingToToggle] = !state.userMediaSettings[
      settingToToggle
    ];
  },

  setSpecificMediaSettingState(state, settingData) {
    console.log("ABOUT TO SET: ", settingData);
    state.userMediaSettings[settingData.settingToToggle] =
      settingData.settingState;
  },

  setManyMediaSettingStates(state, settingsData) {
    for (var key in settingsData) {
      state.userMediaSettings[key] = settingsData[key];
    }
  },

  setVanillaRTCLocalStream(state, stream) {
    state.vanillaRTC.localStream = stream;
  },

  setTwilioVideoLocalStream(state, localVideoTrack) {
    state.twilioVideo.localVideoTrack = localVideoTrack;
  },
};

// Asynchronous
const actions = {
  resetState(state) {
    state.commit("resetState");
  },

  toggleMediaSetting(state, settingToToggle) {
    state.commit("toggleMediaSetting", settingToToggle);
  },

  setSpecificMediaSettingState(state, settingData) {
    state.commit("setSpecificMediaSettingState", settingData);
  },

  setManyMediaSettingStates(state, settingsData) {
    state.commit("setManyMediaSettingStates", settingsData);
  },

  /* vanillaRTC */

  setVanillaRTCLocalStream(state, stream) {
    state.commit("setVanillaRTCLocalStream", stream);
  },

  /* twilioVideo */

  setTwilioVideoLocalStream(state, localVideoTrack) {
    state.commit("setTwilioVideoLocalStream", localVideoTrack);
  },
};

const mediastates = {
  namespaced: true,

  state,
  mutations,
  actions,
};

export default mediastates;
