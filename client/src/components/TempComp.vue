<template>
  <div>
    <br/>
    <br/>
    ******************************************
    <br/>
    Here I test instant matching.
    <br/>
    <button @click="requestMatch">Request match</button>
    <button @click="promiseStatus">Promise status</button>
    <button @click="disconnect">Disconnect</button>
    <button @click="socketInfo">Socket info</button>
    <button @click="increaseID">{{userData.ID}}</button>
    <button @click="cancel">Cancel</button>
  </div>
</template>

<script>
import io from 'socket.io-client';
import rimHandler from "../socket/InstantMatch";

const namespace = "localhost:3000/instant_match";
const socket = io(namespace);
export default {
  name: "TempComp",
  data () {
    return {
      userData: {
        ID: 0,
        data: {
          best: "definitely",
          iq: "genius"
        },
        preferences: {
          money: "yes",
          webdev: "no",
        }
      },
      querablePromise: "",
      error: "",
      value: ""
    }
  },
  methods: {
    requestMatch() {
      if (socket.disconnected) {
        socket.open();
      }
      const promise = rimHandler.requestInstantMatch(socket, this.userData);
      this.querablePromise = rimHandler.makeRequestQuerable(promise);
      this.querablePromise.then(res => {
        this.value = res;
        socket.close();
      }).catch(error => this.error = error);
    },
    promiseStatus() {
      if (this.querablePromise == "") {
        console.log("none");
        return;
      }
      console.log("pending? ", this.querablePromise.isPending());
      console.log("resolved? ", this.querablePromise.isResolved());
      console.log("rejected? ", this.querablePromise.isRejected());
      console.log("the whole object: ", this.querablePromise);
      console.log("other stuff: ", this.error, " : ", this.value);
    },
    disconnect() {
      socket.emit("USER_DISCONNECT", this.userData.ID);
      console.log("disconnecting...");
      socket.close();
    },
    socketInfo() {
      console.log("printing socket info....");
      console.log("listeners any: ", socket.listeners());
    },
    increaseID() {
      this.userData.ID += 1;
    }
  }
}
</script>