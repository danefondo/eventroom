function logIt(message, error) {
  // Print on console
  console.log(message);

  // Add to logs on page
  let logs = document.getElementById("logs");
  let tmp = document.createElement("P");
  tmp.innerText = message;
  if (error) {
    tmp.classList.add("error");
  }
  logs.appendChild(tmp);
}

// Create an object to save various objects to without polluting the global
// namespace.
var VideoChat = (module.exports = {
  connected: false,
  localICECandidates: [],

  // Initialise our connection to the WebSocket.
  // socket: io(),

  // Call to getUserMedia (provided by adapter.js for cross browser compatibility)
  // asking for access to both the video and audio streams. If the request is
  // accepted callback to the onMediaStream function, otherwise callback to the
  // noMediaStream function.
  requestMediaStream: function() {
    console.log("made it here");
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        VideoChat.onMediaStream(stream);
      })
      .catch((error) => {
        console.log("err", error);
        VideoChat.noMediaStream(error);
      });
  },

  // The onMediaStream function receives the media stream as an argument.
  onMediaStream: function(stream) {
    // Get the video element.
    VideoChat.localVideo = document.getElementById("local-video");
    // Turn the volume down to 0 to avoid echoes.
    VideoChat.localVideo.volume = 0;
    VideoChat.localStream = stream;
    let videoButton = document.getElementById("get-video");
    videoButton.setAttribute("disabled", "disabled");
    // Add the stream as video's srcObject.
    // As the video has the `autoplay` attribute it will start to stream immediately.
    VideoChat.localVideo.srcObject = stream;
    // Now we're ready to join the chat room.
    VideoChat.socket.emit("join", "test");
    // VideoChat.sockets.subscribe("ready", (data) => {
    //   console.log("data", data);
    //   VideoChat.readyToCall();
    // });
    // VideoChat.sockets.subscribe("offer", (data) => {
    //   console.log("offerData", data);
    //   VideoChat.onOffer(data);
    // });
    VideoChat.socket.on("ready", VideoChat.readyToCall);
    VideoChat.socket.on("offer", VideoChat.onOffer);
  },

  // There's not much to do in this demo if there is no media stream. So
  // let's just stop.
  noMediaStream: function(error) {
    logIt("No media stream for us.", error);
    // Sad trombone.
  },

  // When we are ready to call, enable the Call button.
  readyToCall: function() {
    console.log("errrrd");
    let callButton = document.getElementById("call");
    callButton.removeAttribute("disabled");
  },

  // Set up a callback to run when we have the ephemeral token to use Twilio's
  // TURN server.
  startCall: function() {
    logIt(">>> Sending token request...");
    VideoChat.socket.on("token", VideoChat.onToken(VideoChat.createOffer));
    // VideoChat.sockets.subscribe("token", (data) => {
    //   console.log("tokenDataForOffer", data);
    //   VideoChat.onToken(data);
    // });
    VideoChat.socket.emit("token");
  },

  // When we receive the ephemeral token back from the server.
  onToken: function(callback) {
    return function(token) {
      logIt("<<< Received token");
      // Set up a new RTCPeerConnection using the token's iceServers.
      VideoChat.peerConnection = new RTCPeerConnection({
        iceServers: token.iceServers,
      });
      // Add the local video stream to the peerConnection.
      VideoChat.peerConnection.addStream(VideoChat.localStream);
      // Set up callbacks for the connection generating iceCandidates or
      // receiving the remote media stream.
      VideoChat.peerConnection.onicecandidate = VideoChat.onIceCandidate;
      VideoChat.peerConnection.onaddstream = VideoChat.onAddStream;
      // Set up listeners on the socket for candidates or answers being passed
      // over the socket connection.
      VideoChat.socket.on("candidate", VideoChat.onCandidate);
      VideoChat.socket.on("answer", VideoChat.onAnswer);
      callback();
    };
  },

  // When the peerConnection generates an ice candidate, send it over the socket
  // to the peer.
  onIceCandidate: function(event) {
    if (event.candidate) {
      logIt(
        `<<< Received local ICE candidate from STUN/TURN server (${event.candidate.address})`
      );
      if (VideoChat.connected) {
        logIt(`>>> Sending local ICE candidate (${event.candidate.address})`);
        VideoChat.socket.emit("candidate", JSON.stringify(event.candidate));
      } else {
        // If we are not 'connected' to the other peer, we are buffering the local ICE candidates.
        // This most likely is happening on the "caller" side.
        // The peer may not have created the RTCPeerConnection yet, so we are waiting for the 'answer'
        // to arrive. This will signal that the peer is ready to receive signaling.
        VideoChat.localICECandidates.push(event.candidate);
      }
    }
  },

  // When receiving a candidate over the socket, turn it back into a real
  // RTCIceCandidate and add it to the peerConnection.
  onCandidate: function(candidate) {
    let rtcCandidate = new RTCIceCandidate(JSON.parse(candidate));
    logIt(
      `<<< Received remote ICE candidate (${rtcCandidate.address} - ${rtcCandidate.relatedAddress})`
    );
    VideoChat.peerConnection.addIceCandidate(rtcCandidate);
  },

  // Create an offer that contains the media capabilities of the browser.
  createOffer: function() {
    logIt(">>> Creating offer...");
    console.log("vidChat", VideoChat);
    VideoChat.peerConnection.createOffer(
      function(offer) {
        // If the offer is created successfully, set it as the local description
        // and send it over the socket connection to initiate the peerConnection
        // on the other side.
        VideoChat.peerConnection.setLocalDescription(offer);
        VideoChat.socket.emit("offer", JSON.stringify(offer));
      },
      function(err) {
        // Handle a failed offer creation.
        logIt(err, true);
      }
    );
  },

  // Create an answer with the media capabilities that both browsers share.
  // This function is called with the offer from the originating browser, which
  // needs to be parsed into an RTCSessionDescription and added as the remote
  // description to the peerConnection object. Then the answer is created in the
  // same manner as the offer and sent over the socket.
  createAnswer: function(offer) {
    return function() {
      logIt(">>> Creating answer...");
      VideoChat.connected = true;
      let rtcOffer = new RTCSessionDescription(JSON.parse(offer));
      VideoChat.peerConnection.setRemoteDescription(rtcOffer);
      VideoChat.peerConnection.createAnswer(
        function(answer) {
          console.log(answer);
          VideoChat.peerConnection.setLocalDescription(answer);
          VideoChat.socket.emit("answer", JSON.stringify(answer));
        },
        function(err) {
          // Handle a failed answer creation.
          logIt(err, true);
        }
      );
    };
  },

  // When a browser receives an offer, set up a callback to be run when the
  // ephemeral token is returned from Twilio.
  onOffer: function(offer) {
    logIt("<<< Received offer");
    VideoChat.socket.on(
      "token",
      VideoChat.onToken(VideoChat.createAnswer(offer))
    );
    VideoChat.socket.emit("token");
  },

  // When an answer is received, add it to the peerConnection as the remote
  // description.
  onAnswer: function(answer) {
    logIt("<<< Received answer");
    var rtcAnswer = new RTCSessionDescription(JSON.parse(answer));
    VideoChat.peerConnection.setRemoteDescription(rtcAnswer);
    VideoChat.connected = true;
    VideoChat.localICECandidates.forEach((candidate) => {
      // The caller now knows that the callee is ready to accept new
      // ICE candidates, so sending the buffer over
      logIt(`>>> Sending local ICE candidate (${candidate.address})`);
      VideoChat.socket.emit("candidate", JSON.stringify(candidate));
    });
    // Resest the buffer of local ICE candidates. This is not really needed
    // in this specific client, but it's good practice
    VideoChat.localICECandidates = [];
  },

  // When the peerConnection receives the actual media stream from the other
  // browser, add it to the other video element on the page.
  onAddStream: function(event) {
    logIt("<<< Received new stream from remote. Adding it...");
    VideoChat.remoteVideo = document.getElementById("remote-video");
    VideoChat.remoteVideo.srcObject = event.stream;
    VideoChat.remoteVideo.volume = 0;
  },
});
