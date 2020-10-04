<template>
  <div v-if="!ready">
    Don't worry, we'll get you into your room!
  </div>
  <div v-else-if="errors">
    There were some errors :( 
      <br/>
    {{errorMessage}}
  </div>
  <div v-else>
    You arrived here. Unbelievable! 
    
    <div class="eventroom-container party">
      <Toolbar/>
      <VideoArea/>
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";
import SessionController from "../../session/SessionController";
import { requestWithAuthentication } from '../../config/api';

import Toolbar from "./ToolbarComponent/Toolbar";
import VideoArea from "./VideoComponent/VideoArea";

export default {
  name: "EventRoomPage",
  components: {
    Toolbar,
    VideoArea,
  },
  data() {
    return {
      ready: false,
      errors: false,
      errorMessage: "",
    };
  },
  computed: {
    ...mapState({
      user: (state) => state.auth.user,
      isAuthenticated: (state) => state.auth.authenticationStatus,
      isVerified: (state) => state.auth.verificationStatus,
      connectionID: (state) => state.session.thisConnectionId,
      sessionID: (state) => state.session.thisSessionId,
    }),
  },
  
  async mounted() {
    console.log("@eventroom mounted");
    if (this.isAuthenticated) {
      this.getRoom();
    }
  },
  methods: {
    async getRoom() {
      console.log("@getroom params!!!!!!!:", this.$route.params);
      const result = await SessionController.initializeRoom(this.$route.params.eventId, this.$route.params.roomId);
      console.log("result: ", result);
      if (result.success) {
        this.$socket.emit("joinRoom", result.roomData);
        this.ready = true;
      } else {
        this.ready = true;
        this.errors = true;
      }
    },
  },
/* eslint-disable no-unused-vars */
  async beforeRouteLeave (to, from, next) {
    try {
      console.log("@beforerouteleave connection id", this.connectionID, this.sessionID);
      requestWithAuthentication('post', `/api/events/disconnectFromEvent`, {  // Probably unnecessary but idk
        sessionId: this.sessionID,
        connectionId: this.connectionID
      }).then(result => {
        console.log("@beforerouteleave response: ", result);
        SessionController.disconnect();
      }).then( result => { 
        console.log("@beforerouteleave no error?", result);
      }).catch (err => {
          console.log("@beforerouteleave error:", err);
        this.ready = true;
        this.errors = true;
        this.errorMessage = "Problem with leaving this page, please refresh page."
      }) 
      
    } catch (err) {
      // Probably if errors occur, the users will be stuck here endlessly but idc
      console.log("@beforerouteleave error:", err);
      this.ready = true;
      this.errors = true;
      this.errorMessage = "Problem with leaving this page, please refresh page."
    }
    next()
  }
/* eslint-enable no-unused-vars */
}
</script>

<style scoped>
.eventroom-feed {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  background-color: #242729;
  border-right: 1px solid #333537;
  width: 100%;
  height: 100%;
  overflow: hidden;
  position: relative;
}
.watch {
  width: 324px;
  max-height: 100%;
  height: 100%;
  background-color: #242729;
  overflow: hidden;
  padding: 20px;
}
.eventroom-container {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: row;
  /* justify-content: center; */
  align-items: center;
}
.eventroom-ribbon {
  width: 50px;
  background-color: #242729;
  height: 100%;
  border-right: 1px solid #333537;
}
.eventroom-panel {
  width: 324px;
  height: 100%;
  background-color: #242729;
  border-right: 1px solid #333537;
}
.title {
  font-size: 47px;
  margin-bottom: 20px;
}
.event-creator {
  display: flex;
  flex-direction: column;
  /* justify-content: center; */
  align-items: center;
  text-align: center;
  height: 100%;
}
.event-creator-inputs {
  margin-top: 104px;
  width: 275px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.event-creator-input {
  outline: none;
  padding: 10px;
  margin: 0 auto;
  margin-bottom: 15px;
  border: 1px solid #ddd;
  border-radius: 3px;
  font-size: 16px;
  min-width: 275px;
  max-width: 275px;
}
.event-creator-input:focus {
  border: 1px solid #493eff;
}

.input-title {
  text-align: left;
  margin-bottom: 7px;
}

.ck-creator-input {
  padding-top: 0px !important;
}

.ck-creator-input:focus {
  border: 1px solid #493eff !important;
}

/*! CSS Used from: https://campfire.gg/styles.04163730.css */
.dropdown {
  position: relative;
  display: flex;
  user-select: none;
}
.dropdown .toggle {
  display: flex;
  cursor: pointer;
}
.controls .control {
  display: flex;
  align-items: center;
  cursor: pointer;
}
* {
  box-sizing: border-box;
}
::-webkit-scrollbar {
  -webkit-appearance: none;
}
::-webkit-scrollbar-track {
  background-color: transparent;
}
::-webkit-scrollbar-thumb {
  background-color: rgba(0, 0, 0, 0.25);
}

.eventroom-container .spotlight-boxes {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  background-color: #000;
  border-right: 1px solid #333537;
  /* width: 100%; */
  height: 100%;
  overflow: hidden;
  position: relative;
  padding: 30px;
}
.eventroom-container .spotlight-boxes.empty {
  background-color: #242729;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  scrollbar-width: none;
}

/*! CSS Used keyframes */
@keyframes infiniteMove {
  0% {
    background-position: 0 0;
  }
  50% {
    background-position: 0 1200px;
  }
  to {
    background-position: 0 0;
  }
}
</style>