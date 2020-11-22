<template>
  <div class="floating-chat">
    <div :style="styleSidebarTitle" class="sidebar-header">
      <h1 class="sidebar-title">Chat</h1>
      <img
        @click="toggleToolbar('chat')"
        :src="cancelIcon"
        class="cancelIcon"
      />
    </div>
    <FloatingChatMessages v-show="eventroom && userId" />
    <FloatingChatSubmit v-show="eventroom && userId" />
  </div>
</template>

<script>
import { mapState } from "vuex";
import cancelIcon from "../../../assets/images/cancel.png";
import FloatingChatMessages from "./FloatingChatMessages";
import FloatingChatSubmit from "./FloatingChatSubmit";

export default {
  name: "FloatingChat",
  data() {
    return {
      cancelIcon: cancelIcon,
      eventroomName: "",
      awaitingTyping: false,
      nameExists: false,
      copiedState: false,
      themeCoreColor: "#323b50",
    };
  },
  computed: {
    ...mapState({
      eventroom: (state) => state.eventroom.eventroomData,
      userId: (state) => state.auth.userId,
      chat: (state) => state.toolbar.toolbarConfig.chat,
    }),
    styleSidebarTitle() {
      return `color: ${this.themeCoreColor};`;
    },
  },
  components: {
    FloatingChatMessages,
    FloatingChatSubmit
  },
  methods: {
    toggleToolbar(toolbarTool) {
      let data = {
        toolbarTool,
      };

      if (toolbarTool) {
        data.boolean = !this[toolbarTool];
        this.$store.dispatch("toolbar/toggleToolbar", data);
      }
    },
  },
};
</script>
<style scoped>
.floating-chat {
  width: 385px;
  background-color: white;
  height: 83.3%;
  border-radius: 15px;
  margin-right: 40px;
  margin-top: 25px;
  border: 1px solid #eff1f5;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
}

.sidebar-header {
  /* height: 40px; */
  background-color: white;
  /* border-bottom: 1px solid #e0e4f0; */
  border-radius: 15px;
  justify-content: space-between;
  text-transform: capitalize;
  width: calc(100% - 34px);
  margin-left: 1px;
  /* color: #1e2f58; */
  color: #323b50;
  align-items: center;

  padding-left: 16px !important;
  padding-right: 16px !important;
  padding-bottom: 16px !important;
  padding-top: 16px !important;

  display: flex;
  align-items: center;
}

.sidebar-title {
  align-items: center;
  display: flex;
  font-size: 18px;
  font-weight: 700;
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
</style>
