<template>
  <div class="room-container">
    <RoomToolbar />
    <div class="video-chat">
      <h1>Video Chat</h1>
      <div class="video-streams">
        <video id="local-video" ref="localvideo" height="150" autoplay></video>
        <video
          id="remote-video"
          ref="remotevideo"
          height="150"
          autoplay
        ></video>
      </div>
      <div>
        <!-- <button id="get-video" v-if="getVideo" @click="requestMediaStream">
          Get Video
        </button> -->
        <!-- <button id="call" :disabled="!callReady" @click="startCall">
          Call
        </button> -->
      </div>
      <RoomBottomBar
        :userMediaSettings="userMediaSettings"
        :screenBeingShared="screenBeingShared"
        :localStream="localStream"
        :lessThanThreeInSession="lessThanThreeInSession"
        :pictureInPictureEnabled="pictureInPictureEnabled"
        @toggleMedia="toggleMedia"
        @toggleScreenshare="toggleScreenshare"
        @togglePictureInPicture="togglePictureInPicture"
        @toggleShutRestart="toggleShutRestart"
      />
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";
import RoomToolbar from "./RoomComponents/RoomToolbar";
import RoomBottomBar from "./RoomComponents/RoomBottomBar";
// import SessionController from "../../session/SessionController";
// import { requestWithAuthentication } from "../../config/api";

