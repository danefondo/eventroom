<template>
  <div>
    <div class="media-buttons">
      <div class="tooltip_container">
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
          <span class="tooltip_tip">{{videoStatus ? 'Turn camera off' : 'Turn camera on'}}</span>
          <span class="tooltip_shortcut">C</span>
        </div>
      </div>
      <div class="tooltip_container">
        <div
          :class="audioStatus ? 'audio-button' : 'audio-button-red'"
          @click="audioStatus ? toggleAudio(false) : toggleAudio(true)"
        >
          <img
            :src="audioStatus ? audioIcon : audioIconWhite"
            :class="audioStatus ? 'audio-icon' : 'audio-icon-white'"
          />
        </div>
        <div class="tooltip tooltip--top tooltip--middle">
          <span class="tooltip_tip">{{audioStatus ? 'Turn mic off' : 'Turn mic on'}}</span>
          <span class="tooltip_shortcut">M</span>
          <!-- <div class="mute-message">
            <h3 class="mute-message_title">No audio detected</h3>
            <div>
              No audio was detected through
              <br />your microphone
            </div>
          </div>-->
        </div>
      </div>
      <div class="tooltip_container">
        <div class="settings-button">
          <img :src="settings" class="settings-icon" />
        </div>
        <div class="tooltip tooltip--top tooltip--middle">
          <span class="tooltip_tip">Open settings menu</span>
        </div>
      </div>
    </div>
    <div class="SettingsButton pos-rel" v-if="settingsActive">
      <div class="tooltip_container">
        <div class="tooltip tooltip--top tooltip--middle">
          <span>Open settings menu</span>
        </div>
      </div>
      <div class="VideoCallSettings" style="display: none;">
        <button
          class="VideoCallSettings_Close-Button knpf knpf--even knpf--flat knpf--pill knpf--secondary knpf--small"
        >
          <svg class="knpf_icon">
            <use xlink:href="#icon-x" />
          </svg>
        </button>
        <label class="VideoCallSettings_Label">
          <span>Microphone</span>
        </label>
        <div class="Select_Wrapper">
          <svg aria-hidden="true" class="knpf_icon Select_Icon">
            <use xlink:href="#icon-mic" />
          </svg>
          <select class="Select Select--with-icon">
            <option value="default">Default - MacBook Pro Microphone (Built-in)</option>
            <option
              value="9217f8fbfebfeaf2c9141a33b6ba4966fcd4bb15ee3b99fed7f0fd884d5973f5"
            >MacBook Pro Microphone (Built-in)</option>
          </select>
        </div>
        <hr class="VideoCallSettings_Divider" />
        <label class="VideoCallSettings_Label">
          <span>Speaker</span>
        </label>
        <div class="Select_Wrapper">
          <svg aria-hidden="true" class="knpf_icon Select_Icon">
            <use xlink:href="#icon-volume-2" />
          </svg>
          <select class="Select Select--with-icon">
            <option value="default">Default - MacBook Pro Speakers (Built-in)</option>
            <option
              value="4b66b227321bda3b1c69a61479c2f6fcd68a4e5cac018c0af1e5c0080806b7d8"
            >MacBook Pro Speakers (Built-in)</option>
          </select>
        </div>
        <hr class="VideoCallSettings_Divider" />
        <label class="VideoCallSettings_Label">
          <span>Camera</span>
        </label>
        <div class="Select_Wrapper">
          <svg aria-hidden="true" class="knpf_icon Select_Icon">
            <use xlink:href="#icon-video" />
          </svg>
          <select class="Select Select--with-icon">
            <option
              value="93fe9537f438010d8b66b6eff54b1716cbe4444e66885ed2ba2c65dc029c3d7b"
            >FaceTime HD Camera (Built-in) (05ac:8514)</option>
          </select>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import videoIcon from "../../../assets/images/video-call.png";
import videoIconWhite from "../../../assets/images/video-call-white.png";
import audioIcon from "../../../assets/images/microphone.png";
import audioIconWhite from "../../../assets/images/microphone-white.png";
import settings from "../../../assets/images/settings.png";

