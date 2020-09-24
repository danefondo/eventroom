<template>
  <div class="central-control-station">
    <div>
      <div id="hardware-setup" class="hardware-setup">
        <div class="media-feeds">
          <div class="video-feed">
            <div
              v-if="!mediaSettings.cameraDetected && !mediaSettings.cameraTurnedOn && isWebsiteHasWebcamPermissions && isWebsiteHasMicrophonePermissions"
              class="media-info"
            >Your camera stream will appear here</div>
            <div
              v-if="!isWebsiteHasWebcamPermissions || !isWebsiteHasMicrophonePermissions"
              class="media-info"
            >Please allow camera and audio access.</div>
            <video
              id="video-preview"
              v-if="mediaSettings.cameraTurnedOn"
              class="camera-stream"
              muted="true"
              ref="preview"
            ></video>
          </div>
          <div id="pids" class="pids-wrapper">
            <div class="pid"></div>
            <div class="pid"></div>
            <div class="pid"></div>
            <div class="pid"></div>
            <div class="pid"></div>
            <div class="pid"></div>
            <div class="pid"></div>
            <div class="pid"></div>
            <div class="pid"></div>
            <div class="pid"></div>
          </div>
          <MediaControlButtons
            :videoStatus="mediaSettings.cameraTurnedOn"
            :audioStatus="mediaSettings.audioTurnedOn"
            :settingsActive="settingsActive"
            @turnOffVideo="turnOffVideo"
            @turnOnVideo="turnOnVideo"
            @toggleAudio="toggleAudio"
            @toggleSettings="toggleSettings"
          />
          <ChangeMediaDevice
            v-if="settingsActive && mediaData.audioDevices && mediaData.audioDevices && mediaData.audioDeviceId && mediaData.videoDeviceId"
            :mediaData="mediaData"
            @videoDeviceId="setVideoDeviceId"
            @audioDeviceId="setAudioDeviceId"
            @toggleSettings="toggleSettings"
          />
          <section v-if="settingsActive">
            <aside class="error-message" v-if="err">
              <p>{{errorMessage}}</p>
            </aside>
          </section>
          <div
            class="toggle-prereview"
            v-if="roomType === 'open' && mediaSettings.showPreReviewOnOpenRooms && isAuthenticated && isVerified"
          >
            <input
              id="disable-prereview"
              type="checkbox"
              @click="togglePreReviewSetting"
              class="disable-prereview-checkbox"
            />
            <label for="disable-prereview">Don't show this page next time when joining an open room.</label>
          </div>
          <router-link
            to="/register"
            class="sign-up-proposal"
            v-if="!isAuthenticated"
          >Sign up to save default preferences.</router-link>
        </div>
        <div class="room-entrance">
          <div class="entrance">
            <div class="eventroom-logo">You're about to join...</div>
            <div class="eventroom-link">
              <img
                :src="roomType === 'open' ? openLock : closedLock"
                :class="roomType === 'closed' ? 'open-lock-icon' : 'closed-lock-icon'"
              />
              <span class="eventroom-slash">eventroom.to/</span>
              <span class="eventroom-to">blue-squirrel</span>
            </div>
            <!-- <div>request / knock / password (based on case) / join (you're in invite list, open for you)</div> -->
            <div
              :class="roomType === 'open' ? 'join-room' : 'request-to-join'"
            >{{roomType === 'open' ? 'Join room' : 'Request to join'}}</div>
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
import MediaControlButtons from "./MediaComponents/MediaControlButtons";
import ChangeMediaDevice from "./MediaComponents/ChangeMediaDevice";
import DetectRTC from "detectrtc";
import openLock from "../../assets/images/padlock-unlock.png";
import closedLock from "../../assets/images/padlock.png";

export default {
  name: "MediaDeviceCheckPage",
  data() {
    return {
      openLock: openLock,
      closedLock: closedLock,
      err: false,
      roomType: "open",
      errorMessage: "Sorry, your browser doesn't support device enumeration",
      showVideoDisplay: true,
      showDeviceSelection: true,
      devices: {},
      mediaStreamInUse: undefined,
      video: null,
      audioContext: undefined,
      audioAnalyser: undefined,
      audioMicrophone: undefined,
      javascriptNode: undefined,
      hasWebcam: false,
      hasMicrophone: false,
      hasSpeakers: false,
      isWebsiteHasWebcamPermissions: false,
      isWebsiteHasMicrophonePermissions: false,
      settingsActive: false,
      mediaData: {
        audioDeviceId: undefined,
        videoDeviceId: undefined,
        videoDevices: [],
        audioDevices: [],
      },
      mediaSettings: {
        cameraDetected: false,
        cameraAccessGranted: false,
        selectedCameraSource: null,
        selectedAudioSource: null,
        cameraTurnedOn: false,
        audioTurnedOn: false,
        showPreReviewOnOpenRooms: true,
      },
    };
  },
  components: {
    MediaControlButtons,
    ChangeMediaDevice,
  },
  mounted() {
    // this.updateDeviceOptions();
    this.getMediaWithDevices();
    console.log("rtc", DetectRTC.browser);

    this.checkDeviceSupport();
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
  beforeRouteLeave(to, from, next) {
    this.mediaStreamInUse.getTracks().forEach((track) => track.stop());

    //- Must disconnect or if you change route and return
    //- The audio bar will be double initialized
    //- Thus it will be malfunctional
    this.disconnectAudioContext();
    next();
  },
  methods: {
    toggleSettings() {
      this.settingsActive = !this.settingsActive;
    },
    setAudioDeviceId(deviceId) {
      this.mediaData.audioDeviceId = deviceId;
    },
    setVideoDeviceId(deviceId) {
      this.mediaData.videoDeviceId = deviceId;
    },
    togglePreReviewSetting() {
      // Next time don't show.
    },
    checkDeviceSupport() {
      let globalThis = this;

      DetectRTC.load(function () {
        console.log("detectrtc", DetectRTC);
        globalThis.hasWebcam = DetectRTC.hasWebcam; // (has webcam device!)
        globalThis.hasMicrophone = DetectRTC.hasMicrophone; // (has microphone device!)
        globalThis.hasSpeakers = DetectRTC.hasSpeakers; // (has speakers!)
        globalThis.isWebsiteHasWebcamPermissions =
          DetectRTC.isWebsiteHasWebcamPermissions;
        globalThis.isWebsiteHasMicrophonePermissions =
          DetectRTC.isWebsiteHasMicrophonePermissions;
      });
    },
    turnOffVideo() {
      this.video.pause();
      this.video.src = "";
      this.video.srcObject = null;
      this.video.mozSrcObject = null;
      let tracks = this.mediaStreamInUse.getTracks();

      //- Possibly need to make sure that it is also the CORRECT video stream by id?
      var videoTrack = tracks.find((track) => {
        return track.kind === "video";
      });
      videoTrack.stop();
      this.mediaSettings.cameraTurnedOn = false;
    },
    turnOnVideo() {
      console.log("yooo");
      this.getMediaWithDevices(true);
    },
    toggleAudio(boolean) {
      let tracks = this.mediaStreamInUse.getTracks();
      var audioTrack = tracks.find((track) => {
        return track.kind === "audio";
      });
      console.log("audio track", audioTrack);
      audioTrack.enabled = boolean;
      this.mediaSettings.audioTurnedOn = boolean;
      if (!boolean) {
        console.log("1");
        this.disconnectAudioContext();
        console.log("2");
      } else {
        this.getMediaWithDevices(null, true);
      }
    },
    setError(err, videoDisplay, deviceSelection) {
      if (videoDisplay) {
        // this.showVideoDisplay = false;
      }

      if (deviceSelection) {
        this.showDeviceSelection = false;
      }
      // show error message with error
      this.err = true;
      this.errorMessage = err && err.message;
    },
    buildConstraints() {
      var mediaConstraints = {};
      if (this.mediaData.audioDeviceId) {
        mediaConstraints.audio = {
          optional: [{ sourceId: this.mediaData.audioDeviceId }],
        };
      } else {
        mediaConstraints.audio = true;
      }
      if (this.mediaData.videoDeviceId) {
        mediaConstraints.video = {
          deviceId: { exact: this.mediaData.videoDeviceId },
        };
      } else {
        mediaConstraints.video = true;
      }
      return mediaConstraints;
    },
    getMediaWithDevices(video = null, audio = null) {
      console.log("vi", video);
      console.log("aud", audio);
      let setError = this.setError;
      let globalThis = this;
      let audioWasTrue;
      let cameraWasTrue;

      if (video == null && audio == null) {
        globalThis.mediaSettings.cameraTurnedOn = true;
        globalThis.mediaSettings.audioTurnedOn = true;
      } else if (video !== null && audio == null) {
        globalThis.mediaSettings.cameraTurnedOn = true;
        audioWasTrue = globalThis.mediaSettings.audioTurnedOn;
      } else if (audio !== null && video == null) {
        globalThis.mediaSettings.audioTurnedOn = true;
        cameraWasTrue = globalThis.mediaSettings.cameraTurnedOn;
      }

      var constraints = this.buildConstraints();
      if (this.mediaStreamInUse && this.mediaStreamInUse !== null) {
        this.mediaStreamInUse.getTracks()[0].stop();
      }
      getUserMedia(constraints, function (err, stream) {
        let display = globalThis.$refs.display;
        if (setError(err, display)) return;
        // if (err) {
        //   setError(err, display)
        // } else {
        //   return;
        // }
        var options = {
          mirror: true,
          muted: false,
          audio: false,
          autoPlay: true,
        };
        if (!stream) {
          //- If problem, revert turned on statuses set true before
          if (video == null && audio == null) {
            globalThis.mediaSettings.cameraTurnedOn = false;
            globalThis.mediaSettings.audioTurnedOn = false;
          } else if (video !== null && audio == null) {
            globalThis.mediaSettings.cameraTurnedOn = false;
          } else if (((audio !== null) == video) == null) {
            globalThis.mediaSettings.audioTurnedOn = false;
          }
          return console.log("Could not get stream!");
        }
        globalThis.mediaStreamInUse = stream;
        let preview = globalThis.$refs.preview;
        globalThis.video = attachMediaStream(stream, preview, options);
        globalThis.updateDeviceOptions();
        if (video !== null) {
          //- because video one also restarts audio
          console.log("a");
          globalThis.disconnectAudioContext();
          console.log("b");
        }
        globalThis.initAudioFeedback(stream);
        if (!audioWasTrue && video !== null && audio == null) {
          globalThis.toggleAudio(false);
        }
        if (!cameraWasTrue && video == null && audio !== null) {
          globalThis.turnOffVideo();
        }
      });
    },
    refreshVideo() {
      this.getMediaWithDevices();
    },
    updateDeviceOptions() {
      let videoDisplay = this.$refs.display;
      let deviceSelection = this.$refs.deviceSelection;
      let setError = this.setError;
      let globalThis = this;
      enumerateDevices()
        .then(function (devices) {
          setError(null);
          var selectedAudio = globalThis.mediaData.audioDeviceId;
          var selectedVideo = globalThis.mediaData.videoDeviceId;

          globalThis.devices = {};
          globalThis.mediaData.videoDevices = [];
          globalThis.mediaData.audioDevices = [];
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
              globalThis.mediaData.audioDevices.push(device);
            } else if (device.kind === "videoinput") {
              videoDevicesCount++;
              if (!device.label) {
                device.label = "Camera " + videoDevicesCount;
              }
              globalThis.mediaData.videoDevices.push(device);
            }
          }

          let audioWithId = document.querySelector(
            'select[name="audio-options"] option[value="' + selectedAudio + '"]'
          );
          if (selectedAudio && audioWithId) {
            globalThis.mediaData.audioDeviceId = selectedAudio;
          } else {
            // let selected = document.getElementById("audio-options").selectedIndex = 0;
            globalThis.mediaData.audioDeviceId =
              globalThis.mediaData.audioDevices[0].deviceId;
          }

          let videoWithId = document.querySelector(
            'select[name="video-options"] option[value="' + selectedVideo + '"]'
          );
          if (selectedVideo && videoWithId) {
            globalThis.mediaData.videoDeviceId = selectedVideo;
          } else {
            globalThis.mediaData.videoDeviceId =
              globalThis.mediaData.videoDevices[0].deviceId;
          }
        })
        .catch(function (err) {
          setError(err, videoDisplay, deviceSelection);
        });
    },
    initAudioFeedback(stream) {
      let globalThis = this;
      if (stream) {
        globalThis.mediaSettings.audioTurnedOn = true;
      } else {
        return (globalThis.mediaSettings.audioTurnedOn = false);
      }
      globalThis.audioContext = new AudioContext();
      let audioContext = globalThis.audioContext;
      globalThis.audioAnalyser = audioContext.createAnalyser();
      let analyser = globalThis.audioAnalyser;
      globalThis.audioMicrophone = audioContext.createMediaStreamSource(stream);
      let microphone = globalThis.audioMicrophone;
      globalThis.javascriptNode = audioContext.createScriptProcessor(
        2048,
        1,
        1
      );
      let javascriptNode = globalThis.javascriptNode;

      analyser.smoothingTimeConstant = 0.8;
      analyser.fftSize = 1024;

      microphone.connect(analyser);
      analyser.connect(javascriptNode);
      javascriptNode.connect(audioContext.destination);
      javascriptNode.onaudioprocess = function () {
        var array = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(array);
        var values = 0;

        var length = array.length;
        for (var i = 0; i < length; i++) {
          values += array[i];
        }

        var average = values / length;

        // console.log(Math.round(average));

        //- Cloning to remove previous eventHandlers from pids
        //- Saves the trouble of disconnecting-reconnecting
        globalThis.clonePids(average);
        // globalThis.colorPids(average);
      };
    },
    disconnectAudioContext() {
      this.audioContext.close();
    },
    clonePids(average) {
      let pids = document.getElementById("pids");
      let pidsClone = pids.cloneNode(true);
      pids.parentNode.replaceChild(pidsClone, pids);
      this.colorPids(average);
    },
    colorPids(vol) {
      let all_pids = document.querySelectorAll(".pid");
      let amout_of_pids = Math.round(vol / 10);
      all_pids = Array.from(all_pids);
      let elem_range = all_pids.slice(0, amout_of_pids);
      for (var x = 0; x < all_pids.length; x++) {
        all_pids[x].style.backgroundColor = "#e6e7e8";
      }
      for (var y = 0; y < elem_range.length; y++) {
        elem_range[y].style.backgroundColor = "#5207d6";
      }
    },
    logout() {
      auth.logout();
    },
  },
};
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&display=swap");

