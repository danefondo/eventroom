<template>
  <div class="toolbar-container">
    <div class="toolbar">
      <router-link to="/" class="e">e</router-link>
      <div class="buttonContainer">
        <div class="toolbar-top">
          <div class="media-buttons">
            <div class="tooltip_container">
              <div
                class="settings-button toolbar-icon-container"
                @click="toggleToolbar('participants')"
              >
                <img :src="infoIcon" class="toolbar-icon info-icon" />
              </div>
              <div class="tooltip tooltip--top tooltip--middle">
                <span class="tooltip_tip">{{
                  participants ? "Close" : "Participants"
                }}</span>
                <span class="tooltip_shortcut">P</span>
              </div>
            </div>
          </div>
        </div>
        <!-- <button class="hoverButton">
          <i id="mic-icon" class="fas fa-microphone fa-xs">Open chat</i>
        </button> -->
      </div>
      <!-- <div class="toolbar-element" v-for="(icon, index) in iconList" :key="index">
        <div class="toolbar-element-container" @click="openTool(index)">
          <component :is="icon" > </component>
        </div>
      </div> -->
      <div class="toolbar-bottom">
        <div class="media-buttons">
          <div class="tooltip_container">
            <div
              class="settings-button toolbar-icon-container"
              @click="toggleToolbar('info')"
            >
              <img :src="infoIcon" class="toolbar-icon info-icon" />
            </div>
            <div class="tooltip tooltip--top tooltip--middle">
              <span class="tooltip_tip">{{
                info ? "Close" : "Room info"
              }}</span>
              <span class="tooltip_shortcut">R</span>
            </div>
          </div>
          <div class="icon-separator"></div>
          <div class="tooltip_container">
            <div
              class="settings-button toolbar-icon-container"
              @click="toggleToolbar('settings')"
            >
              <img :src="settingsIcon" class="settings-icon toolbar-icon" />
            </div>
            <div class="tooltip tooltip--top tooltip--middle">
              <span class="tooltip_tip">{{
                settings ? "Close" : "Open settings"
              }}</span>
              <span class="tooltip_shortcut">S</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";
import settingsIcon from "../../../assets/images/settings1.png";
import infoIcon from "../../../assets/images/info.png";
// import { requestWithAuthentication } from "../../../config/api";

export default {
  name: "RoomToolbar",
  data() {
    return {
      errors: false,
      settingsIcon: settingsIcon,
      infoIcon: infoIcon,
      //   toolbarConfiguration: [],
      //   toolOpened: false,
      //   openedComponent: "",
    };
  },
  beforeDestroy() {
    window.removeEventListener("keyup", this.handler);
  },
  computed: {
    ...mapState({
      settings: (state) => state.toolbar.toolbarConfig.settings,
      info: (state) => state.toolbar.toolbarConfig.info,
      participants: (state) => state.toolbar.toolbarConfig.participants,
      // connectionID: (state) => state.session.thisConnectionId,
      // sessionID: (state) => state.session.thisSessionId,
    }),
  },
  methods: {
    toggleToolbar(toolbarTool) {
      let data = {
        toolbarTool,
      };

      console.log("thisAccess", this[toolbarTool]);

      if (toolbarTool) {
        data.boolean = !this[toolbarTool];
        this.$store.dispatch("toolbar/toggleToolbar", data);
      }

      // if (toolbarTool == "settings") {
      //   if (this.settings == true ) {
      //     data.boolean = false;
      //     this.$store.dispatch("toolbar/toggleToolbar", data);
      //   } else if (this.settings == false) {
      //     data.boolean = true;
      //     this.$store.dispatch("toolbar/toggleToolbar", data);
      //   }
      // } else if (toolbarTool == "info") {
      //   if (this.info == true) {
      //     data.boolean = false;
      //     this.$store.dispatch("toolbar/toggleToolbar", data);
      //   } else if (this.info == false) {
      //     data.boolean = true;
      //     this.$store.dispatch("toolbar/toggleToolbar", data);
      //   }
      // }
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
  height: 100%;
  width: 48px;
  width: 50px;
  background-color: #edeff5;
  position: relative;
  border-right: 1px solid #e0e4f0;
  flex: 0 0 auto;
}

.toolbar-slot {
  width: 44px;
}

.toolbar-icon-container {
  display: flex;
  justify-content: center;
}

.toolbar-icon {
  width: 32px;
  height: 32px;
  cursor: pointer;
}

.info-icon {
  width: 27px;
  height: 27px;
}

.icon-separator {
  height: 12px;
}
/* .toolbar {
  float: left;
  width: 48px;
  height: 100%;
  border: 2px solid red;
}
.toolbar-element {
  max-height: 48px;
  border: 2px solid blue;
}
.item-field {
  float: left;
  max-width: 300px;
  border: 2px solid black;
} */

.media-buttons {
  display: flex;
  flex-direction: column;
  /* margin-top: 20px; */
  justify-content: center;
}

.tooltip {
  background: #040d1e;
  display: var(--tooltip-display);
  border-radius: 4px;
  color: white;
  filter: var(--tooltip-filter, none);
  flex-direction: row;
  flex-shrink: 0;
  font-weight: normal;
  font-size: 14px;
  padding: 6px 12px;
  position: absolute;
  text-align: center;
  transform: translate(var(--translateX, 0), var(--translateY, 0));
  white-space: nowrap;
  z-index: 900;
  height: 32px;
}

.toolbar-bottom {
  display: flex;
  justify-content: center;
  bottom: 15px;
  position: absolute;
  width: 100%;
}

.tooltip_tip {
  top: 10%;
  position: relative;
  vertical-align: middle;
  display: flex;
  height: 16px;
  align-items: center;
}

.tooltip--top {
  /* --translateY: calc(-100% - 8px); */
  top: 0;
  bottom: 0;
}

.tooltip--top.tooltip--middle {
  /* --translateX: 12%; */
  left: 148%;
}

.tooltip_container {
  --tooltip-display: none;
  display: inline-flex;
  position: relative;
  justify-content: center;
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
  position: relative;
  top: 10%;
  display: flex;
  align-items: center;
  height: 18px;
}

.toolbar {
  display: flex;
  flex-direction: column;
  flex: 0 0 auto;
  align-items: center;
}

.e {
  padding: 6px;
  font-size: 24px;
  font-weight: 600;
}
</style>
