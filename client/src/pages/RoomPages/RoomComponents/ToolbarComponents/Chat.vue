<template>
  <div class="chat-text">
    <!-- <div>EVENTROOM {{ eventroom.eventroomId }}</div>
    <div>USER: {{ userId }}</div> -->
    <div class="messages" ref="messages" id="messages">
      <!-- <Message /> -->
      <div
        class="message dont-break-out"
        v-for="(messageData, index) in messagesInThread"
        :key="index"
      >
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
        v-if="userHasJoined"
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

export default {
  name: "Chat",
  data() {
    return {
      userIsAttemptingJoin: false,
      userHasJoined: false,
      sendingMessage: false,
      userCurrentChatText: "",

      // BACK UP SHOULD BE IN VUEX STORE & SHOULD NOT BE NULLED
      userCurrentChatTextBackup: "",
      messagesInThread: [],
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
      //   messagesInThread: (state) => state.chat.messagesInThread,
    }),
  },
  mounted() {
    let globalThis = this;

    this.sockets.subscribe("userJoinedChat", (data) => {
      console.log("USER JOINED CHAT WITH ID", data.userId);
      globalThis.userHasJoined = true;
    });

    this.sockets.subscribe("messageReceived", (message) => {
      console.log("Received message", message);
      globalThis.messagesInThread.push(message);
      //   globalThis.$store.dispatch("chat/addMessage", message);
      globalThis.sendingMessage = false;
      globalThis.scrollChatToBottom();
    });

    // Failed sockets
    this.sockets.subscribe("messageSendFailed", (response) => {
      globalThis.sendingMessage = false;
      globalThis.userCurrentChatText = this.userCurrentChatTextBackup;
      console.log("Message sending failed", response);
    });

    this.sockets.subscribe("joinChatFail", (response) => {
      console.log("Massive fail", response);
    });
    this.joinUser();
  },
  methods: {
    joinUser() {
      let eventroomData = {
        eventroomId: this.eventroom.eventroomId,
        userId: this.userId,
      };

      // NOW PROVIDE MORE DATA, TO SAY WHICH USER AND SO ON;
      this.$socket.emit("joinChat", eventroomData);
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

      this.userCurrentChatTextBackup = this.userCurrentChatText;
      this.userCurrentChatText = "";
      this.sendingMessage = true;
      this.$socket.emit("sendChatMessage", messageData);
    },
    scrollChatToBottom() {
      //   let chatMessages = this.$refs.messages;
      let chatMessages = document.getElementById("messages");
      chatMessages.scrollTop = chatMessages.scrollHeight;
      //   chatMessages.scrollIntoView();
    },
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
  color: #b1b5b9;
  font-size: 15px;
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
}

.localDisplayName {
  color: #b1b5b9;
  font-size: 15px;
  text-align: right;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
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
  font-size: 18px ;
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
  flex-direction: column;
  padding: 15px 0px;
  z-index: 9999;
  box-shadow: inset 0px -5px 20px 0px #eceff3b8, 0px -10px 15px 0px #f3f3f3;
}
</style>