.eventroom-logo {
  font-family: "Nunito", sans-serif;
  font-weight: 700;
  font-size: 35px;
}

.eventroom-link {
  font-size: 24px;
  margin-top: 20px;
  display: flex;
  align-items: center;
}

.eventroom-slash {
  font-family: "Nunito", sans-serif;
  display: inline-block;
  font-weight: bold;
}

.eventroom-to {
  font-family: "Nunito", sans-serif;
  color: #520cd5;
  display: inline-block;
  font-weight: 700;
  margin-left: 1px;
}

.open-lock-icon,
.closed-lock-icon {
  display: inline-block;
  width: 16px;
  height: 16px;
  margin-right: 7px;
}

.join-room,
.request-to-join {
  background-color: white;
  color: #520cd5;
  border: 1px solid #ececec;
  padding: 15px 125px;
  font-size: 25px;
  font-weight: bold;
  /* position: absolute;
  bottom: 35px; */
  margin-top: 35px;
  border-radius: 3px;
  cursor: pointer;
  transition: 0.2s ease;
}

.request-to-join {
  padding: 15px 99px;
}

.join-room:hover,
.request-to-join:hover {
  color: white;
  background-color: #520cd5;
}

#video-preview {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 2px;
  border: 4px solid #dbdbe4;
}

