<template>
  <div class="central-control-station">
    <div>
      <div id="hardware-setup" class="hardware-setup">
        <div class="media-feeds">
          <div class="video-feed">
            <div
              v-if="!mediaSettings.cameraDetected"
              class="camera-stream"
            >Your camera stream will appear here</div>
            <section>
              <aside id="http-message" v-if="!https">
                <p>To avoid repeated permissions prompts, run on https</p>
                <p>Devices will have generic labels (e.g., "camera 1") on http. For real device names, run on https.</p>
              </aside>
              <aside class="error-message" v-if="err">
                <p>{{errorMessage}}</p>
              </aside>
              <fieldset id="device-selection" ref="deviceSelection" v-if="showDeviceSelection">
                <legend>Select Devices</legend>
                <select
                  id="video-options"
                  v-model="videoDeviceId"
                  name="video-options"
                  ref="videoOptions"
                >
                  <option
                    v-for="device in videoDevices"
                    :value="device.deviceId"
                    :key="device.deviceId"
                  >{{device.label}}</option>
                </select>
                <br />
                <select
                  id="audio-options"
                  v-model="audioDeviceId"
                  name="audio-options"
                  ref="audioOptions"
                >
                  <option
                    v-for="device in audioDevices"
                    :value="device.deviceId"
                    :key="device.deviceId"
                  >{{device.label}}</option>
                </select>
                <br />
                <button
                  class="button button-small"
                  id="refresh-video"
                  @click="refreshVideo"
                >Get Media</button>
              </fieldset>
              <fieldset id="video-display" ref="display" v-if="showVideoDisplay">
                <legend>Video Result</legend>
                <aside id="get-started" v-if="getStarted">Press "Get Media" to start</aside>
                <video id="video-preview" muted="true" ref="preview"></video>
              </fieldset>
            </section>
          </div>
        </div>
        <div class="room-entrance">
          <div class="video-feed">
            <div>Eventroom</div>
            <div>You're about to j</div>
            <div>Join room</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";

import auth from "../../config/auth";
import { attachMediaStream } from "../../config/mediaDevices/attachMediaStream";
import { getUserMedia } from "../../config/mediaDevices/getUserMedia";
import { enumerateDevices } from "../../config/mediaDevices/enumerateDevices";
// import axios from "axios";
// import EventBox from "../../components/EventDiscoveryComponents/EventBox";

