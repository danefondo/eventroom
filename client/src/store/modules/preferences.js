const getDefaultState = () => {
  return {
    videoIsMirrored: false,
    customChatEmoji: String,
    theme: String,
    mode: String,
    layoutConfig: {
      generalLayoutConfig: 0,
      leaveConfig: 0,
      localVideoConfig: 0,
      remoteVideoConfig: 0,
      leftSideConfig: 0,
      rightSideConfig: 0,
    },
    userDesignPreferences: {
      logoColor: String,
      defaults: {
        textColor: String,
        fontFamily: String,
        fontSize: String,
        backgroundColor: String,
        backgroundImage: String,
      },
      navBar: {
        textColor: String,
        fontFamily: String,
        fontSize: String,
        backgroundColor: String,
        backgroundColorOnHover: String,
        backgroundImage: String,
        backgroundImageFit: String,
        backgroundImageOnHover: String,
        backgroundImageFitOnHover: String,
        borderColor: String,
        borderColorOnHover: String,
      },
      leftSidebar: {
        backgroundColor: String,
        borderColor: String,
        backgroundColorOnHover: String,
        borderColorOnHover: String,
        backgroundImage: String,
        backgroundImageFit: String,
      },
      iconDefaults: {
        defaultIconColor: String,
        defaultIconColorOnHover: String,
        defaultIconColorOnSelected: String,
        defaultIconBackgroundColor: String,
        defaultIconBackgroundColorOnHover: String,
        defaultIconBackgroundColorOnSelected: String,
        borderColor: String,
        borderColorOnHover: String,
        borderColorOnSelected: String,
      },
      microphone: {
        color: String,
        colorOnHover: String,
        colorSelected: String,
        backgroundColor: String,
        backgroundColorOnHover: String,
        backgroundColorOnSelected: String,
        borderColor: String,
        borderColorOnHover: String,
        borderColorOnSelected: String,
      },
      video: {
        color: String,
        colorOnHover: String,
        colorSelected: String,
        backgroundColor: String,
        backgroundColorOnHover: String,
        backgroundColorOnSelected: String,
        borderColor: String,
        borderColorOnHover: String,
        borderColorOnSelected: String,
      },
    },
    thisRoomDesignPreferences: {
      defaults: {
        defaultIconColor: String,
        defaultIconColorHover: String,
      },
      microphone: {
        color: String,
        colorOnHover: String,
        colorSelected: String,
        backgroundColor: String,
        backgroundColorOnHover: String,
        backgroundColorOnSelected: String,
        borderColor: String,
        borderColorOnHover: String,
        borderColorOnSelected: String,
      },
      video: {
        color: String,
        colorOnHover: String,
        colorSelected: String,
        backgroundColor: String,
        backgroundColorOnHover: String,
        backgroundColorOnSelected: String,
        borderColor: String,
        borderColorOnHover: String,
        borderColorOnSelected: String,
      },
    },
  };
};

// TODO
// Custom emoji-s
// MAKE THESE AS STRINGS
// SET INITIALLY DEFAULTS SAME AS DEFAULT SET COLORS, this could be initialized as user design preferences upon sign up;

// LEAVE ROOM ICON
// SCREENSHARE ICON
// SETTINGS ICON
// PEOPLE GROUP ICON

const state = getDefaultState();

// Synchronous
const mutations = {
  resetState(state) {
    // https://github.com/vuejs/vuex/issues/1118
    Object.assign(state, getDefaultState());
  },

  toggleMirror(state) {
    state.videoIsMirrored = !state.videoIsMirrored;
  },

  toggleLayout(state, layoutNum) {
    let layout = state.layoutConfig;
    for (var key in layout) {
      layout[key] = layoutNum;
    }
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

  toggleLayout(state, layoutNum) {
    state.commit("toggleLayout", layoutNum);
  },
};

const preferences = {
  namespaced: true,

  state,
  mutations,
  actions,
};

export default preferences;
