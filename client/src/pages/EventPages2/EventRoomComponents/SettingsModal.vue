
<template>
  <div v-if="SettingsAreShown" class="modal">
    <div @click="SettingsAreShown=false" class="backdrop" style="opacity: 1;"></div>
    <div class="inner" style="opacity: 1; transform: none;">
      <div class="flex justify-between items-center w100">
        <div class="flex flex-column">
          <h6 class="light20@text">Settings</h6>
          <p class="muted">Change party permissions.</p>
        </div>
      </div>
      <div class="mt6 flex flex-column pv6 bt dark90@border">
        <div class="flex items-center justify-between">
          <div class="flex flex-column">
            <p class="fw-medium light20@text">Manage Now Playing</p>
            <p class="muted">Allow everyone to play, pause and seek the current video.</p>
          </div>
          <label class="switch active">
            <input type="checkbox" checked />
            <span class="toggle"></span>
          </label>
        </div>
      </div>
      <div class="flex flex-column pv6 bt dark90@border">
        <div class="flex items-center justify-between">
          <div class="flex flex-column">
            <p class="fw-medium light20@text">Add videos to Playlist</p>
            <p class="muted">Allow everyone to add videos to the playlist.</p>
          </div>
          <label class="switch active">
            <input type="checkbox" checked />
            <span class="toggle"></span>
          </label>
        </div>
      </div>
      <div class="flex flex-column pv6 bt dark90@border">
        <div class="flex items-center justify-between">
          <div class="flex flex-column">
            <p class="fw-medium light20@text">Remove videos from Playlist</p>
            <p class="muted">Allow everyone to remove videos from the playlist.</p>
          </div>
          <label class="switch active">
            <input type="checkbox" checked />
            <span class="toggle"></span>
          </label>
        </div>
      </div>
      <div class="flex flex-column pv6 bt dark90@border">
        <div class="flex items-center justify-between">
          <div class="flex flex-column">
            <p class="fw-medium light20@text">Skip through Playlist</p>
            <p class="muted">Allow everyone to skip through the playlist.</p>
          </div>
          <label class="switch active">
            <input type="checkbox" checked />
            <span class="toggle"></span>
          </label>
        </div>
      </div>
      <div class="flex flex-column pv6 bt dark90@border">
        <div class="flex items-center justify-between">
          <div class="flex flex-column">
            <p class="fw-medium light20@text">Chat Enabled</p>
            <p class="muted">Allow everyone in the party to chat.</p>
          </div>
          <label class="switch active">
            <input type="checkbox" checked />
            <span class="toggle"></span>
          </label>
        </div>
      </div>
      <div class="flex flex-column pt6 bt dark90@border">
        <div class="flex items-center justify-between">
          <div class="flex flex-column">
            <div class="flex items-center">
              <p class="fw-medium light20@text">Private Party</p>
              <div class="badge ml2">Coming soon</div>
            </div>
            <p class="muted">Only selected viewers will have access to this party.</p>
          </div>
          <label class="switch disabled">
            <input type="checkbox" />
            <span class="toggle"></span>
          </label>
        </div>
      </div>
    </div>
    <div class="mobileclose bt dark90@border p5" style="opacity: 1; transform: none;">
      <small class="subtitle">Close</small>
    </div>
  </div>
</template>

<script>
export default {
  name: "SettingsModal",
  data() {
      return {
          SettingsAreShown: false
      }
  }
};
</script>

