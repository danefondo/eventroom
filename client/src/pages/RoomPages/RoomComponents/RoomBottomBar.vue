<template>
  <div class="toolbar-container">
    <div class="toolbar">
      <div class="buttonContainer">
        <button class="hoverButton">
          <i id="mic-icon" class="fas fa-microphone fa-xs">+ Invite</i>
        </button>
      </div>
      <div class="video-control-buttons" v-if="localStream">
        <div class="buttonContainer">
          <button
            class="hoverButton"
            id="share-button"
            @click="toggleScreenshare"
          >
            <i id="swap-icon" class="fas fa-desktop fa-xs">{{
              screenBeingShared ? "Stop screenshare" : "Share screen"
            }}</i>
          </button>
        </div>
        <!-- <div class="tooltip_container">
          <div
            :class="videoStatus ? 'video-call-button' : 'video-call-button-red'"
            @click="videoStatus ? turnOffVideo() : turnOnVideo()"
          >
            <img
              :src="videoStatus ? videoIcon : videoIconWhite"
              :class="videoStatus ? 'video-call-icon' : 'video-call-icon-white'"
            />
          </div>
          <div class="tooltip tooltip--top tooltip--middle">
            <span class="tooltip_tip">{{
              videoStatus ? "Turn camera off" : "Turn camera on"
            }}</span>
            <span class="tooltip_shortcut">C</span>
          </div>
        </div> -->
        <div class="buttonContainer">
          <button class="hoverButton" @click="toggleMedia(0)">
            <i class="fas fa-video fa-xs" id="video-icon">{{
              userMediaSettings.cameraOn ? "Pause video" : "Unpause video"
            }}</i>
          </button>
        </div>
        <div class="buttonContainer">
          <button class="hoverButton" @click="toggleMedia(1)">
            <i id="mic-icon" class="fas fa-microphone fa-xs">{{
              userMediaSettings.microphoneOn ? "Mute" : "Unmute"
            }}</i>
          </button>
        </div>
        <div class="buttonContainer" v-if="lessThanThreeInSession">
          <button
            class="hoverButton"
            id="pip-button"
            @click="togglePictureInPicture"
          >
            <i class="fas fa-external-link-alt fa-xs">{{
              pictureInPictureEnabled
                ? "Quit Picture In Picture"
                : "Picture In Picture"
            }}</i>
          </button>
        </div>
        <div class="buttonContainer">
          <button class="hoverButton" @click="toggleShutRestart">
            <i class="fas fa-video fa-xs" id="video-icon">{{
              userMediaSettings.cameraOn ? "Turn off video" : "Turn video on"
            }}</i>
          </button>
        </div>
      </div>
      <div class="buttonContainer leave-room">
        <button class="hoverButton">
          <i id="mic-icon" class="fas fa-microphone fa-xs">Leave room</i>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";
// import settings from "../../../assets/images/settings.png";
// import { requestWithAuthentication } from "../../../config/api";

export default {
  name: "RoomBottomBar",
  data() {
    return {
      errors: false,
      //   toolbarConfiguration: [],
      //   toolOpened: false,
      //   openedComponent: "",
    };
  },
  computed: {
    ...mapState({
      user: (state) => state.auth.user,
    }),
  },
  props: [
    "userMediaSettings",
    "localStream",
    "screenBeingShared",
    "lessThanThreeInSession",
    "pictureInPictureEnabled",
  ],
  methods: {
    toggleMedia(type) {
      this.$emit("toggleMedia", type);
    },
    toggleScreenshare() {
      this.$emit("toggleScreenshare");
    },
    togglePictureInPicture() {
      this.$emit("togglePictureInPicture");
    },
    toggleShutRestart() {
      this.$emit("toggleShutRestart");
    },
  },
};
</script>
<style scoped>
/* Only for debugging */
* {
  box-sizing: border-box;
}
.toolbar-container {
  height: 48px;
  width: 100%;
  border: 2px solid red;
  position: absolute;
  bottom: 0;
}

.toolbar {
  display: flex;
  flex-direction: row;
  position: relative;
  height: 100%;
  align-items: center;
  justify-content: center;
}

.video-control-buttons {
  display: flex;
  flex-direction: row;
}
.leave-room {
    position: absolute;
    right: 5px;
}
</style>
