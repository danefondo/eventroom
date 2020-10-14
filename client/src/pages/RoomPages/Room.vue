<template>
  <div class="room-container">
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
// import SessionController from "../../session/SessionController";
// import { requestWithAuthentication } from "../../config/api";

function initialState() {
  return {
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
    if (this.RTCConfig.vanillaRTC) {
      this.$refs.vanillaRTC.prepareToExit();
    } else if (this.RTCConfig.twilio) {
      this.$refs.twilio.prepareToExit();
    }
    this.$store.dispatch("tempuser/destroyTempUser");
    destroyTempToken();
    this.$store.dispatch("eventroom/clearEventroom");
    this.$store.dispatch("auth/updateUserId", "");
    window.removeEventListener("keyup", this.handler);
    initialState();
    next();
  },
  created() {
    let globalThis = this;
    globalThis.handler = function (e) {
      globalThis.keyboardEvent(e);
    };
    window.addEventListener("keyup", this.handler);
  },
  async mounted() {
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

    console.log("@2 Check if user exists...");
    if (this.user && this.isAuthenticated) {
      console.log("@2.5 User exists, getting room.", this.user);
      let userId = this.user._id;
      this.$store.dispatch("auth/updateUserId", userId);
      // this.getRoom();
      this.addUserToRoomData(userId);
    } else if (this.tempUser && this.tempUser._id) {
      // Check if temporary user already exists;
      let temp = this.tempUser
      let userId = temp._id;
      this.$store.dispatch("auth/updateUserId", userId);
      this.addUserToRoomData(userId, true);
    } else {
      await this.createTempUser();
    }

    console.log("@3 Get and set Media Preferences.");
    this.getAndSetMediaPreferences();

    window.onbeforeunload = () => {
      if (this.RTCConfig.vanillaRTC) {
        this.$refs.vanillaRTC.prepareToExit();
      } else if (this.RTCConfig.twilio) {
        this.$refs.twilio.prepareToExit();
      }
      this.$store.dispatch("tempuser/destroyTempUser");
      destroyTempToken();
      this.$store.dispatch("eventroom/clearEventroom");
      this.$store.dispatch("auth/updateUserId", "");
      window.removeEventListener("keyup", this.handler);
      initialState();
    };
  },
  methods: {
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
    resetWindow: function () {
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
</style>