<style scoped>
/*! CSS Used from: https://campfire.gg/styles.61f4f5cd.css */
small {
  font-size: 80%;
}
input {
  font-family: inherit;
  font-size: 100%;
  line-height: 1.15;
  margin: 0;
}
input {
  overflow: visible;
}
[type="checkbox"] {
  box-sizing: border-box;
  padding: 0;
}
h6 {
  margin: 0;
  font-weight: 600;
}
h6 {
  font-size: 18px;
  line-height: 24px;
}
p {
  font-size: 16px;
  line-height: 24px;
  margin: 0;
}
small {
  font-size: 10px;
  line-height: 16px;
  margin: 0;
}
.dark90\@border {
  border-color: #424446;
}
.light20\@text {
  color: #f6f6f6;
}
.fw-medium {
  font-weight: 500;
}
.ml2 {
  margin-left: 8px;
}
.p5 {
  padding: 20px;
}
.pt6 {
  padding-top: 24px;
}
.pv6 {
  padding-top: 24px;
  padding-bottom: 24px;
}
.mt6 {
  margin-top: 24px;
}
.flex {
  display: flex;
}
.w100 {
  width: 100%;
}
.flex-column {
  flex-direction: column;
}
.items-center {
  align-items: center;
}
.justify-between {
  justify-content: space-between;
}
.bt {
  border-top-style: solid;
  border-top-width: 1px;
}
.modal {
  z-index: 1800;
  display: flex;
  overflow-y: auto;
  max-height: 100%;
  padding: 32px;
}
.modal,
.modal > .backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}
.modal > .backdrop {
  z-index: 110;
  background-color: rgba(21, 24, 26, 0.9);
}
.modal > .inner {
  position: relative;
  z-index: 120;
  width: 100%;
  max-width: 600px;
  margin: auto;
}
.modal > .inner:not(.search) {
  max-width: 560px;
  pointer-events: all;
  background-color: #333537;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.4);
  padding: 32px;
  border-radius: 10px;
  border: 1px solid #424446;
  overflow: hidden;
}
.modal .mobileclose {
  display: none;
  align-items: center;
  justify-content: center;
  text-align: center;
  width: 100%;
  position: fixed;
  bottom: 0;
  left: 0;
  background-color: #333537;
  z-index: 200;
  cursor: pointer;
}
.modal .mobileclose small {
  color: #e5e5e5;
}
@media (max-width: 1023.98px) {
  .modal {
    padding: 0;
  }
  .modal,
  .modal > .backdrop {
    background-color: #333537;
  }
  .modal > .inner {
    max-width: none;
  }
  .modal > .inner:not(.search) {
    padding: 32px 24px 84px;
    max-width: none;
    border-radius: 0;
    box-shadow: none;
    min-height: 100%;
    border: 0;
    height: auto;
  }
  .modal .mobileclose {
    display: flex;
  }
}
.switch {
  display: flex;
  height: 28px;
  width: 48px;
  border-radius: 48px;
  padding: 4px;
  background-color: #7d7f80;
  transition: background-color 0.14s ease;
  cursor: pointer;
  position: relative;
  flex-shrink: 0;
}
.switch > input {
  display: none;
}
.switch .toggle {
  position: absolute;
  margin: 4px;
  top: 0;
  right: 20px;
  height: 20px;
  width: 20px;
  border-radius: 10px;
  background-color: #f6f6f6;
  transition: all 0.14s ease;
  box-shadow: 0 0 2px 1px rgba(0, 0, 0, 0.1), 0 0 2px rgba(0, 0, 0, 0.24);
}
.switch.active {
  background-color: #00c56a;
}
.switch.active .toggle {
  right: 0;
  background-color: #f6f6f6;
}
.switch input:active + .toggle {
  width: 24px;
  right: 16px;
}
.switch.active input:active + .toggle {
  right: 0;
}
.switch.disabled {
  cursor: default;
  pointer-events: none;
  background-color: #515354;
}
.switch.disabled .toggle {
  background-color: #8c8e8f;
}
.badge {
  cursor: default;
  font-size: 10px;
  border-radius: 4px;
  padding: 4px 6px;
  text-transform: uppercase;
  font-weight: 700;
  background-color: #515354;
  color: #b9baba;
  letter-spacing: 0.6px;
}
* {
  box-sizing: border-box;
}
h6 {
  font-weight: 500;
}
p {
  font-size: 15px;
  line-height: 22px;
  letter-spacing: 0;
  font-weight: 400;
}
small {
  font-size: 12px;
  line-height: 20px;
  letter-spacing: 0.2px;
}
small.subtitle {
  text-transform: uppercase;
  font-weight: 600;
  letter-spacing: 0.6px;
  color: #8c8e8f;
}
.muted {
  color: #b9baba;
}
</style>