export default {
  name: "RoomPage",
  data() {
    return {
      // ready: false,
      // errors: false,
      // errorMessage: "",
      type: 0,
      connected: false,
      localICECandidates: [],
      localStream: undefined,
      localVideo: undefined,
      remoteVideo: undefined,
      callReady: false,
      getVideo: true,
      peerConnection: undefined,
      offer: undefined,
      screenBeingShared: false,
      pictureInPictureEnabled: false,
      lessThanThreeInSession: true,
      userMediaSettings: {
        cameraOn: false,
        microphoneOn: false,
        speakerOn: false,
      },
      userMediaDefaultPreferences: {
        cameraOn: true,
        microphoneOn: true,
        speakerOn: true,
      },
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
  components: {
    RoomToolbar,
    RoomBottomBar,
  },
  async mounted() {
    console.log("@eventroom mounted");
    // if (this.isAuthenticated) {
    //   this.getRoom();
    // }
    this.getAndSetMediaPreferences();
    this.requestMediaStream();

    this.sockets.subscribe("peerJoined", (data) => {
      console.log("peerJoined", data);
      this.startCall();
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
    this.sockets.subscribe("ready", (data) => {
      console.log("data", data);
      this.readyToCall();
      this.$socket.emit("peerJoin");
    });
  },
  methods: {
    toggleShutRestart() {
      if (this.type === 0) {
        this.stopVideo();
        this.type = 1;
      } else if (this.type === 1) {
        this.restartVideo();
        this.type = 0;
      }
    },
    createTemporaryDummyData() {
      let userMediaDefaultPreferences = {
        cameraOn: true,
        microphoneOn: true,
        speakerOn: true,
      };
      return userMediaDefaultPreferences;
    },
    getAndSetMediaPreferences() {
      console.log("setting media preferences from vuex & database defaults");
      // If user, check database

      // If no user, check vuex

      // Set temporary dummy data
      let dummyData = this.createTemporaryDummyData();
      let userPreferences = this.userMediaDefaultPreferences;
      let mediaSettings = this.userMediaSettings;

      // Synchronize local data with database / vuex
      userPreferences.cameraOn = dummyData.cameraOn;
      userPreferences.microphoneOn = dummyData.microphoneOn;
      userPreferences.speakerOn = dummyData.speakerOn;

      mediaSettings.cameraOn = dummyData.cameraOn;
      mediaSettings.microphoneOn = dummyData.microphoneOn;
      mediaSettings.speakerOn = dummyData.speakerOn;
    },
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
      stream = this.processStream(stream);
      this.localStream = stream;
      this.getVideo = false;

      // Add the stream as video's srcObject.
      // As the video has the `autoplay` attribute it will start to stream immediately.
      this.localVideo.srcObject = stream;
      // Now we're ready to join the chat room.
      this.$socket.emit("join", "test");
    },
    processStream(stream) {
      let streamTracks = stream.getTracks();

      let streamAudioTrack = streamTracks.find((track) => {
        return track.kind === "audio";
      });

      let streamVideoTrack = streamTracks.find((track) => {
        return track.kind === "video";
      });

      // Check user preferences for audio on / audio off
      let preferences = this.userMediaDefaultPreferences;

      if (!preferences.cameraOn) {
        console.log("video track", streamVideoTrack);
        // streamVideoTrack.enabled = !streamVideoTrack.enabled;
      }

      if (!preferences.microphoneOn) {
        streamAudioTrack.enabled = !streamAudioTrack.enabled;
      }

      // if (preferences.speakerOn) {
      //   let localTrack = localTracks.find((track) => {
      //     return track.kind === "audio";
      //   });

      //   localTrack.enabled = !localTrack.enabled;
      // }

      return stream;
    },
    noMediaStream(error) {
      // There's not much to do in this demo if there is no media stream. So
      // let's just stop.
      console.log("No media stream for us.", error);
    },
    readyToCall() {
      // When we are ready to call, enable the Call button.
      this.callReady = true;
      // Start call
      // Set up a callback to run when we have the ephemeral token to use Twilio's
      // TURN server.

      // console.log(">>> Sending token request...");
      // this.$socket.emit("token");
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
      let globalThis = this;
      this.peerConnection = new RTCPeerConnection({
        iceServers: token.iceServers,
      });
      console.log("peerc", this.peerConnection);
      // Add the local video stream to the peerConnection.
      // this.peerConnection.addStream(this.localStream); DEPRECATED
      this.localStream.getTracks().forEach(function (track) {
        console.log("trackk", track);
        globalThis.peerConnection.addTrack(track, globalThis.localStream);
        console.log("peerctest", globalThis.peerConnection);
      });
      // Set up callbacks for the connection generating iceCandidates or
      // receiving the remote media stream.
      this.peerConnection.onicecandidate = this.onIceCandidate;
      // this.peerConnection.onaddstream = this.onAddStream; DEPRECATED
      this.peerConnection.ontrack = this.onAddStream;

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
      let rtcOffer = new RTCSessionDescription(JSON.parse(globalThis.offer));
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
      // this.remoteVideo.srcObject = event.stream; DEPRECATED, only worked with .onaddstream & addStream
      this.remoteVideo.srcObject = event.streams[0];
      this.remoteVideo.volume = 0;
    },
    openFullscreen() {
      console.log("nothing for now");
    },
    toggleMedia(type) {
      if (type === 0) {
        type = "video";
      } else if (type === 1) {
        type = "audio";
      }

      let localTracks = this.localStream.getTracks();

      // Find local stream video track
      let localTrack = localTracks.find((track) => {
        return track.kind === type;
      });

      // Reverse realtime state of local stream video
      localTrack.enabled = !localTrack.enabled;

      let tracks;

      // Check for peerConnection
      if (this.peerConnection) {
        tracks = this.peerConnection.getSenders();
      }

      // Check if peerConnection & tracks already exist
      if (tracks) {
        // Find peerConnection video track
        let peerTrack = tracks.find((sender) => {
          return sender.track.kind === type;
        });

        // Reverse realtime state of peer connection audio
        peerTrack.enabled = !peerTrack.enabled;
      }

      if (type === "video") {
        // Update local data with realtime audio state
        this.userMediaSettings.cameraOn = localTrack.enabled;
      } else if (type === "audio") {
        // Update local data with realtime audio state
        this.userMediaSettings.microphoneOn = localTrack.enabled;
      }
    },
    stopVideo() {
      this.localVideo.pause();
      this.localVideo.src = "";
      this.localVideo.srcObject = null;
      this.localVideo.mozSrcObject = null;
      let localTracks = this.localStream.getTracks();

      //- Possibly need to make sure that it is also the CORRECT video stream by id?
      var videoTrack = localTracks.find((track) => {
        return track.kind === "video";
      });
      videoTrack.stop();

      let tracks;

      // Check for peerConnection
      if (this.peerConnection) {
        tracks = this.peerConnection.getSenders();
      }

      // Check if peerConnection & tracks already exist
      if (tracks) {
        // Find peerConnection video track
        let peerTrack = tracks.find((sender) => {
          return sender.track.kind === "video";
        });

        this.peerConnection.removeTrack(peerTrack);
      }

      this.userMediaSettings.cameraOn = false;
    },
    restartVideo() {
      // 1. Get media again
      // 2. Get correct track
      // 3. Replace track
      // 4. Start sending again
      console.log("@2: restarting stream");
      let globalThis = this;

      navigator.mediaDevices
        .getUserMedia({ video: true, audio: false })
        .then((stream) => {
          // Get the video element.
          globalThis.localVideo = globalThis.$refs.localvideo;
          // Turn the volume down to 0 to avoid echoes.
          globalThis.localVideo.volume = 0;
          globalThis.localStream = stream;

          // Add the stream as video's srcObject.
          // As the video has the `autoplay` attribute it will start to stream immediately.
          globalThis.localVideo.srcObject = stream;

          let localTracks = globalThis.localStream.getTracks();

          let peerTracks;
          // Check for peerConnection
          if (globalThis.peerConnection) {
            // Set peer senders
            peerTracks = globalThis.peerConnection.getSenders();
          }

          // Check if peerConnection & tracks exist
          if (peerTracks) {
            // peerTracks.forEach((sender) => this.peerConnection.removeTrack(sender));
            localTracks.forEach((track) =>
              globalThis.peerConnection.addTrack(track, globalThis.localStream)
            );
            // this.peerConnection.ontrack = this.onAddStream;
            globalThis.userMediaSettings.cameraOn = true;
          }
        })
        .catch((error) => {
          console.log("err", error);
          globalThis.noMediaStream(error);
        });
    },
    //Picture in picture
    togglePictureInPicture() {
      let remoteVideoVanilla = this.remoteVideo;
      let globalThis = this;
      if (
        "pictureInPictureEnabled" in document ||
        remoteVideoVanilla.webkitSetPresentationMode
      ) {
        if (document.pictureInPictureElement) {
          document.exitPictureInPicture().catch((error) => {
            console.log("Error exiting pip.", error);
          });
          globalThis.pictureInPictureEnabled = false;
        } else if (remoteVideoVanilla.webkitPresentationMode === "inline") {
          remoteVideoVanilla.webkitSetPresentationMode("picture-in-picture");
          globalThis.pictureInPictureEnabled = true;
        } else if (
          remoteVideoVanilla.webkitPresentationMode === "picture-in-picture"
        ) {
          remoteVideoVanilla.webkitSetPresentationMode("inline");
          globalThis.pictureInPictureEnabled = true;
        } else {
          remoteVideoVanilla.requestPictureInPicture().catch((error) => {
            alert(
              "You must be connected to another person to enter picture in picture.",
              error
            );
          });
        }
      } else {
        alert(
          "Picture in picture is not supported in your browser. Consider using Chrome or Safari."
        );
      }
    },
    toggleScreenshare() {
      let globalThis = this;
      console.log("nothing for now");
      if (this.screenBeingShared) {
        // Stop screenshare
        // Stop the screen share track
        this.localVideo.srcObject.getTracks().forEach((track) => track.stop());
        // Get webcam input
        navigator.mediaDevices
          .getUserMedia({
            video: true,
            audio: true,
          })
          .then(function (stream) {
            // Change display mode
            globalThis.screenBeingShared = !globalThis.screenBeingShared;
            globalThis.switchStreams(stream);
          });
      } else {
        // Request screen share, note we dont want to capture audio
        // as we already have the stream from the Webcam
        navigator.mediaDevices
          .getDisplayMedia({
            video: true,
            audio: false,
          })
          .then(function (stream) {
            // Change display mode
            globalThis.screenBeingShared = !globalThis.screenBeingShared;
            globalThis.switchStreams(stream);
          })
          .catch(function (err) {
            console.log("Error sharing screen", err);
          });
      }
    },
    switchStreams(stream) {
      let globalThis = this;
      // Get current video track
      let videoTrack = stream.getVideoTracks()[0];
      // Add listen for if the current track swaps, swap back
      videoTrack.onended = function () {
        globalThis.toggleScreenshare();
      };
      if (this.connected) {
        // Find sender
        const sender = this.peerConnection.getSenders().find(function (s) {
          // make sure tack types match
          return s.track.kind === videoTrack.kind;
        });
        // Replace sender track
        sender.replaceTrack(videoTrack);
      }
      // Update local video stream
      this.localStream = videoTrack;
      // Update local video object
      this.localVideo.srcObject = stream;
      // // Unpause video on swap
      // if (videoIsPaused) {
      //   pauseVideo();
      // }
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
.room-container {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: row;
  /* justify-content: center; */
  align-items: center;
}

.video-chat {
  height: 100%;
  width: 100%;
  position: relative;
}

.video-streams {
  display: flex;
  justify-content: center;
}
</style>