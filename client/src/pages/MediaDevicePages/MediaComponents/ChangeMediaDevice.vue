<template>
  <div id="device-settings">
    <span class="close" @click="toggleSettings">Save & close</span>
    <span class="save-defaults" @click="setDefaults">Save as default settings</span>
    <div class="device-settings-header">
      <div class="device-settings-title">Select your preferred devices</div>
    </div>
    <fieldset id="device-selection" ref="deviceSelection">
      <div class="device-settings-subtitle">Camera</div>
      <select
        id="video-options"
        class="device-option"
        v-model="videoDeviceId"
        name="video-options"
        ref="videoOptions"
      >
        <option
          v-for="device in mediaData.videoDevices"
          :value="device.deviceId"
          :key="device.deviceId"
        >{{device.label}}</option>
      </select>
      <br />
      <div class="device-settings-subtitle">Microphone</div>
      <select
        id="audio-options"
        class="device-option"
        v-model="audioDeviceId"
        name="audio-options"
        ref="audioOptions"
      >
        <option
          v-for="device in mediaData.audioDevices"
          :value="device.deviceId"
          :key="device.deviceId"
        >{{device.label}}</option>
      </select>
      <br />
      <div class="device-settings-subtitle">Speaker</div>
      <select
        id="speaker-options"
        class="device-option"
        v-model="speakerDeviceId"
        name="speaker-options"
        ref="speakerOptions"
      >
        <option
          v-for="device in mediaData.speakerDevices"
          :value="device.deviceId"
          :key="device.deviceId"
        >{{device.label}}</option>
      </select>
    </fieldset>
  </div>
</template>

<script>
export default {
  name: "ChangeMediaDevice",
  props: ["mediaData"],
  mounted() {
    console.log("mediadata", this.mediaData);
  },
  computed: {
    videoDeviceId: {
      get() {
        return this.mediaData.videoDeviceId;
      },
      set(deviceId) {
        this.$emit("videoDeviceId", deviceId);
      },
    },
    audioDeviceId: {
      get() {
        return this.mediaData.audioDeviceId;
      },
      set(deviceId) {
        this.$emit("audioDeviceId", deviceId);
      },
    },
    speakerDeviceId: {
      get() {
        return this.mediaData.speakerDeviceId;
      },
      set(deviceId) {
        this.$emit("speakerDeviceId", deviceId);
      },
    },
  },
  methods: {
    toggleSettings() {
      this.$emit("toggleSettings");
    },
    setDefaults() {
      this.$emit("setDefaults");
    },
  },
};
</script>

<style scoped>
#device-settings {
  position: absolute;
  background-color: white;
  width: 100%;
  height: calc(100% - 25px);
  padding-top: 25px;
}

.device-settings-header {
  display: flex;
  justify-content: space-between;
  margin: 20px 30px;
  margin-top: 25px;
  align-items: center;
}

.device-settings-title {
  font-size: 20px;
  text-align: left;
  font-weight: bold;
}

.device-settings-subtitle {
  margin-left: 30px;
  font-size: 18px;
  margin-bottom: 7px;
  text-align: left;
}

.device-option {
  outline: none;
  padding: 9px;
  font-weight: bold;
  font-size: 17px;
  text-align: center;
  border-radius: 3px;
  background-color: #e5e3e838;
  border: none;
  color: #2d2d2d;
  margin-bottom: 15px;
  width: 400px;
}
.device-option:hover {
  cursor: pointer;
}

.close {
  font-weight: bold;
  background-color: #000000;
  color: #ffffff;
  padding: 4px 7px;
  border-radius: 3px;
  display: block;
  font-size: 22px;
  box-sizing: border-box;
  cursor: pointer;
  width: 400px;
  margin: 0 auto;
  margin-top: 20px;
}
.close:hover {
  background-color: #353535;
}

.save-defaults {
  font-weight: bold;
  border: none;
  background-color: #f7f7f7;
  color: #b6bcc0;
  padding: 4px 7px;
  border-radius: 3px;
  display: block;
  box-sizing: border-box;
  cursor: pointer;
  width: 400px;
  margin: 0 auto;
  font-size: 16px;
  margin-top: 5px;
}
.save-defaults:hover {
  color: #520ed5;
  background-color: #bcbcff73;
}
</style>