export default {
  name: "MediaControlButtons",
  props: ["videoStatus", "audioStatus", "settingsActive"],
  data() {
    return {
      videoIcon: videoIcon,
      videoIconWhite: videoIconWhite,
      audioIcon: audioIcon,
      audioIconWhite: audioIconWhite,
      settings: settings,
    };
  },
  beforeDestroy() {
    window.removeEventListener("keyup", this.handler);
  },
  created() {
    let globalThis = this;
    globalThis.handler = function (e) {
      globalThis.keyboardEvent(e);
    };
    window.addEventListener("keyup", this.handler);
  },
  methods: {
    turnOffVideo() {
      this.$emit("turnOffVideo");
    },
    turnOnVideo() {
      this.$emit("turnOnVideo");
    },
    toggleAudio(boolean) {
      this.$emit("toggleAudio", boolean);
    },
    checkVideoStatus() {
      if (this.videoStatus) {
        this.turnOffVideo();
      } else {
        this.turnOnVideo();
      }
    },
    checkAudioStatusAndToggle() {
      if (this.audioStatus) {
        this.toggleAudio(false);
      } else {
        this.toggleAudio(true);
      }
    },
    keyboardEvent(e) {
      let globalThis = this;
      if (e.which == 67) {
        globalThis.checkVideoStatus();
      } else if (e.which == 77) {
        globalThis.checkAudioStatusAndToggle();
      }
    },
  },
};
</script>

<style scoped>
.media-buttons {
  display: flex;
  flex-direction: row;
  margin-top: 20px;
}
.video-call-button,
.audio-button,
.settings-button {
  border: 1px solid #ececec;
  border-radius: 4px;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 45px;
  width: 45px;
  cursor: pointer;
  position: relative;
  box-sizing: border-box;
}
.settings-button {
  background-color: #f3f2f2;
}
.video-call-button:hover,
.audio-button:hover {
  background-color: #f3f2f2;
}
.video-call-icon,
.video-call-icon-white,
.audio-icon,
.audio-icon-white,
.settings-icon {
  width: 28px;
  height: 28px;
  margin: auto;
}
.video-call-button-red,
.audio-button-red {
  border-radius: 4px;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 45px;
  width: 45px;
  cursor: pointer;
  background-color: #d12b54;
  position: relative;
  box-sizing: border-box;
}
.video-call-button-red:hover,
.audio-button-red:hover {
  background-color: #a72143;
}
*,
::before,
::after {
  box-sizing: border-box;
}
::before,
::after {
  text-decoration: inherit;
  vertical-align: inherit;
}
svg {
  vertical-align: middle;
}
svg:not([fill]) {
  fill: currentColor;
}
svg:not(:root) {
  overflow: hidden;
}
::-webkit-input-placeholder {
  color: inherit;
  opacity: 0.54;
}
::-moz-focus-inner {
  border-style: none;
  padding: 0;
}
:-moz-focusring {
  outline: 1px dotted ButtonText;
}
/*! CSS Used from: Embedded */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
/*! CSS Used from: Embedded */
*,
::before,
::after {
  box-sizing: border-box;
}
::before,
::after {
  text-decoration: inherit;
  vertical-align: inherit;
}
hr {
  height: 0;
  overflow: visible;
}
svg {
  vertical-align: middle;
}
svg:not([fill]) {
  fill: currentColor;
}
svg:not(:root) {
  overflow: hidden;
}