.pids-wrapper {
  width: 360px;
  margin-top: 18px;
}
.pid {
  width: calc(10% - 10px);
  height: 10px;
  border-radius: 2px;
  display: inline-block;
  margin: 5px;
}

.hardware-setup {
  /* background-color: beige; */
  width: 900px;
  height: 550px;
  margin-bottom: 60px;
  border-radius: 3px;
  display: flex;
  flex-direction: row;
  box-shadow: 0 6px 15px -3px rgba(0, 0, 0, 0.1),
    0 2px 6px -2px rgba(0, 0, 0, 0.05);
}
.media-feeds,
.media-feeds-closed {
  width: 50%;
  /* padding-top: 25px; */
  justify-content: center;
  display: flex;
  align-items: center;
  flex-direction: column;
  box-sizing: border-box;
  position: relative;
}

.video-feed {
  background-color: white;
  /* border: 1px solid #eaeaea; */
  border-radius: 3px;
  width: 380px;
  height: 325px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
.room-entrance {
  width: 50%;
  display: flex;
  /* padding-top: 25px; */
  background-color: #fafafb;
  flex-direction: column;
  align-items: center;
}
.entrance {
  /* padding-top: 20px; */
  border-radius: 3px;
  width: 380px;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  justify-content: center;
}
.media-info {
  width: 300px;
  font-size: 30px;
  font-weight: bold;
}

.sign-up-proposal {
  background-color: #ffc10742;
  padding: 10px;
  color: #520ed5;
  cursor: pointer;
  margin: 20px 0;
  margin-bottom: 0px;
  font-family: "Nunito", sans-serif;
  font-weight: bold;
  border-radius: 3px;
}

.sign-up-proposal:hover {
  background-color: #dfa9083f;
  color: #6111f7;
}

.toggle-prereview {
  /* width: 300px; */
  position: relative;
  cursor: pointer;
  border-radius: 3px;
  padding: 2px;
  /* padding-left: 20px; */
  font-family: "Nunito", sans-serif;
  font-weight: bold;
  color: #b6bcc1;
  margin: 20px 0;
  margin-bottom: 0px;
  position: relative;
}

.toggle-prereview:hover {
  background-color: #f3f2f2;
}

/* input[type="checkbox"] {
  position: absolute;
  opacity: 0;
  cursor: pointer;
  height: 0;
  width: 0;
} */

.disable-prereview-checkbox {
  /* position: absolute;
  top: 0;
  left: 0;
  height: 25px !important;
  width: 25px !important; */
  background-color: #eee;
  border: 1px solid #efefef;
}

.disable-prereview {
  font-family: "Nunito", sans-serif;
  font-weight: bold;
  color: #b6bcc1;
  padding: 20px;
}

@supports (-webkit-appearance: none) or (-moz-appearance: none) {
  input[type="checkbox"],
  input[type="radio"] {
    --active: #520ed5;
    --active-inner: #fff;
    --focus: 2px #520ed55c;
    --border: #bbc1e1;
    --border-hover: #520ed5;
    --background: #fff;
    --disabled: #f6f8ff;
    --disabled-inner: #eee6ff5c;
    -webkit-appearance: none;
    -moz-appearance: none;
    height: 22px;
    outline: none;
    display: inline-block;
    vertical-align: top;
    position: relative;
    margin: 0;
    cursor: pointer;
    border: 1px solid var(--bc, var(--border));
    background: var(--b, var(--background));
    -webkit-transition: background 0.3s, border-color 0.3s, box-shadow 0.2s;
    transition: background 0.3s, border-color 0.3s, box-shadow 0.2s;
  }
  input[type="checkbox"]:after,
  input[type="radio"]:after {
    content: "";
    display: block;
    left: 0;
    top: 0;
    position: absolute;
    -webkit-transition: opacity var(--d-o, 0.2s),
      -webkit-transform var(--d-t, 0.3s) var(--d-t-e, ease);
    transition: opacity var(--d-o, 0.2s),
      -webkit-transform var(--d-t, 0.3s) var(--d-t-e, ease);
    transition: transform var(--d-t, 0.3s) var(--d-t-e, ease),
      opacity var(--d-o, 0.2s);
    transition: transform var(--d-t, 0.3s) var(--d-t-e, ease),
      opacity var(--d-o, 0.2s),
      -webkit-transform var(--d-t, 0.3s) var(--d-t-e, ease);
  }
  input[type="checkbox"]:checked,
  input[type="radio"]:checked {
    --b: var(--active);
    --bc: var(--active);
    --d-o: 0.3s;
    --d-t: 0.6s;
    --d-t-e: cubic-bezier(0.2, 0.85, 0.32, 1.2);
  }
  input[type="checkbox"]:disabled,
  input[type="radio"]:disabled {
    --b: var(--disabled);
    cursor: not-allowed;
    opacity: 0.9;
  }
  input[type="checkbox"]:disabled:checked,
  input[type="radio"]:disabled:checked {
    --b: var(--disabled-inner);
    --bc: var(--border);
  }
  input[type="checkbox"]:disabled + label,
  input[type="radio"]:disabled + label {
    cursor: not-allowed;
  }
  input[type="checkbox"]:hover:not(:checked):not(:disabled),
  input[type="radio"]:hover:not(:checked):not(:disabled) {
    --bc: var(--border-hover);
  }
  input[type="checkbox"]:focus,
  input[type="radio"]:focus {
    box-shadow: 0 0 0 var(--focus);
  }
  input[type="checkbox"]:not(.switch),
  input[type="radio"]:not(.switch) {
    width: 22px;
  }
  input[type="checkbox"]:not(.switch):after,
  input[type="radio"]:not(.switch):after {
    opacity: var(--o, 0);
  }
  input[type="checkbox"]:not(.switch):checked,
  input[type="radio"]:not(.switch):checked {
    --o: 1;
  }
  input[type="checkbox"] + label,
  input[type="radio"] + label {
    font-size: 14px;
    line-height: 23px;
    display: inline-block;
    vertical-align: top;
    cursor: pointer;
    margin-left: 6px;
    padding-right: 2px;
  }

  input[type="checkbox"]:not(.switch) {
    border-radius: 4px;
  }
  input[type="checkbox"]:not(.switch):after {
    width: 5px;
    height: 9px;
    border: 2px solid var(--active-inner);
    border-top: 0;
    border-left: 0;
    left: 7px;
    top: 4px;
    -webkit-transform: rotate(var(--r, 20deg));
    transform: rotate(var(--r, 20deg));
  }
  input[type="checkbox"]:not(.switch):checked {
    --r: 44deg;
  }
  input[type="checkbox"].switch {
    width: 38px;
    border-radius: 11px;
  }
  input[type="checkbox"].switch:after {
    left: 2px;
    top: 2px;
    border-radius: 50%;
    width: 15px;
    height: 15px;
    background: var(--ab, var(--border));
    -webkit-transform: translateX(var(--x, 0));
    transform: translateX(var(--x, 0));
  }
  input[type="checkbox"].switch:checked {
    --ab: var(--active-inner);
    --x: 17px;
  }
  input[type="checkbox"].switch:disabled:not(:checked):after {
    opacity: 0.6;
  }

  input[type="radio"] {
    border-radius: 50%;
  }
  input[type="radio"]:after {
    width: 19px;
    height: 19px;
    border-radius: 50%;
    background: var(--active-inner);
    opacity: 0;
    -webkit-transform: scale(var(--s, 0.7));
    transform: scale(var(--s, 0.7));
  }
  input[type="radio"]:checked {
    --s: 0.5;
  }
}
/* ul {
  margin: 12px;
  padding: 0;
  list-style: none;
  width: 100%;
  max-width: 320px;
}
ul li {
  margin: 16px 0;
  position: relative;
}

html {
  box-sizing: border-box;
}

* {
  box-sizing: inherit;
}
*:before, *:after {
  box-sizing: inherit;
}

body {
  min-height: 100vh;
  font-family: 'Inter', Arial, sans-serif;
  color: #8A91B4;
  display: -webkit-box;
  display: flex;
  -webkit-box-pack: center;
          justify-content: center;
  -webkit-box-align: center;
          align-items: center;
  background: #F6F8FF;
}
@media (max-width: 800px) {
  body {
    -webkit-box-orient: vertical;
    -webkit-box-direction: normal;
            flex-direction: column;
  }
} */

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