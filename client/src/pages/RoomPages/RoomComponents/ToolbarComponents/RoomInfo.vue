<template>
  <div class="settings">
    <div class="sidebar-container">
      <div class="sidebar-header flex pbt-16 plr-16">
        <header class="heading">
          <div class="flex title-row">
            <Editable
              v-if="eventroom.eventroomName"
              :initialName="eventroom.eventroomName"
              :nameExists="nameExists"
              v-model="eventroomName"
            />
            <!-- <div
              spellcheck="false"
              data-max-length="35"
              data-placeholder="Meeting title"
              class="eventroom-name flex"
              contenteditable="true"
            >
              {{ eventroom.eventroomName }}
            </div> -->
          </div>
          <div class="mt-8 tooltip_container">
            <a
              class="room-name_button knpf knpf--link knpf--small knpf--secondary"
            >
              <div class="url">
                <span class="room-name">eventroom.to/</span
                ><span class="room-name">{{ eventroom.eventroomName }}</span>
              </div></a
            >
            <div class="tooltip tooltip--bottom tooltip--middle">
              <span class="tooltip_tip"> Copy URL </span>
            </div>
          </div>
        </header>
        <img
          @click="toggleToolbar('info')"
          :src="cancelIcon"
          class="cancelIcon"
        />
      </div>
      <div class="sidebar-inner"></div>
    </div>
  </div>
</template>

<script>
import cancelIcon from "../../../../assets/images/cancel.png";
import { mapState } from "vuex";
import Editable from "./Editable";
import axios from "axios";


export default {
  name: "RoomInfo",
  data() {
    return {
      cancelIcon: cancelIcon,
      eventroomName: "",
      awaitingTyping: false,
      nameExists: false,
    };
  },
  computed: {
    ...mapState({
      leftSidebar: (state) => state.toolbar.containersConfig.leftSidebar,
      info: (state) => state.toolbar.toolbarConfig.info,
      eventroom: (state) => state.eventroom.eventroomData,
    }),
  },
  components: {
    Editable,
  },
  mounted() {
    this.eventroomName = this.eventroom.eventroomName;

    this.sockets.subscribe("eventroomNameChange", (data) => {
      console.log("eventroomNameChange", data);
      this.eventroomName = data;
      this.$store.dispatch("eventroom/updateEventroomName", data);
      this.changeURL();
    });
  },
  methods: {
    toggleToolbar(toolbarTool) {
      let data = {
        toolbarTool,
      };

      if (this.info == true) {
        data.boolean = false;
        this.$store.dispatch("toolbar/toggleToolbar", data);
      } else if (this.info == false) {
        data.boolean = true;
        this.$store.dispatch("toolbar/toggleToolbar", data);
      }
    },
    async updateEventroomName() {
      try {
        if (
          !this.eventroomName ||
          this.eventroomName.length == 0 ||
          this.eventroomName == ""
        ) {
          // Prevent updating eventroomName to nothing
          return console.log("Cannot set empty name.");
        }
        if (this.eventroomName == this.eventroom.eventroomName) {
          // Prevent update when updating for connected participants
          // As their old name won't exist anymore so cannot find it
          //-To update, and you wouldn't want to
          return;
        }

        let eventroomData = {
          newEventroomName: this.eventroomName,
          eventroomId: this.eventroom.eventroomId,
        };
        console.log("eveData", eventroomData);
        const response = await axios.post(
          `/api/eventroom/changeEventroomName`,
          eventroomData
        );
        console.log("success name change", response.data);
        this.$store.dispatch(
          "eventroom/updateEventroomName",
          this.eventroomName
        );
        this.$socket.emit("newEventroomName", this.eventroomName);
        this.changeURL();
      } catch (error) {
        console.log("Failed to create temporary user", error);
      }
    },
    async checkIfNameExists() {
      if (
        !this.eventroomName ||
        this.eventroomName.length == 0 ||
        this.eventroomName == ""
      ) {
        // Prevent checking if empty
        return console.log("Cannot check empty name.");
      }
      console.log("wodddoo");
      try {
        let eventroomName = this.eventroomName;
        let eventroomData = {
          eventroomName: eventroomName,
        };
        const response = await axios.post(
          `/api/eventroom/checkIfEventroomExistsByName`,
          eventroomData
        );
        console.log("respon", response.data);
        this.nameExists = response.data.alreadyExists;

        if (!this.nameExists) {
          this.updateEventroomName();
        }
      } catch (error) {
        console.log(
          "@checkIfSlugExists: Emergency, our penguins cannot find igloos to check!"
        );
      }
    },
    changeURL() {
      let slash = "/" + this.eventroom.eventroomName;
      if (history.pushState) {
        history.pushState({}, null, slash);
      } else {
        // support for browsers not supporting pushState
        document.location.href = this.$route + slash;
      }
    },
  },
  watch: {
    eventroomName: function () {
      if (!this.awaitingTyping) {
        setTimeout(() => {
          console.log("type type");
          this.checkIfNameExists();
          this.awaitingTyping = false;
        }, 3000); // 1 sec delay
      }
      this.awaitingTyping = true;
    },
  },
};
</script>
<style scoped>
.sidebar-left {
  width: 300px;
  background-color: #9e9e9e38;
  height: 100%;
  flex: 0 0 auto;
}
.sidebar-header {
  /* height: 40px; */
  background-color: white;
  border-bottom: 1px solid #e0e4f0;
  justify-content: space-between;
  text-transform: capitalize;
  width: calc(100% - 34px);
  margin-left: 1px;
  color: #1e2f58;
}

