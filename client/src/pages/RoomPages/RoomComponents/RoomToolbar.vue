<template>
  <div :style="getThemeBorderColor" class="toolbar-container">
    <div class="toolbar">
      <router-link to="/" :style="getThemeLogoColor" class="e">e</router-link>
      <div class="buttonContainer">
        <div class="toolbar-top">
          <div class="media-buttons">
            <div class="tooltip_container">
              <div
                class="settings-button toolbar-icon-container"
                @click="toggleToolbar('participants')"
              >
                <IconBase
                  class="toolbar-icon group-icon"
                  icon-name="settings"
                  :iconColor="getCoreColor"
                  viewBox="0 0 32 32"
                  width="25"
                  height="25"
                  ><IconGroup
                /></IconBase>
              </div>
              <div class="tooltip tooltip--top tooltip--middle">
                <span class="tooltip_tip">{{
                  participants ? "Close" : "Participants"
                }}</span>
                <span class="tooltip_shortcut">P</span>
              </div>
            </div>
            <div class="icon-separator"></div>
            <div class="icon-separator"></div>
            <div class="tooltip_container">
              <div
                class="settings-button toolbar-icon-container"
                @click="toggleToolbar('chat')"
              >
                <IconBase
                  class="toolbar-icon chat-icon"
                  icon-name="settings"
                  :iconColor="getCoreColor"
                  viewBox="0 0 477.867 477.867"
                  width="25"
                  height="25"
                  ><IconChat
                /></IconBase>
                <div v-if="chatIndicator" class="chat-indicator"></div>
              </div>
              <div class="tooltip tooltip--top tooltip--middle">
                <span class="tooltip_tip">{{
                  participants ? "Close" : "Chat"
                }}</span>
                <span class="tooltip_shortcut">X</span>
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
              <IconBase
                class="toolbar-icon info-icon"
                icon-name="settings"
                :iconColor="getCoreColor"
                viewBox="0 0 330 330"
                width="25"
                height="25"
                ><IconInfo
              /></IconBase>
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
              <IconBase
                class="toolbar-icon"
                icon-name="settings"
                :iconColor="getCoreColor"
                viewBox="0 0 24 24"
                width="32"
                height="32"
                ><IconSettings
              /></IconBase>
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
import settingsIcon from "../../../assets/images/settings.png";
import infoIcon from "../../../assets/images/info.png";
import groupIcon from "../../../assets/images/group.png";
import chatIcon from "../../../assets/images/chat.png";
// import { requestWithAuthentication } from "../../../config/api";

import IconBase from "../../../components/IconBase";
import IconSettings from "../../../components/SVG/IconSettings";
import IconInfo from "../../../components/SVG/IconInfo";
import IconGroup from "../../../components/SVG/IconGroup";
import IconChat from "../../../components/SVG/IconChat";

export default {
  name: "RoomToolbar",
  data() {
    return {
      errors: false,
      settingsIcon: settingsIcon,
      infoIcon: infoIcon,
      chatIcon: chatIcon,
      groupIcon: groupIcon,
      themeBorderColor: "#e8e8e9",
      themeLogoColor: "#111158",
      //   toolbarConfiguration: [],
      //   toolOpened: false,
      //   openedComponent: "",
    };
  },
  beforeDestroy() {
    window.removeEventListener("keyup", this.handler);
  },
  components: {
    IconBase,
    IconSettings,
    IconInfo,
    IconGroup,
    IconChat,
  },
  computed: {
    ...mapState({
      settings: (state) => state.toolbar.toolbarConfig.settings,
      info: (state) => state.toolbar.toolbarConfig.info,
      chat: (state) => state.toolbar.toolbarConfig.chat,
      chatIndicator: (state) => state.toolbar.toolbarConfig.chatIndicator,
      participants: (state) => state.toolbar.toolbarConfig.participants,
      // connectionID: (state) => state.session.thisConnectionId,
      // sessionID: (state) => state.session.thisSessionId,
    }),
    getCoreColor() {
      return "#111158";
    },
    getThemeBorderColor() {
      return `color: ${this.themeBorderColor};`;
    },
    getThemeLogoColor() {
      return `color: ${this.themeLogoColor};`;
    },
  },
  methods: {
    toggleToolbar(toolbarTool) {
      let data = {
        toolbarTool,
      };

      console.log("thisAccess", this[toolbarTool]);

      if (toolbarTool) {
        if (toolbarTool == "chat" && !this.chat) {
          this.$store.dispatch("toolbar/toggleChatIndicator", false);
        }
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
  /* background-color: #edeff5; */
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
  min-width: 32px;
  position: relative;
}

.toolbar-icon {
  width: 32px;
  height: 32px;
  cursor: pointer;
}

.info-icon {
  width: 28px;
  height: 28px;
}

.group-icon {
  width: 24px;
  height: 24px;
}

.chat-icon {
  width: 23px;
  height: 23px;
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

.toolbar-top {
  padding-top: 35px;
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
  padding-top: 8px;
  font-size: 24px;
  font-weight: 600;
  color: #1e2f58;
}

.chat-indicator {
  width: 10px;
  height: 10px;
  position: absolute;
  border-radius: 360px;
  background-color: #d12c54;
  right: 1px;
  top: -3px;
  cursor: pointer;
}
</style>
