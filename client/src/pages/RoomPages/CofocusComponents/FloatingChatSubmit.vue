<template>
  <!-- If you change the input's class, shortcut events will break in RoomBottomBar which prevents key shortcuts if event.target.className == "chatInputBox"-->
  <div class="chatSubmitContainer">
    <input
      id="chatInputBox"
      class="chatInputBox"
      type="text"
      placeholder="Whatcha wanna say?"
      v-model="userCurrentChatText"
    />
    <div id="chatInputSend" class="chatInputSend" @click="sendMessage">
      Send
    </div>
  </div>
</template>


<script>
import { mapState } from "vuex";

export default {
  name: "FloatingChatSubmit",
  data() {
    return {
      userCurrentChatText: "",
    };
  },
  computed: {
    ...mapState({
      chat: (state) => state.toolbar.toolbarConfig.chat,
      eventroom: (state) => state.eventroom.eventroomData,
      userId: (state) => state.auth.userId,
      localChatUser: (state) => state.chat.localChatUser,
      messageSending: (state) => state.chat.messageSending,
      messageSendFailure: (state) => state.chat.messageSendFailure,
      userCurrentChatTextBackup: (state) =>
        state.chat.userCurrentChatTextBackup,
    }),
  },
  mounted() {
    if (this.userCurrentChatTextBackup) {
      this.userCurrentChatText = this.userCurrentChatTextBackup;
    }
  },
  methods: {
    sendMessage() {
      if (!this.userCurrentChatText) return;
      let messageData = {
        eventroomId: this.eventroom.eventroomId,
        userId: this.userId,
        message: this.userCurrentChatText,
        messageType: "chatMessage",
        dateSent: new Date(),
        chatUser: this.localChatUser,
      };

      let messageText = this.userCurrentChatText;
      this.$store.dispatch("chat/updateBackupChatText", messageText);
      this.userCurrentChatText = "";

      this.$store.dispatch("chat/messageFailure", false);
      this.$store.dispatch("chat/messageSending", true);
      this.$socket.emit("sendChatMessage", messageData);
      this.$store.dispatch("chat/addMessage", messageData);
      this.$store.dispatch("chat/messageSending", false);
      this.$store.dispatch("chat/updateBackupChatText", "");
    },
  },
  watch: {
    // Restore message from store if send fails;
    messageSendFailure: function () {
      let globalThis = this;
      globalThis.userCurrentChatText =
        globalThis.$store.state.chat.userCurrentChatTextBackup;
      globalThis.$store.dispatch("chat/updateBackupChatText", "");
    },
  },
};
</script>


<style scoped>
.chatSubmitContainer {
  flex: 0;
  position: relative;
  /* border-top: 1px solid #ddddddbd; */
  border-top: 1px solid #f3f3f3;
  flex-direction: column;
  padding: 15px 0px;
  z-index: 500;
  /* box-shadow: inset 0px -5px 2px 0px #eceff3b8, 0px -14px 18px 0px #f3f3f3ad; */
}

.chatInputBox {
  border: 1px solid #eee;
  border-radius: 15px;
  width: 92%;
  caret-color: #666;
  padding: 8px 14px;
  font-size: 20px;
  font-family: "Nunito", sans-serif;
  transition: 0.2s ease;
  box-sizing: border-box;
  outline: none;
  display: block;
  margin: 0 auto;
}

.chatInputBox:hover {
  border-color: #ccc;
}

.chatInputSend {
  box-sizing: border-box;
  padding: 5px 10px;
  background-color: #eceff3;
  font-size: 22px;
  border-radius: 15px;
  font-weight: 600;
  width: 75px;
  text-align: center;
  margin-left: auto;
  margin-right: 12px;
  margin-top: 10px;
  cursor: pointer;
  transition: 0.2s ease-in-out;
}

.chatInputSend:hover {
  background-color: #d2d6db;
}
</style>