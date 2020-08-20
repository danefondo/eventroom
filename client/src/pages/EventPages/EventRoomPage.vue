<template>
  <div class="special-container" v-if="room">
    <div class="watch">
      <div class="host-bar">
        <div class="is_host">{{userIsHost ? 'You are the HOST!' : 'You are currently not a host.'}}</div>
      </div>
      <Session
        v-if="sessionId &amp;&amp; apiKey &amp;&amp; token"
        :sessionId="sessionId"
        :apiKey="apiKey"
        :token="token"
      ></Session>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import auth from "../../config/auth";
import { setTempToken } from "../../config/axios";
import Session from "../../components/Session";

export default {
  name: "EventRoomPage",
  data() {
    return {
      user: {},
      tempUser: {},
      room: {},
      event: {},
      isAuthenticated: false,
      isVerified: false,
      sessionId: "",
      apiKey: "",
      token: "",
      hostPresent: false,
      userIsHost: false,
      isConnected: false,
      connection: null,
    };
  },
  components: {
    Session,
  },
  async mounted() {
    let authenticationResult = await auth.isAuthenticated();
    if (authenticationResult.success) {
      this.user = authenticationResult.response.user;
      this.isVerified = authenticationResult.response.user.isVerified;
      this.isAuthenticated = true;
    }

    if (!authenticationResult.success) {
      this.createTempUser();
    }

    if (this.user) {
      this.getRoom();
    }
  },
  methods: {
    async createTempUser() {
      try {
        const roomIdParam = window.location.href.substring(
          window.location.href.lastIndexOf("/") + 1
        );
        const { data } = await axios.post(
          `/api/accounts/createTempUser`,
          roomIdParam
        );

        setTempToken(data.tempToken);
        localStorage.tempUser = JSON.stringify(data.tempUser);

        if (auth.checkTempToken()) {
          this.tempUser = auth.checkTempToken();
        }
      } catch (error) {
        console.log("Failed to create temporary user", error);
      }
    },
    async getRoom() {
      const roomIdParam = window.location.href.substring(
        window.location.href.lastIndexOf("/") + 1
      );
      try {
        const { data } = await axios.get(
          `/api/events/${this.$route.params.id}/getRoom/${roomIdParam}`
        );
        console.log("d", data);
        console.log("r", data.room);
        this.roomNotFound = false;
        this.room = data.room;
        this.sessionId = data.sessionId;
        this.apiKey = data.apiKey;
        this.token = data.token;

        //- SET HOST

        if (this.user && this.user._id == this.room.hostId) {
          this.userIsHost = true;
        }

        const roomId = this.room._id;
        let userId;
        if (this.tempUser) {
          userId = this.tempUser._id;
        } else {
          userId = this.user._id;
        }
        //- JOIN ROOM
        const roomData = {
          userId: userId,
          roomId: roomId,
        };
        this.$socket.emit("joinRoom", roomData);
      } catch (error) {
        console.log("event", error);
        this.roomNotFound = true;
      }
    },
  },
  watch: {
    tempUser: function () {
      if (this.tempUser) {
        this.getRoom();
      }
    },
  },
};
</script>

<style scoped>
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
</style>