<template>
  <div class="chat-text">
    <!-- <div>EVENTROOM {{ eventroom.eventroomId }}</div>
    <div>USER: {{ userId }}</div> -->
    <div class="messages" ref="messages" id="messages">
      <!-- <Message /> -->
      <div
        class="message dont-break-out"
        v-for="(messageData, index) in sortedMessages"
        :key="index"
      >
        <div
          :class="
            messageData.chatUser.userId == userId
              ? 'localDateTimeDisplay'
              : 'dateTimeDisplay'
          "
        >
          {{ returnDate(messageData.dateSent) }}
        </div>

        <div
          :class="
            messageData.chatUser.userId == userId
              ? 'localMessageContent'
              : 'messageContent'
          "
        >
          <div
            :class="
              messageData.chatUser.userId == userId
                ? 'localDisplayName'
                : 'displayName'
            "
          >
            {{ messageData.chatUser.displayName }}
          </div>
          <div
            v-autolinker:[autolinkerOptions]="messageData.message"
            :class="
              messageData.chatUser.userId == userId
                ? 'localMessageText'
                : 'messageText'
            "
          ></div>
        </div>
      </div>
    </div>
    <!-- If you change the input's class, shortcut events will break in RoomBottomBar which prevents key shortcuts if event.target.className == "chatInputBox"-->
    <div class="chatSubmitContainer">
      <input
        class="chatInputBox"
        type="text"
        placeholder="Whatcha wanna say?"
        v-model="userCurrentChatText"
      />
      <div id="chatInputSend" class="chatInputSend" @click="sendMessage">
        Send
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";

// Chat.vue is a SIGNALER;

export default {
  name: "Chat",
  data() {
    return {
      //   userIsAttemptingJoin: false,
      userCurrentChatText: "",
      typing: false,
      connections: 0,

      autolinkerOptions: {
        urls: {
          schemeMatches: true,
          wwwMatches: true,
          tldMatches: true,
        },
        email: false,
        phone: false,
        mention: false,
        hashtag: false,

        stripPrefix: true,
        stripTrailingSlash: true,
        newWindow: true,

        truncate: {
          length: 0,
          location: "end",
        },

        className: "messageTextLink",
      },
    };
  },
  computed: {
    ...mapState({
      leftSidebar: (state) => state.toolbar.containersConfig.leftSidebar,
      chat: (state) => state.toolbar.toolbarConfig.chat,
      eventroom: (state) => state.eventroom.eventroomData,
      userId: (state) => state.auth.userId,
      user: (state) => state.auth.user,
      isAuthenticated: (state) => state.auth.authenticationStatus,
      isVerified: (state) => state.auth.verificationStatus,
      tempUser: (state) => state.tempuser.tempUser,
      localChatUser: (state) => state.chat.localChatUser,
      messagesInThread: (state) => state.chat.messagesInThread,
      messageSending: (state) => state.chat.messageSending,
      messageSendFailure: (state) => state.chat.messageSendFailure,
      userCurrentChatTextBackup: (state) =>
        state.chat.userCurrentChatTextBackup,
      userJoinSuccessful: (state) => state.chat.userJoinSuccessful,
    }),
    sortedMessages: function () {
      let toSort = JSON.parse(JSON.stringify(this.messagesInThread));
      let sorted = toSort.sort((a, b) => {
        return new Date(a.dateSent) - new Date(b.dateSent);
      });
      return sorted;
    },
  },
  mounted() {
    if (this.userCurrentChatTextBackup) {
      this.userCurrentChatText = this.userCurrentChatTextBackup;
    }
    this.scrollChatToBottom();
  },
  methods: {
    returnDate(dateTime) {
      const options = { weekday: "long", month: "long", day: "numeric" };
      let date = new Date(dateTime).toLocaleDateString("en-US", options);
      return date;
    },
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
    scrollChatToBottom() {
      //   let chatMessages = this.$refs.messages;
      let chatMessages = document.getElementById("messages");
      chatMessages.scrollTop = chatMessages.scrollHeight;
      //   chatMessages.scrollIntoView(false);
    },
  },
  watch: {
    messagesInThread: function () {
      let globalThis = this;
      globalThis.$nextTick(() => {
        globalThis.scrollChatToBottom();
      });
    },

    // Restore message from store if send fails;
    messageSendFailure: function () {
      let globalThis = this;
      globalThis.userCurrentChatText =
        globalThis.$store.state.chat.userCurrentChatTextBackup;
      globalThis.$store.dispatch("chat/updateBackupChatText", "");
    },

    // messageSendSuccessful: function() {
    //     let globalThis = this;
    //     globalThis.$store.dispatch("chat/updateBackupChatText", "");
    // }
  },
};
</script>

<style scoped>
.chat-text {
  color: #3f3f3f;
  height: calc(100vh - 63px);
  display: flex;
  box-sizing: border-box;
  flex-direction: column;
}

.displayName {
  color: #a8acbd;
  font-size: 14px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.messageContent {
  background-color: #eceff3;
  padding: 10px;
  border-radius: 6px;
  width: 70%;
}

.localMessageContent {
  background-color: #eceff3;
  padding: 10px;
  border-radius: 6px;
  width: 70%;
  margin-left: auto;
}

.messages {
  flex: 1;
  overflow-y: scroll;
  display: flex;
  flex-direction: column;
  padding: 5px;
}

.message {
  padding: 5px 7px;
  position: relative;
}

.localDisplayName {
  color: #a8acbd;
  font-size: 14px;
  text-align: right;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  position: relative;
}

.messageText {
  font-size: 18px;
  padding: 2px 0px;
  color: #1f3058;
}

/*
THIS MUST BE GLOBAL STYLE TO WORK WITH AUTO-LINKER TO PRODUCE LINKS
.messageTextLink {
  color: #1f3058;
  text-decoration: underline;
}

.messageTextLink:hover {
  color: blue;
} */

.localMessageText {
  font-size: 18px;
  padding: 2px 0px;
  color: #1f3058;
  text-align: end;
}

.chatInputBox {
  border: 1px solid #eee;
  border-radius: 3px;
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
  border-radius: 4px;
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

.chatSubmitContainer {
  flex: 0 0 auto;
  border-top: 1px solid #ddddddbd;
  flex-direction: column;
  padding: 15px 0px;
  z-index: 500;
  box-shadow: inset 0px -5px 2px 0px #eceff3b8, 0px -14px 18px 0px #f3f3f3ad;
}

.dateTimeDisplay,
.localDateTimeDisplay {
  position: absolute;
  bottom: -2px;
  font-size: 10px;
  right: 14px;
  font-weight: 600;
  color: #6e799399;
  align-items: inherit;
  text-align: right;
  padding: 2px;
  z-index: 999;
  max-width: 212px;
  border-radius: 5px;
}

.localDateTimeDisplay {
  bottom: 0px;
  right: 14px;
}
</style>