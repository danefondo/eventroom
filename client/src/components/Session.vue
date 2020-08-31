<template>
  <div class="session" @error="errorHandler">
    <div id="publisher" class="publisher" ref="publisher" />
    <div class="subscriber" ref="subscriber"></div>
  </div>
</template>

<script>
import OT from "@opentok/client";
// import axios from 'axios';

const errorHandler = (err) => {
  alert(err.message);
};

export default {
  name: "Session",
  data() {
    return {
      publisherElementId: "",
      streams: [],
      session: null,
      streamsWaitingForContainer: [],
    };
  },
  props: {
    apiKey: {
      type: String,
      required: true,
    },
    sessionId: {
      type: String,
      required: true,
    },
    token: {
      type: String,
      required: true,
    },
    participants: {
      type: Array,
      required: false,
    },
  },
  async mounted() {
    //- https://glitch.com/edit/#!/basic-video-chat
    this.session = OT.initSession(this.apiKey, this.sessionId);

    let uniquePublisherId = "box_" + this.generateUniqueId(16);
    //- Must check in case in database user is to be in spotlight by default
    //- Should this include UserId?
    let participant = {
      objectId: uniquePublisherId,
      type: "publisher",
      orderNumber: 0,
      spotlight: false,
    };
    this.$emit("emit_participant", participant);
    this.streamsWaitingForContainer.push(participant);

    this.session.on("streamCreated", (event) => {
      let uniqueSubscriberId = "box_" + this.generateUniqueId(16);
      let subscriber = {
        objectId: uniqueSubscriberId,
        type: "subscriber",
        orderNumber: 0,
        spotlight: false,
        event: event,
      };
      this.$emit("emit_participant", subscriber);
      this.streamsWaitingForContainer.push(subscriber);
    });

    this.session.on("streamDestroyed", (event) => {
      const idx = this.streams.indexOf(event.stream);
      if (idx > -1) {
        this.streams.splice(idx, 1);
      }
      // Emit to EventRoom.vue to remove stream from currentBoxObjects
      // so that the container with buttons is also removed
      let participantStreamId = event.stream.streamId;
      this.$emit("participantLeft", participantStreamId);
    });
  },
  methods: {
    errorHandler,
    appendSubscriber(assignedContainerId) {
      let subscriberOptions = {
        insertMode: "append",
        width: "100%",
        height: "100%",
        showControls: false,
      };
      let streamsOnHold = this.streamsWaitingForContainer;
      let subscriberObject = streamsOnHold.find(
        (stream) => stream.objectId === assignedContainerId
      );

      let event = subscriberObject.event;
      let refToContainer = document.getElementById(assignedContainerId);
      const subscriber = this.session.subscribe(
        event.stream,
        refToContainer,
        subscriberOptions,
        this.handleCallback
      );
      console.log("subscriber joined", subscriber);
      console.log("subscriber streamId", subscriber.streamId);
      console.log("subscriber id", subscriber.id);
      let streamId = subscriber.streamId;
      let elementId = subscriber.id;
      let newDetails = {
        streamId,
        elementId,
        objectRefId: assignedContainerId,
      };
      this.$emit("emit_stream_details", newDetails);
      this.initRemoveFinalizedContainer(assignedContainerId);
    },
    appendPublisher(assignedContainerId) {
      let publisherOptions = {
        insertMode: "append",
        width: "100%",
        height: "100%",
        showControls: false,
      };
      //- Here I will need Correct REF, which is participant.objectId, allowing finding the new object; after this I can append to the right place

      let refToContainer = document.getElementById(assignedContainerId);
      var publisher = OT.initPublisher(
        refToContainer,
        publisherOptions,
        this.handleCallback
      );

      this.session.connect(this.token, (err) => {
        if (err) {
          errorHandler(err);
        } else {
          this.session.publish(publisher, this.handleCallback);
          let streamId = publisher.streamId;
          let elementId = publisher.id;
          let newDetails = {
            streamId,
            elementId,
            objectRefId: assignedContainerId,
          };
          this.$emit("emit_stream_details", newDetails);
          this.initRemoveFinalizedContainer(assignedContainerId);
        }
      });
    },
    handleCallback(error) {
      if (error) {
        console.log("error: " + error.message);
      } else {
        console.log("callback success");
      }
    },
    generateUniqueId(length) {
      return parseInt(
        Math.ceil(Math.random() * Date.now())
          .toPrecision(length)
          .toString()
          .replace(".", "")
      );
    },
    initMakeSpotlight(videoElementId) {
      let spotlight = document.getElementById("spotlight");
      let defaultSlot = spotlight.querySelectorAll(".spotlight-default")[0];
      let videoFeed = document.getElementById(videoElementId);
      videoFeed.parentNode.removeChild(videoFeed);
      defaultSlot.appendChild(videoFeed);
    },
    initRemoveFinalizedContainer(containerObjectId) {
      //- Remove from Vuex store readyContainers
      this.$store.dispatch("removeFinalizedContainer", containerObjectId);

      //- Remove from Session data streamsWaitingForContainer
      let streamsOnHold = this.streamsWaitingForContainer;
      let index = streamsOnHold.findIndex(
        (stream) => stream.objectId === containerObjectId
      );
      streamsOnHold.splice(index, 1);
    },
  },
  watch: {
    "$store.state.containersReady": function (readyContainers) {
      // Check if readyContainers contains matching container
      let appendPublisher = this.appendPublisher;
      let appendSubscriber = this.appendSubscriber;
      this.streamsWaitingForContainer.forEach(function (streamOnHold) {
        let assignedContainerId = streamOnHold.objectId;
        let type = streamOnHold.type;
        //- Prevent infinite loop upon further changes
        //- Get correct container matched with stream
        if (readyContainers.some((c) => c.objectId === assignedContainerId)) {
          /* readyContainers contains matching container */
          if (type == "publisher") {
            appendPublisher(assignedContainerId);
          } else if (type == "subscriber") {
            appendSubscriber(assignedContainerId);
          }
        }
      });
    },
  },
};
</script>

<style>
.OT_subscriber {
  float: left;
}
.OT_publisher {
  float: left;
}
.session {
  display: flex;
  flex-direction: column;
  height: 100%;
}
.subscriber {
  width: 100%;
  height: 260px;
  min-width: 8em;
  min-height: 8em;
  align-self: flex-end;
  margin-bottom: 10px;
}

.publisher {
  width: 100%;
  height: 260px;
  min-width: 8em;
  min-height: 8em;
  align-self: flex-end;
  margin-bottom: 10px;
}
</style>