export default {
  name: "MediaDeviceCheckPage",
  data() {
    return {
      https: false,
      err: false,
      errorMessage: "Sorry, your browser doesn't support device enumeration",
      showVideoDisplay: true,
      showDeviceSelection: true,
      events: {},
      devices: {},
      videoDevices: [],
      audioDevices: [],
      mediaStreamInUse: undefined,
      getStarted: true,
      audioDeviceId: undefined,
      videoDeviceId: undefined,
      mediaSettings: {
        cameraDetected: false,
        cameraAccessGranted: false,
        selectedCameraSource: null,
      },
    };
  },
  //   components: {
  //     EventBox,
  //   },
  mounted() {
    this.updateDeviceOptions();

    if (window.location.protocol.indexOf("https") > -1) {
      this.https = true;
    }
  },
  computed: {
    ...mapState({
      user: (state) => state.auth.user,
      isAuthenticated: (state) => state.auth.authenticationStatus,
      isVerified: (state) => state.auth.verificationStatus,
    }),
    options() {
      return this.devices;
    },
  },
  methods: {
    setError(err, videoDisplay, deviceSelection) {
      if (videoDisplay) {
        this.showVideoDisplay = false;
      }

      if (deviceSelection) {
        this.showDeviceSelection = false;
      }
      // show error message with error
      this.err = true;
      this.errorMessage = err && err.message;
    },
    buildConstraints(audioDeviceId, videoDeviceId) {
      var mediaConstraints = {};
      if (audioDeviceId) {
        mediaConstraints.audio = {
          optional: [{ sourceId: audioDeviceId }],
        };
      } else {
        mediaConstraints.audio = true;
      }
      if (videoDeviceId) {
        mediaConstraints.video = {
          deviceId: { exact: videoDeviceId },
        };
      } else {
        mediaConstraints.video = true;
      }
      return mediaConstraints;
    },
    getVideoWithDevices(audioDeviceId, videoDeviceId) {
      let setError = this.setError;
      let globalThis = this;
      var constraints = this.buildConstraints(audioDeviceId, videoDeviceId);
      if (this.mediaStreamInUse && this.mediaStreamInUse !== null) {
        this.mediaStreamInUse.stop();
      }
      getUserMedia(constraints, function (err, stream) {
        let display = globalThis.$refs.display;
        if (setError(err, display)) return;
        var options = {
          mirror: true,
          muted: false,
          audio: false,
          autoPlay: true,
        };
        globalThis.mediaStreamInUse = stream;
        let preview = globalThis.$refs.preview;
        attachMediaStream(stream, preview, options);
        globalThis.updateDeviceOptions();
        globalThis.getStarted = false;
      });
    },
    refreshVideo() {
      this.getVideoWithDevices(this.audioDeviceId, this.videoDeviceId);
    },
    updateDeviceOptions() {
      let videoDisplay = this.$refs.display;
      let deviceSelection = this.$refs.deviceSelection;
      let setError = this.setError;
      let globalThis = this;
      enumerateDevices()
        .then(function (devices) {
          setError(null);
          var selectedAudio = globalThis.audioDeviceId;
          var selectedVideo = globalThis.videoDeviceId;

          globalThis.devices = {}; 
          globalThis.videoDevices = [];
          globalThis.audioDevices = [];
          globalThis.devices = devices;

          var audioDevicesCount = 0;
          var videoDevicesCount = 0;
          for (var i = 0; i < globalThis.devices.length; i++) {
            var device = globalThis.devices[i];
            if (device.kind === "audioinput") {
              audioDevicesCount++;
              if (!device.label) {
                device.label = "Microphone " + audioDevicesCount;
              }
              globalThis.audioDevices.push(device);
            } else if (device.kind === "videoinput") {
              videoDevicesCount++;
              if (!device.label) {
                device.label = "Camera " + videoDevicesCount;
              }
              globalThis.videoDevices.push(device);
            }
          }
          let audioWithId = document.querySelector(
            'select[name="audio-options"] option[value="' + selectedAudio + '"]'
          );
          if (selectedAudio && audioWithId) {
            globalThis.audioDeviceId = selectedAudio;
          } else {
            document.getElementById("audio-options").selectedIndex = 0;
          }

          let videoWithId = document.querySelector(
            'select[name="video-options"] option[value="' + selectedVideo + '"]'
          );
          if (selectedVideo && videoWithId) {
            globalThis.videoDeviceId = selectedVideo;
          } else {
            document.getElementById("video-options").selectedIndex = 0;
          }
        })
        .catch(function (err) {
          setError(err, videoDisplay, deviceSelection);
        });
    },
    logout() {
      auth.logout();
    },
  },
};
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&display=swap");
.hardware-setup {
  background-color: beige;
  width: 900px;
  height: 550px;
  margin-bottom: 60px;
  border-radius: 3px;
  display: flex;
  flex-direction: row;
}
.media-feeds {
  width: 50%;
  background-color: lightpink;
  display: flex;
  justify-content: center;
}
.video-feed {
  background-color: lightcoral;
  width: 350px;
  height: 300px;
}
.room-entrance {
  width: 50%;
  background-color: lightgreen;
}
/* COLORS
seashell
whitesmoke
lavender
lavenderblush
 */

/* .room-creator {
     display: flex;
     align-items: center;
 } */

.slug {
  font-size: 65px;
  width: 416px;
  margin-left: 3px;
  padding: 5px;
  padding-left: 10px;
  font-family: "Nunito", sans-serif;
  border: none;
  font-weight: 400;
  border-radius: 4px;
  color: #6e00ff;
  background-color: #f7f7fb;
}
.slug:focus {
  outline: none;
  background-color: #f7f7fb;
  color: #000;
  padding-left: 10px;
}
.events {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 200px)) !important;
  gap: 20px;
  width: 700px;
  padding-top: 20px;
}
.welcome,
.eventroom {
  font-size: 65px;
  font-weight: 600;
  margin-bottom: 5px;
  padding: 5px;
  font-family: "Nunito", sans-serif;
}
.welcome {
  max-width: 850px;
  font-size: 80px;
  font-weight: 700;
  color: #c1c1c7;
  color: #a0a0ab;
  color: #6e00ff;
}
.notice {
  font-size: 25px;
}
.central-control-station {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  height: 100%;
}
.central-controls {
  /* max-width: 350px; */
  margin-top: 75px;
  /* margin-bottom: 150px; */
  margin-bottom: 60px;
}
.create {
  outline: none;
  background-color: #000;
  color: white;
  font-size: 40px;
  font-weight: bold;
  border: unset;
  padding: 17px 10px;
  width: 100%;
  border-radius: 4px;
  cursor: pointer;
  display: block;
  margin-left: auto;
  margin-top: 30px;
  max-width: 300px;
  font-family: "Nunito", sans-serif !important;
  font-weight: 700;
}
.create:hover {
  background-color: #37373a;
}
</style>