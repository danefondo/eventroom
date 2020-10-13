<template>
  <div class="sidebar section sidebar-left">
    <div class="sidebar-container">
      <RoomSettings v-if="settings" />
      <RoomInfo v-if="info" />
      <RoomParticipants v-if="participants" />
      <RoomChat v-if="chat" />
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";
import RoomSettings from "./ToolbarComponents/RoomSettings";
import RoomInfo from "./ToolbarComponents/RoomInfo";
import RoomChat from "./ToolbarComponents/RoomChat";
import RoomParticipants from "./ToolbarComponents/RoomParticipants";

export default {
  name: "RoomLeftSidebar",
  computed: {
    ...mapState({
      leftSidebar: (state) => state.toolbar.containersConfig.leftSidebar,
      settings: (state) => state.toolbar.toolbarConfig.settings,
      info: (state) => state.toolbar.toolbarConfig.info,
      participants: (state) => state.toolbar.toolbarConfig.participants,
      chat: (state) => state.toolbar.toolbarConfig.chat,
    }),
  },
  components: {
    RoomSettings,
    RoomInfo,
    RoomChat,
    RoomParticipants
  }
};
</script>
<style scoped>
.sidebar-left {
  width: 300px;
  background-color: white;
  height: 100%;
  box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05);
}
.sidebar-container {
  box-shadow: inset 0px -1px 0px 1px rgba(0,0,0,0.1);
  height: 100%;
}
</style>
