<template>
  <div>
    <div class="room-container">
      <h1>Video Chat</h1>
      <video id="local-video" height="150" autoplay></video>
      <video id="remote-video" height="150" autoplay></video>
      <div>
        <button id="get-video" @click="requestMediaStream">Get Video</button>
        <button id="call" disabled="disabled" @click="startCall">Call</button>
      </div>
      <div class="multi-button">
        <div class="buttonContainer">
          <button class="hoverButton" @click="muteMicrophone">
            <i id="mic-icon" class="fas fa-microphone fa-xs"></i>
          </button>
          <div class="HoverState" id="mic-text">Mute</div>
        </div>
        <div class="buttonContainer">
          <button class="hoverButton" @click="pauseVideo">
            <i class="fas fa-video fa-xs" id="video-icon"></i>
          </button>
          <div class="HoverState" id="video-text">Pause Video</div>
        </div>
        <div class="buttonContainer">
          <button class="hoverButton" id="share-button" @click="swap">
            <i id="swap-icon" class="fas fa-desktop fa-xs"></i>
          </button>
          <div class="HoverState" id="swap-text">Share Screen</div>
        </div>
        <div class="buttonContainer">
          <button
            class="hoverButton"
            id="pip-button"
            @click="togglePictureInPicture"
          >
            <i class="fas fa-external-link-alt fa-xs"></i>
          </button>
          <div class="HoverState" id="pip-text">Toggle Picture in Picture</div>
        </div>
      </div>
      <p>Log messages:</p>
      <div id="logs"></div>
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";
// import SessionController from "../../session/SessionController";
// import { requestWithAuthentication } from "../../config/api";

import VideoChat from "../../config/webRTC/webRTC";

export default {
  name: "RoomPage",
  data() {
    return {
      // ready: false,
      // errors: false,
      // errorMessage: "",
      connected: false,
      localICECandidates: [],
    };
  },
  computed: {
    ...mapState({
      user: (state) => state.auth.user,
      isAuthenticated: (state) => state.auth.authenticationStatus,
      isVerified: (state) => state.auth.verificationStatus,
      // connectionID: (state) => state.session.thisConnectionId,
      // sessionID: (state) => state.session.thisSessionId,
    }),
  },

  async mounted() {
    console.log("@eventroom mounted");
    // if (this.isAuthenticated) {
    //   this.getRoom();
    // }
    VideoChat.socket = this.$socket;
  },
  methods: {
    requestMediaStream() {
      // Start getUserMedia process
      VideoChat.requestMediaStream();
    },
    startCall() {
      // Start peerConnection
      VideoChat.startCall();
    },
    openFullscreen() {
      console.log("nothing for now");
    },
    muteMicrophone() {
      console.log("nothing for now");
    },
    pauseVideo() {
      console.log("nothing for now");
    },
    togglePictureInPicture() {
      console.log("nothing for now");
    },
    swap() {
      console.log("nothing for now");
    },
    //   async getRoom() {
    //     console.log("@getroom params:", this.$route.params);
    //     const result = await SessionController.initializeRoom(
    //       this.$route.params.eventId,
    //       this.$route.params.roomId
    //     );
    //     console.log("result: ", result);
    //     if (result.success) {
    //       this.$socket.emit("joinRoom", result.roomData);
    //       this.ready = true;
    //     } else {
    //       this.ready = true;
    //       this.errors = true;
    //     }
    //   },
    // },
    // /* eslint-disable no-unused-vars */
    // async beforeRouteLeave(to, from, next) {
    //   try {
    //     console.log(
    //       "@beforerouteleave connection id",
    //       this.connectionID,
    //       this.sessionID
    //     );
    //     requestWithAuthentication("post", `/api/events/disconnectFromEvent`, {
    //       // Probably unnecessary but idk
    //       sessionId: this.sessionID,
    //       connectionId: this.connectionID,
    //     })
    //       .then((result) => {
    //         console.log("@beforerouteleave response: ", result);
    //         SessionController.disconnect();
    //       })
    //       .then((result) => {
    //         console.log("@beforerouteleave no error?", result);
    //       })
    //       .catch((err) => {
    //         console.log("@beforerouteleave error:", err);
    //         this.ready = true;
    //         this.errors = true;
    //         this.errorMessage =
    //           "Problem with leaving this page, please refresh page.";
    //       });
    //   } catch (err) {
    //     // Probably if errors occur, the users will be stuck here endlessly but idc
    //     console.log("@beforerouteleave error:", err);
    //     this.ready = true;
    //     this.errors = true;
    //     this.errorMessage =
    //       "Problem with leaving this page, please refresh page.";
    //   }
    //   next();
  },
};
</script>

<style scoped>
</style>