<template>
  <div>
    <div class="room-container">
      <h1>Video Chat</h1>
      <video id="local-video" ref="localvideo" height="150" autoplay></video>
      <video id="remote-video" ref="remotevideo" height="150" autoplay></video>
      <div>
        <button id="get-video" v-if="getVideo" @click="requestMediaStream">
          Get Video
        </button>
        <button id="call" :disabled="!callReady" @click="startCall">
          Call
        </button>
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

// import VideoChat from "../../config/webRTC/webRTC";

export default {
  name: "RoomPage",
  data() {
    return {
      // ready: false,
      // errors: false,
      // errorMessage: "",
      connected: false,
      localICECandidates: [],
      localStream: undefined,
      localVideo: undefined,
      remoteVideo: undefined,
      callReady: false,
      getVideo: true,
      peerConnection: undefined,
      offer: undefined,
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
    this.sockets.subscribe("ready", (data) => {
      console.log("data", data);
      this.readyToCall();
    });
    this.sockets.subscribe("offer", (data) => {
      console.log("offerData", data);
      //- save data for other client(s) too
      this.offer = data;
      this.onOffer();
    });
    this.sockets.subscribe("token", (data) => {
      console.log("tokenDataForOffer", data);

      this.onToken(data, "forOffer");
    });
    this.sockets.subscribe("candidate", (data) => {
      console.log("candidateData", data);
      this.onCandidate(data);
    });
    this.sockets.subscribe("answer", (data) => {
      console.log("answerData", data);
      this.onAnswer(data);
    });
    this.sockets.subscribe("tokenAgain", (data) => {
      console.log("tokenDataFromOnOffer", data);

      this.onToken(data, "onOffer");
    });
  },
  methods: {
    requestMediaStream() {
      // Start getUserMedia process
      console.log("@1: requestMediaStream");
      navigator.mediaDevices
        .getUserMedia({ video: true, audio: true })
        .then((stream) => {
          this.onMediaStream(stream);
        })
        .catch((error) => {
          console.log("err", error);
          this.noMediaStream(error);
        });
    },
    onMediaStream(stream) {
      // Get the video element.
      this.localVideo = this.$refs.localvideo;
      // Turn the volume down to 0 to avoid echoes.
      this.localVideo.volume = 0;
      this.localStream = stream;
      this.getVideo = false;

      // Add the stream as video's srcObject.
      // As the video has the `autoplay` attribute it will start to stream immediately.
      this.localVideo.srcObject = stream;
      // Now we're ready to join the chat room.
      this.$socket.emit("join", "test");
    },
    noMediaStream(error) {
      // There's not much to do in this demo if there is no media stream. So
      // let's just stop.
      console.log("No media stream for us.", error);
    },
    readyToCall() {
      // When we are ready to call, enable the Call button.
      this.callReady = true;
    },
    startCall() {
      // Set up a callback to run when we have the ephemeral token to use Twilio's
      // TURN server.
      console.log(">>> Sending token request...");
      this.$socket.emit("token");
    },
    // When we receive the ephemeral token back from the server.
    onToken(token, type) {
      console.log("<<< Received token", token);
      // Set up a new RTCPeerConnection using the token's iceServers.
      this.peerConnection = new RTCPeerConnection({
        iceServers: token.iceServers,
      });
      console.log("peerc", this.peerConnection);
      // Add the local video stream to the peerConnection.
      this.peerConnection.addStream(this.localStream);
      // Set up callbacks for the connection generating iceCandidates or
      // receiving the remote media stream.
      this.peerConnection.onicecandidate = this.onIceCandidate;
      this.peerConnection.onaddstream = this.onAddStream;
      // Set up listeners on the socket for candidates or answers being passed
      // over the socket connection.
      if (type == "forOffer") {
        this.createOffer();
      } else if (type == "onOffer") {
        this.createAnswer();
      }
    },
    onIceCandidate(event) {
      // When the peerConnection generates an ice candidate, send it over the socket
      // to the peer.
      let globalThis = this;
      if (event.candidate) {
        console.log(
          `<<< Received local ICE candidate from STUN/TURN server (${event.candidate.address})`
        );
        if (globalThis.connected) {
          console.log(
            `>>> Sending local ICE candidate (${event.candidate.address})`
          );
          globalThis.$socket.emit("candidate", JSON.stringify(event.candidate));
        } else {
          // If we are not 'connected' to the other peer, we are buffering the local ICE candidates.
          // This most likely is happening on the "caller" side.
          // The peer may not have created the RTCPeerConnection yet, so we are waiting for the 'answer'
          // to arrive. This will signal that the peer is ready to receive signaling.
          globalThis.localICECandidates.push(event.candidate);
        }
      }
    },
    onCandidate(candidate) {
      // When receiving a candidate over the socket, turn it back into a real
      // RTCIceCandidate and add it to the peerConnection.
      let rtcCandidate = new RTCIceCandidate(JSON.parse(candidate));
      console.log(
        `<<< Received remote ICE candidate (${rtcCandidate.address} - ${rtcCandidate.relatedAddress})`
      );
      this.peerConnection.addIceCandidate(rtcCandidate);
    },
    createOffer() {
      // Create an offer that contains the media capabilities of the browser.
      let globalThis = this;
      console.log(">>> Creating offer...");
      this.peerConnection.createOffer(
        function (offer) {
          console.log("yo offer 1", offer);
          globalThis.offer = offer;
          // If the offer is created successfully, set it as the local description
          // and send it over the socket connection to initiate the peerConnection
          // on the other side.
          globalThis.peerConnection.setLocalDescription(offer);
          globalThis.$socket.emit("offer", JSON.stringify(offer));
          console.log("offer 2");
        },
        function (err) {
          // Handle a failed offer creation.
          console.log(err, true);
        }
      );
    },
    createAnswer() {
      // Create an answer with the media capabilities that both browsers share.
      // This function is called with the offer from the originating browser, which
      // needs to be parsed into an RTCSessionDescription and added as the remote
      // description to the peerConnection object. Then the answer is created in the
      // same manner as the offer and sent over the socket.
      let globalThis = this;
      console.log(">>> Creating answer...", this.offer);
      this.connected = true;
      let rtcOffer = new RTCSessionDescription(JSON.parse(this.offer));
      this.peerConnection.setRemoteDescription(rtcOffer);
      this.peerConnection.createAnswer(
        function (answer) {
          console.log(answer);
          globalThis.peerConnection.setLocalDescription(answer);
          globalThis.$socket.emit("answer", JSON.stringify(answer));
        },
        function (err) {
          // Handle a failed answer creation.
          console.log(err, true);
        }
      );
    },
    onOffer() {
      // When a browser receives an offer, set up a callback to be run when the
      // ephemeral token is returned from Twilio.
      console.log("<<< Received offer");
      this.$socket.emit("tokenAgain");
    },
    onAnswer(answer) {
      // When an answer is received, add it to the peerConnection as the remote
      // description.
      let globalThis = this;
      console.log("<<< Received answer");
      var rtcAnswer = new RTCSessionDescription(JSON.parse(answer));
      this.peerConnection.setRemoteDescription(rtcAnswer);
      this.connected = true;
      this.localICECandidates.forEach((candidate) => {
        // The caller now knows that the callee is ready to accept new
        // ICE candidates, so sending the buffer over
        console.log(`>>> Sending local ICE candidate (${candidate.address})`);
        globalThis.$socket.emit("candidate", JSON.stringify(candidate));
      });
      // Resest the buffer of local ICE candidates. This is not really needed
      // in this specific client, but it's good practice
      this.localICECandidates = [];
    },
    onAddStream(event) {
      // When the peerConnection receives the actual media stream from the other
      // browser, add it to the other video element on the page.
      console.log("<<< Received new stream from remote. Adding it...", event);
      this.remoteVideo = this.$refs.remotevideo;
      this.remoteVideo.srcObject = event.stream;
      this.remoteVideo.volume = 0;
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