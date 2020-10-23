<template>
  <div
    class="room-pass-verif"
    v-if="ready && passwordNeedsMatching === true && !passwordMatched"
  >
    <!-- <div class="enter-room-password-title">eventroom.to</div> -->
    <router-link to="/" class="logo-link">
      <img :src="logo" class="logo"
    /></router-link>
    <div class="enter-room-password">
      <div class="enter-room-password-title">
        Please enter a password to join
        <span class="pass-room-name">{{ eventroom.eventroomName }}</span>
      </div>
      <input
        class="room-password"
        type="password"
        placeholder="Enter room pass"
        v-model="roomPasswordCheck"
      />
      <div v-if="checkingPasswordFailed" class="inputErrorContainer">
        <div class="inputErrorText">{{ checkingPasswordError }}</div>
      </div>
      <div
        id="check-pass"
        class="check-pass"
        @click="checkIfRoomPasswordMatches"
      >
        Enter room
      </div>
    </div>
  </div>
  <div
    v-else-if="ready && passwordNeedsMatching == false"
    class="room-container"
  >
    <RoomShortcuts
      v-hotkey="keymap"
      v-show="showShortcutsModal"
      @wrapperClick="toggleShowShortcuts"
    />
    <RoomToolbar />
    <RoomLeftSidebar v-if="leftSidebar" />
    <div class="video-chat">
      <TwilioVideo
        v-if="RTCConfig.twilio && userId && eventroom.eventroomId"
        :eventroomId="eventroom.eventroomId"
        :userId="userId"
        ref="twilio"
      />
      <VanillaRTCVideo
        v-if="RTCConfig.vanillaRTC && userId && eventroom.eventroomId"
        :eventroomId="eventroom.eventroomId"
        :userId="userId"
        :userMediaSettings="userMediaSettings"
        :userMediaDefaultPreferences="userMediaDefaultPreferences"
        ref="vanillaRTC"
      />
      <RoomBottomBar
        :moreThanOneAndLessThanThreeInSession="
          moreThanOneAndLessThanThreeInSession
        "
        @toggleMedia="toggleMedia"
        @leaveRoom="leaveRoom"
        ref="bottomBar"
      />
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";
import RoomToolbar from "./RoomComponents/RoomToolbar";
import RoomBottomBar from "./RoomComponents/RoomBottomBar";
import RoomLeftSidebar from "./RoomComponents/RoomLeftSidebar";
import RoomShortcuts from "./RoomComponents/RoomShortcuts";
import TwilioVideo from "./Twilio/TwilioVideo";
import VanillaRTCVideo from "./VanillaRTC/VanillaRTCVideo";
import axios from "axios";
import auth from "../../config/auth";
import { destroyTempToken, setTempToken } from "../../config/axios";

import logo from "../../assets/logo.png";
// import SessionController from "../../session/SessionController";
// import { requestWithAuthentication } from "../../config/api";

function initialState() {
  return {
    twilioReady: false,
    userDisabledAnon: false,
    isCofocusSession: false,
    logo: logo,
    roomPasswordCheck: "",
    checkingPassword: false,
    checkingPasswordFailed: false,
    checkingPasswordError: "",
    passwordMatched: false,
    sideBarConfigs: {
      leftSidebar: false,
    },
    showShortcutsModal: false,
    moreThanOneAndLessThanThreeInSession: false,
    userMediaDefaultPreferences: {
      cameraOn: true,
      microphoneOn: true,
      speakerOn: true,
    },
  };
}

