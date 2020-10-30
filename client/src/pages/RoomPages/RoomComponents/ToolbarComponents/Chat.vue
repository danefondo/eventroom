<template>
  <div class="chat-text">
    <div v-if="tweenStarted" ref="container" class="leaves">
      <div class="dot" v-for="(dot, index) in total" :key="index">
        {{ startTween(index) }}
      </div>
    </div>
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
          {{ returnHoursMinutes(messageData.dateSent) }}
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
        id="chatInputBox"
        class="chatInputBox"
        type="text"
        placeholder="Whatcha wanna say?"
        v-model="userCurrentChatText"
      />
      <div id="chatInputSend" class="chatInputSend" @click="sendMessage">
        Send
      </div>
      <img :src="box" @click="popMystery" class="mystery" />
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";
import box from "../../../../assets/images/box.png";
import gsap from "gsap";

import { format } from "date-fns";
// Chat.vue is a SIGNALER;

export default {
  name: "Chat",
  data() {
    return {
      //   userIsAttemptingJoin: false,

      total: 30,
      w: window.innerWidth,
      h: window.innerHeight,
      tweenStarted: false,

      box: box,

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
    startTween(index) {
      this.$nextTick(function () {
        let childTween = this.$refs.container.children[index];
        gsap.set(childTween, {
          x: this.R(0, this.w),
          y: this.R(-200, -150),
          z: this.R(-200, 200),
        });
        this.animm(childTween);
      });
    },
    animm(elm) {
      gsap.to(elm, this.R(6, 15), {
        y: this.h + 100,
        ease: gsap.easeNone,
        repeat: -1,
        delay: -15,
      });
      gsap.to(elm, this.R(4, 8), {
        x: "+=100",
        rotationZ: this.R(0, 180),
        repeat: -1,
        yoyo: true,
        ease: gsap.easeInOut,
      });
      gsap.to(elm, this.R(2, 8), {
        rotationX: this.R(0, 360),
        rotationY: this.R(0, 360),
        repeat: -1,
        yoyo: true,
        ease: gsap.easeInOut,
        delay: -5,
      });
    },
    R(min, max) {
      return min + Math.random() * (max - min);
    },
    popMystery() {
      /* a Pen by Diaco m.lotfollahi  : https://diacodesign.com */
      // var falling = true;
      this.tweenStarted = true;
      this.$nextTick(function () {
        let container = this.$refs.container;
        gsap.set(container, { perspective: 600 });
      });
      // TweenLite.set("img", { xPercent: "-50%", yPercent: "-50%" });
    },
    returnDate(dateTime) {
      const options = { weekday: "long", month: "long", day: "numeric" };
      let date = new Date(dateTime).toLocaleDateString("en-US", options);
      return date;
    },
    returnHoursMinutes(dateTime) {
      let date = new Date(dateTime);
      // let hours = getHours(date);
      // let minutes = getMinutes(date);
      // let time = hours + ":" + minutes;
      let time = format(date, "hh:mmaaaaa'm'");
      return time;
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
  /* color: #1f3058; */
  color: #323b50;
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
  /* color: #1f3058; */
  color: #323b50;
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
  position: relative;
  /* border-top: 1px solid #ddddddbd; */
  border-top: 1px solid #f3f3f3;
  flex-direction: column;
  padding: 15px 0px;
  z-index: 500;
  /* box-shadow: inset 0px -5px 2px 0px #eceff3b8, 0px -14px 18px 0px #f3f3f3ad; */
}

.dateTimeDisplay,
.localDateTimeDisplay {
  position: absolute;
  bottom: -2px;
  font-size: 11px;
  right: 14px;
  font-weight: 600;
  color: #6e799399;
  align-items: inherit;
  text-align: right;
  padding: 2px;
  z-index: 999;
  max-width: 212px;
  border-radius: 5px;
  opacity: 0;
  transition:opacity 0.1s ease-out 0s;
  transition-delay: 0s;
}

.localDateTimeDisplay {
  bottom: 26px;
  right: 80%;
  left: unset;
}

.dateTimeDisplay {
  left: 80%;
  bottom: 26px;
  right: unset;
}


.message:hover .dateTimeDisplay,
.message:hover .localDateTimeDisplay {
  opacity: 1;
  transition:opacity 0.1s ease-out 0s;
  transition-delay: 0.4s;
}

.mystery {
  width: 24px;
  height: 24px;
  position: absolute;
  bottom: 20px;
  right: 100px;
  transition: 0.1s ease-in-out;
}

.mystery:hover {
  /* transform: scale(1.04); */
  transform: rotate(25deg) scale(1.08);
  cursor: pointer;
}

.leaves {
  z-index: 9999;
}
/* 
.dot {
  background-color: green;
  width: 25px;
  height: 25px;
  z-index: 9999;
} */

body {
  background-color: #111;
  font-family: Signika Negative, Asap, sans-serif;
  color: white;
  overflow: hidden;
}
.dot {
  width: 35px;
  height: 35px;
  position: absolute;
  background: url(http://www.clipartqueen.com/image-files/red-lobed-fall-clipart-leaf.png);
  background-size: 100% 100%;
}
html,
body,
#container {
  width: 100%;
  height: 100%;
}
#logo {
  left: 50%;
  top: 50%;
  position: absolute;
  border-radius: 10px;
}
</style>