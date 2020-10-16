<template>
  <div class="room-box">
    <router-link :to="`/${eventroom.eventroomName}`" class="room-name">{{
      eventroom.eventroomName
    }}</router-link>
    <div class="link-container">
      <IconBase
        class="link-icon"
        icon-name="link"
        iconColor="black"
        viewBox="0 0 512 512"
        width="16"
        height="16"
        ><IconLink
      /></IconBase>
      <router-link :to="`/${eventroom.eventroomName}`" class="room-url"
        >eventroom.to/{{ eventroom.eventroomName }}</router-link
      >
    </div>
    <div class="copy-container">
      <div class="mt-8 tooltip_container">
        <div @click="copyLink" class="copy-link">Copy link</div>
        <div
          class="tooltip tooltip--bottom"
          :class="copiedState ? 'tooltip--middle-copied' : 'tooltip--middle'"
        >
          <span class="tooltip_tip">
            {{ copiedState ? "Copied!" : "Copy link" }}
          </span>
        </div>
      </div>
    </div>
    <div class="last-used"></div>
    <div class="last-duration"></div>
    <div class="total-use-time"></div>
    <IconBase
      @click="edit"
      class="link-icon edit-room"
      icon-name="edit"
      iconColor="black"
      viewBox="0 0 512 512"
      width="35"
      height="35"
      ><IconEdit
    /></IconBase>
    <!-- <div class="view-participants">Participants</div> -->
  </div>
</template>

<script>
import IconBase from "../../../components/IconBase";
import IconLink from "../../../components/SVG/IconLink";
import IconEdit from "../../../components/SVG/IconEdit";

export default {
  name: "RoomBox",
  props: ["eventroom"],
  data() {
    return {
      copiedState: false,
    };
  },
  components: {
    IconBase,
    IconLink,
    IconEdit,
  },
  methods: {
    edit() {
      this.$router.push(`/account/rooms/${this.eventroom.eventroomName}/edit`);
    },
    copyLink() {
      var input = document.createElement("textarea");
      input.innerHTML =
        window.location.host +
        "/account/rooms/" +
        this.eventroom.eventroomName +
        "/edit";
      document.body.appendChild(input);
      input.select();
      var result = document.execCommand("copy");
      document.body.removeChild(input);
      this.copiedState = true;
      setTimeout(() => {
        this.copiedState = false;
      }, 1000);
      return result;
    },
  },
};
</script>
<style scoped>
.room-box {
  width: 750px;
  flex-direction: column;
  align-items: flex-start;
  padding: 20px 40px;
  position: relative;
  cursor: default;
  margin: 30px 17px;
  margin-top: 10px;
  margin-bottom: 10px;
  border-radius: 3px;
  border: 1px solid transparent;
  background-color: transparent;
  display: flex;
  box-sizing: border-box;
  transition: 0.2s ease;
}

.room-box:hover {
  border: 1px solid #1f2f5833;
  transform: scale(1.015);
  background-color: #f7f8f9;
}

.room-box:hover > .edit-room {
  background-color: transparent;
}

.room-name {
  font-size: 30px;
  font-weight: 600;
  color: #000;
  display: block;
}

.room-name:hover {
  text-decoration: underline;
}

.room-url {
  margin-top: 5px;
  cursor: pointer;
  display: block;
}

.room-url:hover {
  text-decoration: underline;
}

.copy-link {
  padding: 6px 15px;
  position: absolute;
  right: 5%;
  font-size: 18px;
  box-sizing: border-box;
  top: 50%;
  transform: translate(-50%, -50%);
  color: #2b2b2b;
  cursor: pointer;
  background-color: #dcdfe2;
  border-radius: 360px;
  white-space: nowrap;
}

.edit-room {
  padding: 5px;
  padding: 5px;
  border-radius: 3px;
  margin-left: auto;
  position: absolute;
  right: 20px;
  font-size: 20px;
  box-sizing: border-box;
  top: 50%;
  transform: translate(-50%, -50%);
  color: #2b2b2b;
  cursor: pointer;
}

.room-box svg:hover path {
  fill: #333 !important;
  stroke: #333 !important;
}

.link-container {
  display: flex;
  flex-direction: row;
  align-items: center;
}

.link-icon {
  margin-right: 4px;
}

.copy-container {
  position: absolute;
  right: 5%;
  top: 46%;
  transform: translate(-50%, -50%);
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
  --translateY: calc(100% + 25px);
  bottom: 0;
}

.tooltip--bottom::before {
  top: 0;
  transform: rotate(45deg) translate(-50%, -50%);
  transform-origin: left top;
}
.tooltip--bottom.tooltip--middle {
  --translateX: -187%;
  left: 50%;
}

.tooltip--bottom.tooltip--middle-copied {
  --translateX: -207%;
  left: 50%;
}

.tooltip--bottom.tooltip--middle::before {
  left: 50%;
}

.tooltip--bottom.tooltip--middle-copied::before {
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
</style>