export default {
  name: "RoomPage",
  data: function () {
    return initialState();
  },
  computed: {
    ...mapState({
      user: (state) => state.auth.user,
      isAuthenticated: (state) => state.auth.authenticationStatus,
      isVerified: (state) => state.auth.verificationStatus,
      tempUser: (state) => state.tempuser.tempUser,
      leftSidebar: (state) => state.toolbar.containersConfig.leftSidebar,
      eventroom: (state) => state.eventroom.eventroomData,
      userMediaSettings: (state) => state.mediastates.userMediaSettings,
      RTCConfig: (state) => state.mediastates.RTCConfig,
      userId: (state) => state.auth.userId,
      ready: (state) => state.eventroom.ready,
      passwordNeedsMatching: (state) => state.eventroom.passwordNeedsMatching,
      // connectionID: (state) => state.session.thisConnectionId,
      // sessionID: (state) => state.session.thisSessionId,
    }),
    keymap() {
      // https://github.com/Dafrok/v-hotkey
      return {
        "alt+s": this.toggleShowShortcuts,
        // 'enter': {
        //   keydown: this.hide,
        //   keyup: this.show
        // }
      };
    },
  },
  components: {
    RoomToolbar,
    RoomBottomBar,
    RoomLeftSidebar,
    RoomShortcuts,
    TwilioVideo,
    VanillaRTCVideo,
  },
  beforeRouteLeave(to, from, next) {
    this.cleanBeforeLeave(true, next);
  },
  created() {
    let globalThis = this;
    globalThis.handler = function (e) {
      globalThis.keyboardEvent(e);
    };
    window.addEventListener("keyup", this.handler);
  },
  async mounted() {
    let globalThis = this;
    /**
     * 1. Client enters room
     * 2. If no user (no auth), create temp user
     *   2.1 Set temporary token for the temporary user
     *   2.2 Get room using temp user details (custom name and id)
     * 4. If user exists, get room using user details (username and id)
     *
     *
     * Check to see if user already has a temporary token for the room?
     */
    console.log("@1 Begin Eventroom mount.");

    // Check if first string after core path contains 'session'
    // Pathname [0] returns empty string, [1] is the real first /path
    const firstPath = window.location.pathname.split("/")[1];
    if (firstPath == "session") {
      // might be 'hackable', allowing access to anon users if tweaked
      // by some savvy folk; though this is primarily for UX goals
      // someone should look into covering this
      globalThis.isCofocusSession = true;
    }

    console.log("@2 Check if user exists...");
    if (this.user && this.isAuthenticated) {
      console.log("@2.5 User exists, getting room.", this.user);
      let userId = this.user._id;
      console.log()
      this.$store.dispatch("auth/updateUserId", userId);
      // this.getRoom();
      await this.addUserToRoomData(userId);
      this.getAndSetMediaPreferences();
      this.initSocketListening();
      this.joinUserToChat();
    }

    // Detect purpose & use case of eventroom

    // Check if user has disabled anon users in their room
    // Check if Cofocus session
    if (!this.isCofocusSession && !this.userDisabledAnon) {
      // During Cofocus sessions, anon users are not allowed
      // however, during other cases, including future cases
      // other than Cofocus, it is possible anon users are
      // desired in the rooms and thus they are to either
      // be added (if already exist) or created

      // Also check to ensure not logged in case temp someone survived, else replaces id
      if (this.tempUser && this.tempUser._id && !this.user && !this.isAuthenticated) {
        // Check if temporary user already exists;
        let temp = this.tempUser;
        let userId = temp._id;
        this.$store.dispatch("auth/updateUserId", userId);
        await this.addUserToRoomData(userId, true);
        this.getAndSetMediaPreferences();
        this.initSocketListening();
        this.joinUserToChat();
      } else if (!this.tempUser && !this.tempUser._id && !this.user && !this.isAuthenticated) {
        await this.createTempUser();
      }
    } else {
      window.location.href = "/account/login";
    }

    console.log("@3 Get and set Media Preferences.");
    // this.getAndSetMediaPreferences();

    console.log("logging socket: ", this.$socket);

    // Make sure you do not use any sockets before having initialized listening
    // this.initSocketListening();

    // this.joinUserToChat();

    window.onbeforeunload = () => {
      globalThis.cleanBeforeLeave();
    };
  },
  methods: {
    cleanBeforeLeave(fromBeforeLeave = false, next = null) {
      if (this.RTCConfig.vanillaRTC) {
        this.$refs.vanillaRTC.prepareToExit();
      } else if (this.RTCConfig.twilio) {
        this.$refs.twilio.prepareToExit();
      }

      let eventroomId = this.eventroom.eventroomId;
      this.$socket.emit("leaveChat", eventroomId);

      this.sockets.unsubscribe("userJoinedChat");
      this.sockets.unsubscribe("messageReceived");
      this.sockets.unsubscribe("messageSendFailed");
      this.sockets.unsubscribe("joinChatFail");
      // this.$socket.off();
      // this.$socket.disconnect();
      // this.$socket.close();
      // this.$socket = undefined;
      // this.$socket.connected = false;
      // this.$socket.disconnected = true;

      this.$store.dispatch("tempuser/destroyTempUser");
      destroyTempToken();
      this.$store.dispatch("eventroom/clearEventroom");
      this.$store.dispatch("auth/updateUserId", "");
      window.removeEventListener("keyup", this.handler);
      this.resetData();

      if (fromBeforeLeave && next !== null) {
        next();
      }
    },
    async checkIfRoomPasswordMatches() {
      let errors = {};
      try {
        this.checkingPassword = true;

        this.checkingPasswordError = "";
        this.checkingPasswordFailed = false;

        const axiosGetQuery = `/api/eventroom/checkIfRoomPasswordMatches`;
        const queryData = {
          eventroomId: this.eventroom.eventroomId,
          roomPasswordCheck: this.roomPasswordCheck,
        };

        const response = await axios.post(axiosGetQuery, queryData);

        console.log("respo", response);
        if (!response.data.result) {
          errors.PasswordDidNotMatch = true;
          throw { errors: errors };
          // this.checkingPasswordFailed = true;
          // this.checkingPasswordError = "Wrong password!";
          // this.roomPasswordCheck = "";
        }

        if (response.data.result && response.data.success) {
          this.$store.dispatch("eventroom/passwordMatchedUpdate");
          this.passwordMatched = true;
          this.checkingPassword = false;
          this.roomPasswordCheck = "";
        }
      } catch (error) {
        console.log("error: ", error.response.data.errors.PasswordDidNotMatch);
        this.checkingPassword = false;
        this.checkingPasswordFailed = true;
        this.roomPasswordCheck = "";
        if (error.response.data.errors.PasswordDidNotMatch) {
          this.checkingPasswordError = "Wrong password. Try again!";
        } else {
          this.checkingPasswordError = "Failed to check password. Try again.";
        }
      }
    },
    initSocketListening() {
      let globalThis = this;
      this.sockets.subscribe("userJoinedChat", (data) => {
        console.log("USER JOINED CHAT WITH ID", data.userId);
        // globalThis.$store.dispatch("chat/userJoinSucessful", true);
        // globalThis.userHasJoined = true;
        //   globalThis.userIsAttemptingJoin = false;
      });

      this.sockets.subscribe("messageReceived", (message) => {
        console.log("Received message", message);
        //- Wait for Vue to render element
        globalThis.$store.dispatch("chat/addMessage", message);
      });

      // Failed sockets
      this.sockets.subscribe("messageSendFailed", (response) => {
        // globalThis.$store.dispatch("chat/messageFailure", true);
        // globalThis.$store.dispatch("chat/messageSending", false);
        console.log("Message sending failed", response);
      });

      this.sockets.subscribe("joinChatFail", (response) => {
        console.log("Massive fail", response);
      });
    },
    joinUserToChat() {
      let eventroomData = {
        eventroomId: this.eventroom.eventroomId,
        userId: this.userId,
      };

      // NOW PROVIDE MORE DATA, TO SAY WHICH USER AND SO ON;
      this.$socket.emit("joinChat", eventroomData);
      this.$store.dispatch("chat/userJoinSucessful", true);
    },
    leaveRoom() {
      if (!this.isAuthenticated) {
        this.$router.push("/");
      } else {
        this.$router.push("/account/dashboard");
      }
    },
    toggleShowShortcuts() {
      this.showShortcutsModal = !this.showShortcutsModal;
    },
    resetData: function () {
      Object.assign(this.$data, initialState());
    },
    async getRoom() {
      console.log(
        "@X Attempt get Eventroom by name:",
        this.$route.params.eventroomName
      );

      const axiosGetQuery = `/api/eventroom/${this.$route.params.eventroomName}`;
      const result = await axios.get(axiosGetQuery);

      console.log("@X1, Received getEventroomByName result", result);
      let eventroomData = result.data.response.eventroom[0];

      console.log("@X2, Dispatching Eventroom data to Vuex", eventroomData);
      this.$store.dispatch("eventroom/setInitialEventroomData", eventroomData);

      console.log("@X3, Logging Vuex Eventroom data state", this.eventroom);

      // if (result.data.response.success) {
      //   this.$socket.emit("joinRoom", result.roomData);
      //   this.ready = true;
      // } else {
      //   this.ready = true;
      //   this.errors = true;
      // }
    },
    async createTempUser() {
      let globalThis = this;
      try {
        //- Get room parameter
        const eventroomName = this.$route.params.eventroomName;

        const eventroomData = { eventroomName };
        const axiosPostQuery = `/api/accounts/createTempUser`;
        const { data } = await axios.post(axiosPostQuery, eventroomData);

        console.log("@createTempUser, result from createTempUser:", data);

        setTempToken(data.tempToken);
        localStorage.tempUser = JSON.stringify(data.tempUser);

        if (auth.checkTempToken()) {
          let temporaryUser = auth.checkTempToken();
          console.log("temporary", temporaryUser);

          const vuexQuery = "tempuser/addNewTempUser";
          await globalThis.$store.dispatch(vuexQuery, temporaryUser);

          let userId = temporaryUser._id;
          this.$store.dispatch("auth/updateUserId", userId);
          await this.addUserToRoomData(userId, true);
        }
      } catch (error) {
        console.log("@createTempUser: Failed to create temporary user", error);
      }
    },
    createTemporaryDummyData() {
      let userMediaDefaultPreferences = {
        cameraOn: true,
        microphoneOn: true,
        speakerOn: true,
      };
      return userMediaDefaultPreferences;
    },
    getAndSetMediaPreferences() {
      console.log("@getAndSetMediaPreferences from Vuex");
      // If user, check database

      // If no user, check vuex

      // Set temporary dummy data
      let dummyData = this.createTemporaryDummyData();
      let userPreferences = this.userMediaDefaultPreferences;

      // Synchronize local data with database / vuex
      userPreferences.cameraOn = dummyData.cameraOn;
      userPreferences.microphoneOn = dummyData.microphoneOn;
      userPreferences.speakerOn = dummyData.speakerOn;

      let settingsData = {
        cameraOn: dummyData.cameraOn,
        microphoneOn: dummyData.microphoneOn,
        speakerOn: dummyData.speakerOn,
      };

      // Update global media settings data with realtime media state
      this.$store.dispatch(
        "mediastates/setManyMediaSettingStates",
        settingsData
      );
    },
    toggleMedia(type) {
      if (this.RTCConfig.twilio) {
        if (type == 0) {
          this.$refs.twilio.toggleVideo();
        } else if (type == 1) {
          this.$refs.twilio.toggleAudio();
        } else if (type == 2) {
          this.$refs.twilio.toggleScreenshare();
        } else if (type == 3) {
          this.$refs.twilio.togglePictureInPicture();
        }
      } else if (this.RTCConfig.vanillaRTC) {
        if (type == 0) {
          this.$refs.vanillaRTC.toggleVideo();
        } else if (type == 1) {
          this.$refs.vanillaRTC.toggleAudio();
        } else if (type == 2) {
          this.$refs.twilio.toggleScreenshare();
        } else if (type == 3) {
          this.$refs.twilio.togglePictureInPicture();
        }
      }
    },
    setLocalChatUser() {
      let localChatUser = {};
      localChatUser.eventroomId = this.eventroom.eventroomId;
      localChatUser.userId = this.userId;

      // later other configs, e.g. if this.user.displayNamePreference && contextBasedDisplayNamePReference
      if (this.user) {
        if (this.user.displayName) {
          localChatUser.displayName = this.user.displayName;
        } else if (this.user.firstName && this.user.lastName) {
          localChatUser.displayName =
            this.user.firstName + "" + this.user.lastName;
        } else if (this.user.firstName && !this.user.lastName) {
          localChatUser.displayName = this.user.firstName;
        } else if (this.user.username) {
          localChatUser.displayName = this.user.username;
        }
      } else if (this.tempUser) {
        console.log("tempuser", this.tempUser);
        localChatUser.displayName = this.tempUser.displayName;
      } else if (!this.tempUser && !this.tempUser.displayName && !this.user) {
        alert("YOU NEED AN ACCOUNT!");
      }

      this.$store.dispatch("chat/setLocalChatUser", localChatUser);

      console.log("localChatUser", localChatUser);
    },

    // How anon stuff works
    // Get list of anon users
    // Display them in list as well, iterate-push
    async addUserToRoomData(participant, temporary = false) {
      if (!participant) return;
      let isAnon = temporary;
      console.log("ISANON", isAnon, participant);

      try {
        const eventroomName = this.$route.params.eventroomName;
        const queryData = { eventroomName, participant, isAnon };
        const axiosPostQuery = `/api/eventroom/addUserToRoomData`;
        const response = await axios.post(axiosPostQuery, queryData);

        let eventroom = response.data.result;
        console.log("yoooo", eventroom);
        if (!eventroom) {
          throw { error: "Couldn't add participant to database," };
        }

        this.$store.dispatch("eventroom/setInitialEventroomData", eventroom);
        // Set user details in Vuex store for sending chat messages
        this.setLocalChatUser();
      } catch (error) {
        console.log("Failed to add user to room data.", error);
      }
    },
    keyboardEvent(e) {
      let globalThis = this;
      if (e.target.className == "chatInputBox") {
        if (e.which == 13) {
          document.getElementById("chatInputSend").click();
        } else {
          return;
        }
      }

      if (e.target.className == "room-password") {
        if (e.which == 13) {
          document.getElementById("check-pass").click();
        } else {
          return;
        }
      }
      if (e.target.classList.contains("eventroom-name")) return;

      if (e.which == 67) {
        globalThis.toggleMedia(0);
      } else if (e.which == 77) {
        globalThis.toggleMedia(1);
      } else if (e.which == 90) {
        globalThis.toggleMedia(2);
      } else if (e.which == 80) {
        globalThis.$refs.bottomBar.toggleToolbar("participants");
      } else if (e.which == 82) {
        globalThis.$refs.bottomBar.toggleToolbar("info");
      } else if (e.which == 83) {
        globalThis.$refs.bottomBar.toggleToolbar("settings");
      }
    },

    // /* eslint-disable no-unused-vars */
    // async beforeRouteLeave(to, from, next) {
    //   try {
    //     console.log(
    //       "@beforerouteleave connection id",
    //       this.connectionID,
    //       this.sessionID
    //     );
    //     requestWithAuthentication("post", `/api/events/disconnectFromEvent`, {
    //       // Probably unnecessary but idk
    //       sessionId: this.sessionID,
    //       connectionId: this.connectionID,
    //     })
    //       .then((result) => {
    //         console.log("@beforerouteleave response: ", result);
    //         SessionController.disconnect();
    //       })
    //       .then((result) => {
    //         console.log("@beforerouteleave no error?", result);
    //       })
    //       .catch((err) => {
    //         console.log("@beforerouteleave error:", err);
    //         this.ready = true;
    //         this.errors = true;
    //         this.errorMessage =
    //           "Problem with leaving this page, please refresh page.";
    //       });
    //   } catch (err) {
    //     // Probably if errors occur, the users will be stuck here endlessly but idc
    //     console.log("@beforerouteleave error:", err);
    //     this.ready = true;
    //     this.errors = true;
    //     this.errorMessage =
    //       "Problem with leaving this page, please refresh page.";
    //   }
    //   next();
  },
  // watch: {
  //   "$store.state.tempuser.tempUser": async function (temporaryUser) {
  //     if (temporaryUser) {
  //       console.log("tempUserMapping", temporaryUser);
  //       await this.addUserToRoomData(temporaryUser, true);
  //       // await this.getRoom();
  //     }
  //   },
  // },
};
</script>

