<template>
  <div class="opaque">
    <div v-if="!requestPending">
      <div v-if="!requestSuccessful && !requestFailed">
        <button @click="requestInstantMatch">Request Instant Match</button>
      </div>
      <div v-if="requestSuccessful">
        Your request was successful. Please click the button below to join a
        match with person X (data should be loaded)
        <button @click="joinRoom">Join session</button>
        {{ randomtext }}
      </div>
      <div v-if="requestFailed">
        Your request was not successful. Please click the button below to retry
        <button @click="requestInstantMatch">Request Instant Match</button>
      </div>
    </div>
    <div v-else>
      Your request is pending...
      <button @click="cancelRequest">Cancel</button>
    </div>
    <button @click="increaseID">{{ tempUser.ID }}</button>
    <div v-if="sessionFound">
      FOUND A SESSION: user1: {{ sessionData.user1 }} with
      {{ sessionData.user2 }}
    </div>

    <button @click="printredis">print redis</button>
    <button @click="delRedis">DO NOT PRESS THIS BUTTON</button>
  </div>
</template>

<script>
import io from "socket.io-client";

import { BASE_PATH } from "../constants";
import { requestInstantMatch, cancelRequest } from "./InstantMatchUtilities";

const namespace = BASE_PATH + "/instant_match";
let socket = io(namespace);

export default {
  name: "InstantMatch",
  data() {
    return {
      requestSuccessful: false,
      requestPending: false,
      requestFailed: false,
      requestCancelled: false,
      sessionData: null,
      sessionFound: false,
      requestStartTime: "",
      // blank for testing, to delete
      tempUser: {
        ID: 0,
        data: {
          best: "definitely",
          iq: "genius",
        },
        preferences: {
          money: "yes",
          webdev: "no",
        },
      },
      randomtext: "",
    };
  },
  beforeRouteLeave(to, from, next) {
    if (this.requestPending) {
      cancelRequest();
      this.restoreDefault();
    }
    next();
  },
  methods: {
    restoreDefault() {
      this.requestSuccessful = false;
      this.requestPending = false;
      this.requestFailed = false;
      this.requestCancelled = false;
      this.sessionfound = false;
    },
    requestInstantMatch() {
      if (this.requestPending) {
        return;
      }
      this.requestPending = true;
      this.requestCancelled = false;
      requestInstantMatch(socket, this.tempUser) // TODO to change to real user
        .then((result) => {
          this.sessionData = result;
          this.requestSuccessful = true;
          this.requestPending = false;
          this.sessionFound = true;
        })
        .catch((error) => {
          // eslint-disable-line no-unused-vars
          console.log(error);
          this.requestFailed = true;
          this.requestPending = false;
        });
    },

    joinRoom() {
      this.randomtext = "HAHA no logic for this yet";
    },
    cancelRequest() {
      cancelRequest(socket, this.tempUser);
      console.log("disconnecting...");
      this.requestPending = false;
      this.requestCancelled = true;
    },
    /** development time stuff, ignore */
    increaseID() {
      this.tempUser.ID += 1;
    },
    printredis() {
      socket.emit("PRINT_REDIS", "haha");
    },
    delRedis() {
      socket.emit("DELETE_REDIS", "haha");
    },
  },
};
</script>

<style scoped>
.opaque {
  opacity: 0%;
}
</style>