select {
  margin: 0;
}
select {
  text-transform: none;
}
::-webkit-input-placeholder {
  color: inherit;
  opacity: 0.54;
}
::-moz-focus-inner {
  border-style: none;
  padding: 0;
}
:-moz-focusring {
  outline: 1px dotted ButtonText;
}
label,
select {
  -ms-touch-action: manipulation;
  touch-action: manipulation;
}
/*! CSS Used from: Embedded */
.knpf {
  --knpf-color: var(--knpf-color-hue), var(--knpf-color-saturation),
    var(--knpf-color-luminosity);
  --knpf-hover-color: var(--knpf-color-hue), var(--knpf-color-saturation),
    calc(var(--knpf-color-luminosity) - 10%);
  --knpf-active-color: var(--knpf-color-hue), var(--knpf-color-saturation),
    calc(var(--knpf-color-luminosity) - 15%);
  --knpf-background-color: hsl(var(--knpf-color));
  --knpf-border-color: transparent;
  --knpf-text-color: white;
  --knpf-hover-background-color: hsl(var(--knpf-hover-color));
  --knpf-hover-border-color: transparent;
  --knpf-hover-text-color: white;
  --knpf-active-background-color: hsl(var(--knpf-active-color));
  --knpf-active-border-color: transparent;
  --knpf-active-text-color: white;
  --knpf-vertical-padding: var(--knpf-padding);
  --knpf-horizontal-padding: calc(var(--knpf-padding) * 2);
  align-items: center;
  background-color: var(--knpf-background-color);
  border: var(--knpf-border-width) var(--knpf-border-style)
    var(--knpf-border-color);
  border-radius: var(--knpf-border-radius);
  box-sizing: border-box;
  color: var(--knpf-text-color);
  cursor: pointer;
  display: inline-flex;
  flex-direction: row;
  font-family: var(--knpf-font-family);
  font-size: var(--knpf-font-size);
  font-weight: var(--knpf-font-weight);
  line-height: var(--knpf-line-height);
  justify-content: var(--knpf-justify-content);
  padding: var(--knpf-vertical-padding) var(--knpf-horizontal-padding);
  position: relative;
  text-decoration: none;
  text-transform: var(--knpf-text-transform);
  transition: var(--knpf-transition);
  white-space: nowrap;
}
.knpf:visited {
  color: var(--knpf-text-color);
}
.knpf:disabled {
  cursor: default;
  opacity: 0.4;
  pointer-events: none;
}
.knpf--small {
  --knpf-font-size: var(--knpf-font-size-small);
  --knpf-padding: var(--knpf-padding-small);
  --knpf-icon-size: var(--knpf-icon-size-small);
}
.knpf--large {
  --knpf-font-size: var(--knpf-font-size-large);
  --knpf-padding: var(--knpf-padding-large);
  --knpf-icon-size: var(--knpf-icon-size-large);
}
.knpf--flat {
  --knpf-background-color: transparent;
  --knpf-text-color: hsl(var(--knpf-color));
  --knpf-hover-background-color: hsla(var(--knpf-color), 0.15);
  --knpf-hover-text-color: hsl(var(--knpf-hover-color));
  --knpf-active-background-color: hsla(var(--knpf-color), 0.25);
  --knpf-active-text-color: hsl(var(--knpf-active-color));
}
.knpf--pale {
  --knpf-background-color: hsla(var(--knpf-color), 0.1);
  --knpf-text-color: hsl(var(--knpf-color));
  --knpf-hover-background-color: hsla(var(--knpf-color), 0.2);
  --knpf-hover-text-color: hsl(var(--knpf-hover-color));
  --knpf-active-background-color: hsla(var(--knpf-color), 0.3);
  --knpf-active-text-color: hsl(var(--knpf-active-color));
}
.knpf--outline {
  --knpf-border-color: hsla(var(--knpf-color), 0.25);
  --knpf-hover-border-color: hsla(var(--knpf-color), 0.25);
  --knpf-active-border-color: hsla(var(--knpf-color), 0.25);
}
.knpf--even {
  --knpf-horizontal-padding: var(--knpf-padding);
}
.knpf--pill {
  --knpf-border-radius: 9999px;
}
.knpf--secondary {
  --knpf-color-hue: var(--knpf-secondary-color-hue);
  --knpf-color-saturation: var(--knpf-secondary-color-saturation);
  --knpf-color-luminosity: var(--knpf-secondary-color-luminosity);
}
.knpf_icon {
  align-items: center;
  color: inherit;
  display: inline-flex;
  fill: currentColor;
  flex-shrink: 0;
  font-size: var(--knpf-icon-size);
  height: var(--knpf-icon-size);
  justify-content: center;
  width: var(--knpf-icon-size);
}
.knpf_icon:first-child:not(:only-child) {
  margin-left: calc(var(--knpf-horizontal-padding) * -0.25);
  margin-right: calc(var(--knpf-horizontal-padding) * 0.5);
}
.knpf_group {
  border-radius: var(--knpf-border-radius);
  display: inline-flex;
  position: relative;
}
.knpf_group--spaced {
  --knpf-group-spacing: var(--knpf-padding);
}
.knpf_group:not(.knpf_group--vertical) > * + * {
  margin-left: var(--knpf-group-spacing);
}
/*! CSS Used from: Embedded */
.tooltip {
  background: #040d1e;
  display: var(--tooltip-display);
  border-radius: 4px;
  color: white;
  filter: var(--tooltip-filter, none);
  flex-direction: row;
  flex-shrink: 0;
  font-weight: normal;
  font-size: 12px;
  padding: 6px 12px;
  position: absolute;
  text-align: center;
  transform: translate(var(--translateX, 0), var(--translateY, 0));
  white-space: nowrap;
  z-index: 900;
}
.tooltip::before {
  background: #040d1e;
  display: block;
  position: absolute;
  content: "";
  height: 8px;
  width: 8px;
  z-index: 1;
}
.tooltip--top {
  --translateY: calc(-100% - 8px);
  top: 0;
}
.tooltip--top::before {
  bottom: 0;
  transform: rotate(45deg) translate(-50%, 50%);
  transform-origin: left bottom;
}
.tooltip--top.tooltip--middle {
  --translateX: -50%;
  left: 50%;
}
.tooltip--top.tooltip--middle::before {
  left: 50%;
}
.tooltip_container {
  --tooltip-display: none;
  display: inline-flex;
  position: relative;
  margin-right: 10px;
}
@media (hover: hover) {
  .tooltip_container:hover {
    --tooltip-display: flex;
  }
}
.tooltip_shortcut {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
  color: #adb6d1;
  margin-left: 8px;
  padding: 1px 5px;
  text-transform: uppercase;
}
/*! CSS Used from: Embedded */
h3 {
  margin: 0;
}
select {
  font: inherit;
}
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
.pos-rel {
  position: relative;
}
.knpf {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
.knpf--round {
  --knpf-border-radius: 8px;
}
.knpf_icon:not([fill]) {
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 2;
}
.knpf_group--spaced > * + * {
  margin-left: var(--knpf-group-spacing);
}
.Select {
  --select-padding: 12px;
  -webkit-appearance: none;
  background-color: white;
  background-repeat: no-repeat;
  background-position: calc(100% - 12px) center;
  border: 1px solid var(--grey3);
  border-radius: 8px;
  border-color: #adb6d1;
  color: #1e2f58;
  font-weight: normal;
  padding: var(--select-padding);
  padding-right: 36px;
  width: 100%;
  width: -moz-available;
  width: -webkit-fill-available;
  width: fill-available;
}
.Select--with-icon {
  padding-left: calc(var(--select-padding) + 32px);
}
.Select_Wrapper {
  position: relative;
}
.Select_Icon {
  height: 22px;
  left: 12px;
  margin-top: -11px;
  position: absolute;
  width: 22px;
  top: 50%;
}
.mute-message {
  text-align: left;
}
.mute-message_title {
  font-size: 16px;
  margin-bottom: 8px;
}
.mx-0 {
  margin-left: 0 !important;
  margin-right: 0 !important;
}
.py-16 {
  padding-bottom: 16px !important;
  padding-top: 16px !important;
}
hr {
  border-color: #e0e4f0;
  border-width: 0 0 1px 0;
  margin: 12px 0;
}
/*! CSS Used from: Embedded */
.VideoCallSettings[data-v-4b6636bc] {
  background: white;
  border: 1px solid #edeff5;
  border-radius: 4px;
  bottom: calc(100% + 6px);
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1),
    0 10px 10px -5px rgba(0, 0, 0, 0.04);
  font-size: 16px;
  padding: 16px;
  position: absolute;
  text-align: left;
  width: 380px;
  z-index: 400;
}
@media screen and (max-width: 991px) {
  .VideoCallSettings[data-v-4b6636bc] {
    transform: translateX(-50%);
    margin-left: 50%;
    z-index: 900;
  }
}
@media (max-width: 575px) {
  .VideoCallSettings[data-v-4b6636bc] {
    bottom: 16px;
    margin: 0;
    position: fixed;
    right: 16px;
    transform: none;
    width: calc(100vw - 32px);
  }
}
.VideoCallSettings_Label[data-v-4b6636bc] {
  align-items: flex-start;
  display: flex;
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 12px;
}
.VideoCallSettings_Divider[data-v-4b6636bc] {
  border-color: #e0e4f0;
  border-style: solid;
  border-width: 1px 0 0;
  margin: 16px -16px;
}
.VideoCallSettings_Close-Button[data-v-4b6636bc] {
  position: absolute;
  top: 16px;
  right: 16px;
}
/*! CSS Used from: Embedded */
.HairCheck_Actions[data-v-0d7b3746] {
  --knpf-group-spacing: 8px;
  display: flex;
  position: relative;
  justify-content: center;
}
</style>