<style scoped>
.room-container {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: row;
  /* justify-content: center; */
  align-items: center;
}

.video-chat {
  height: 100%;
  margin: 0 auto;
  width: 100%;
  position: relative;
}

.room-pass-verif {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.enter-room-password {
  width: 699px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px 20px 25px 20px;
  background-color: #f7f8f9;
  margin-bottom: 100px;
  margin-top: 25px;
  border-radius: 35px;
  padding-bottom: 40px;
}

.enter-room-password-title {
  font-size: 34px;
  font-weight: 600;
  text-align: center;
  margin-right: auto;
  margin-left: auto;
  margin-bottom: 35px;
  width: 600px;
  line-height: 40px;
}

.room-password {
  border: 1px solid #eee;
  border-radius: 10px;
  width: 300px;
  caret-color: #666;
  padding: 8px 14px;
  font-size: 22px;
  font-family: "Nunito", sans-serif;
  transition: 0.2s ease;
  box-sizing: border-box;
  outline: none;
}

.room-password:hover {
  border-color: #ccc;
}

.room-password:focus {
  border-color: #ccc;
}

.check-pass {
  font-size: 25px;
  margin-top: 15px;
  letter-spacing: 0.5px;
  background-color: #e9eced;
  color: #5600ff;
  padding: 6px 14px;
  font-weight: 700;
  border-radius: 360px;
  cursor: pointer;
  transition: 0.1s ease;
  width: 300px;
  text-align: center;
  box-sizing: border-box;
}

.check-pass:hover {
  background-color: #b7bcc194;
}

.pass-room-name {
  text-transform: capitalize;
  color: #5600ff;
}

.logo {
  height: 50px;
  width: 50px;
}

.logo-link {
  background-color: #e9eced;
}

.inputErrorContainer {
  padding: 8px 0;
  background-color: #e9eced;
  border-radius: 360px;
  margin-bottom: 0px;
  margin-top: 6px;
  margin-left: auto;
  margin-right: auto;
  color: #9a2442;
  font-weight: 700;
  box-sizing: border-box;
  width: 300px;
  text-align: center;
}
</style>