.sidebar-container {
  width: 300px;
}

.sidebar-title {
  font-size: 18px;
  font-weight: 700;
}

.eventroom-name {
  cursor: text;
  border-radius: 4px;
  color: #1e2f58;
  display: inline-block;
  font-size: 24px;
  font-weight: 900;
  line-height: 1.2;
  margin-left: -2px;
  margin-right: 2px;
  padding: 1px 2px;
  transition: all 0.2s;
  word-break: break-word;
  min-width: 215px;
}

.eventroom-name:hover,
.eventroom-name:focus {
  background: #eceff4;
  outline: none;
}

.cancelIcon {
  width: 14px;
  height: 14px;
  padding: 8px;
  border-radius: 20px;
  cursor: pointer;
  margin-bottom: auto;
}

.cancelIcon:hover {
  background-color: #e5e8ef;
}

.flex {
  align-items: center;
  display: flex;
}

.pbt-16 {
  padding-bottom: 16px !important;
  padding-top: 16px !important;
}

.plr-16 {
  padding-left: 16px !important;
  padding-right: 16px !important;
}

.pl-16 {
  padding-left: 16px !important;
}

.pr-16 {
  padding-right: 16px !important;
}

.url {
  white-space: normal;
}

.room-name-button {
  line-height: 1.2;
  align-items: flex-start;
}
.room-name {
  font-size: 14px;
  font-weight: 600;
  text-transform: lowercase;
}

/*! CSS Used from: Embedded */

::before,
::after {
  text-decoration: inherit;
  vertical-align: inherit;
  box-sizing: border-box;
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
.mr-6 {
  margin-right: 6px !important;
}
/*! CSS Used from: Embedded */
.eventroom-name {
  cursor: text;
  border-radius: 4px;
  color: #1e2f58;
  display: inline-block;
  font-size: 24px;
  font-weight: 900;
  line-height: 1.2;
  margin-left: -2px;
  padding: 1px 2px;
  transition: all 0.2s;
}
.eventroom-name:empty:before {
  color: var(--grey3);
  content: attr(data-placeholder);
}
.eventroom-name:hover,
.eventroom-name:focus {
  background: #edeff5;
  outline: none;
}

.eventroom-name {
  -webkit-user-modify: read-write;
  overflow-wrap: break-word;
  -webkit-line-break: after-white-space;
}

/*! CSS Used from: Embedded */
::before,
::after {
  text-decoration: inherit;
  vertical-align: inherit;
}
a {
  background-color: transparent;
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
a {
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
.knpf--link {
  --knpf-border-width: 0;
  --knpf-border-radius: 0;
  --knpf-padding: 0;
  --knpf-background-color: transparent;
  --knpf-border-color: transparent;
  --knpf-text-color: hsl(var(--knpf-color));
  --knpf-hover-background-color: transparent;
  --knpf-hover-border-color: transparent;
  --knpf-hover-text-color: hsl(var(--knpf-hover-color));
  --knpf-active-background-color: transparent;
  --knpf-active-border-color: transparent;
  --knpf-active-text-color: hsl(var(--knpf-active-color));
}
.knpf--secondary {
  --knpf-color-hue: var(--knpf-secondary-color-hue);
  --knpf-color-saturation: var(--knpf-secondary-color-saturation);
  --knpf-color-luminosity: var(--knpf-secondary-color-luminosity);
}
/*! CSS Used from: Embedded */
.Logo {
  --Logo-size: 32px;
  --Logo-color: #4437d5;
  --Logo-margin: 16px;
  color: var(--Logo-color);
  flex-shrink: 0;
  margin-right: var(--Logo-margin);
  height: var(--Logo-size);
  width: var(--Logo-size);
}
.Logo--inherit {
  --Logo-color: inherit;
}
.Logo--tiny {
  --Logo-size: 16px;
  --Logo-margin: 8px;
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
.tooltip--bottom {
  --translateY: calc(100% + 8px);
  bottom: 0;
}
.tooltip--bottom::before {
  top: 0;
  transform: rotate(45deg) translate(-50%, -50%);
  transform-origin: left top;
}
.tooltip--bottom.tooltip--middle {
  --translateX: -50%;
  left: 50%;
}
.tooltip--bottom.tooltip--middle::before {
  left: 50%;
}
.tooltip_container {
  --tooltip-display: none;
  display: inline-flex;
  position: relative;
}
@media (hover: hover) {
  .tooltip_container:hover {
    --tooltip-display: flex;
  }
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
.knpf {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
.mt-8 {
  margin-top: 8px !important;
}
/*! CSS Used from: Embedded */
.room-name {
  font-size: 14px;
  font-weight: 600;
  max-width: 150px;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: auto;
}
.room-name_button {
  --knpf-hover-text-color: #4437d5;
}
.room-name_button:focus {
  box-shadow: none !important;
}
.room-name_button {
  line-height: 1.2;
  align-items: flex-start;
}
.url {
  white-space: normal;
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
}
</style>