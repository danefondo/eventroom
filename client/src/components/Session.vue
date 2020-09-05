<template>
  <div class="session" @error="errorHandler">
    <div id="publisher" class="publisher" ref="publisher" />
    <div class="subscriber" ref="subscriber"></div>
  </div>
</template>

<script>
import OT from "@opentok/client";
// import axios from 'axios';

export default {
  name: "Session",
  data() {
    return {
      publisherElementId: "",
      publisher: null,
      initialPublisher: null,
      subscribers: [],
      session: null,
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
      republishInProcess: false,
    };

    // Set Publisher stream on hold
    this.$store.dispatch("session/setStreamOnHold", participant);

    // Emit data to set as Eventroom data without Vuex reactivity
    // that comes from dispatching to Vuex store
    this.$emit("participantData", JSON.parse(JSON.stringify(participant)));

    this.session.on("streamCreated", (event) => {
      let uniqueSubscriberId = "box_" + this.generateUniqueId(16);
      let subscriber = {
        objectId: uniqueSubscriberId,
        type: "subscriber",
        orderNumber: 0,
        spotlight: false,
        republishInProcess: false,
        event: event,
      };
      // Set Subscriber stream on hold
      this.$store.dispatch("session/setStreamOnHold", subscriber);
      this.$emit("participantData", JSON.parse(JSON.stringify(subscriber)));
    });

    this.session.on("streamDestroyed", (event) => {
      // event.preventDefault();

      console.log("@steamDestroyed", event);
      // const idx = this.streams.indexOf(event.stream);
      // if (idx > -1) {
      //   this.streams.splice(idx, 1);
      // }

      // Emit to EventRoom.vue to remove stream from currentBoxObjects
      // so that the container with buttons is also removed
      let participantStreamId = event.stream.streamId;
      this.$emit("participantLeft", participantStreamId);
    });
  },
  methods: {
    errorHandler(error) {
      if (error) {
        console.log("error: " + error.message);
      } else {
        console.log("callback success");
      }
    },
    createAndAppendSubscriber(assignedContainerId) {
      let subscriberOptions = {
        insertMode: "append",
        width: "100%",
        height: "100%",
        showControls: false,
      };
      let streamsOnHold = this.$store.state.session.streamsWaitingForContainer;
      let subscriberObject = streamsOnHold.find(
        (stream) => stream.objectId === assignedContainerId
      );

      // subscriberObject = JSON.parse(JSON.stringify(subscriberObject));
      let event = subscriberObject.event;
      let refToContainer = document.getElementById(assignedContainerId);
      let subscriber = this.session.subscribe(
        event.stream,
        refToContainer,
        subscriberOptions,
        this.handleCallback
      );
      this.subscribers.push(JSON.parse(JSON.stringify(subscriber)));
      console.log("subscriber joined", JSON.parse(JSON.stringify(subscriber)));
      console.log("subscriber streamId", subscriber.streamId);
      console.log("subscriber id", subscriber.id);
      let streamId = subscriber.streamId;
      let elementId = subscriber.id;
      let newDetails = {
        streamId,
        elementId,
        objectRefId: assignedContainerId,
      };
      this.$emit("updatedParticipantData", newDetails);
      this.initRemoveFinalizedContainer(assignedContainerId);
    },
    createAndAppendPublisher(assignedContainerId) {
      let publisherOptions = {
        insertMode: "append",
        width: "100%",
        height: "100%",
        showControls: false,
      };

      let refToContainer = document.getElementById(assignedContainerId);
      var publisher = OT.initPublisher(
        refToContainer,
        publisherOptions,
        this.handleCallback
      );

      this.initialPublisher = publisher;

      this.session.connect(this.token, (err) => {
        if (err) {
          this.errorHandler(err);
        } else {
          this.session.publish(publisher, this.handleCallback);
          this.publisher = JSON.parse(JSON.stringify(publisher));
          let streamId = publisher.streamId;
          let elementId = publisher.id;
          let newDetails = {
            streamId,
            elementId,
            objectRefId: assignedContainerId,
          };
          this.$emit("updatedParticipantData", newDetails);
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
      //- Remove from Vuex store readyContainers & streamWaitingForContainer
      this.$store.dispatch(
        "session/removeFinalizedContainer",
        containerObjectId
      );
      this.$store.dispatch("session/removeStreamOnHold", containerObjectId);
    },
    stopPublishingStream() {
      console.log("about to stop publishing");
      let publisher = this.initialPublisher;
      this.session.unpublish(publisher);
      console.log("stopped publishing");
    },
    stopSubscribingToStream(elementId) {
      let subscriber = this.subscribers.find(
        (stream) => stream.elementId === elementId
      );
      this.session.unsubscribe(subscriber);
      console.log("unsubscribed");
    },
    startPublishingStream(containerData) {
      let publisherOptions = {
        insertMode: "append",
        width: "100%",
        height: "100%",
        showControls: false,
      };
      console.log("containerData", JSON.parse(JSON.stringify(containerData)));
      let refToContainer = document.getElementById(containerData.objectId);
      // let refToContainer = document.getElementById("publisher");
      console.log("container", refToContainer);
      let publisher = OT.initPublisher(
        refToContainer,
        publisherOptions,
        this.handleCallback
      );
      console.log("publisher1", JSON.parse(JSON.stringify(publisher)));
      this.session.publish(publisher, this.handleCallback);
      console.log("publisher2", JSON.parse(JSON.stringify(publisher)));
      let streamId = publisher.streamId;
      let elementId = publisher.id;
      let newDetails = {
        streamId,
        elementId,
        objectRefId: containerData.objectId,
      };
      this.$emit("updatedParticipantData", newDetails);
    },
    startSubscribingToStream() {},
    setStreamToSpotlight(streamData) {
      let containerData = streamData;
      if (streamData.type == "publisher") {
        this.startPublishingStream(containerData);
      } else if (streamData.type == "subscriber") {
        this.startSubscribingToStream(containerData);
      }
    },
  },
  watch: {
    "$store.state.session.containersReady": function (readyContainers) {
      // Check if readyContainers contains matching container
      let createAndAppendPublisher = this.createAndAppendPublisher;
      let createAndAppendSubscriber = this.createAndAppendSubscriber;
      let streamsOnHold = this.$store.state.session.streamsWaitingForContainer;
      streamsOnHold.forEach(function (streamObject) {
        let assignedContainerId = streamObject.objectId;
        // Remove Vuex reactivity
        assignedContainerId = JSON.parse(JSON.stringify(assignedContainerId));
        let type = streamObject.type;
        //- Prevent infinite loop upon further changes
        //- Get correct container matched with stream
        if (readyContainers.some((c) => c.objectId === assignedContainerId)) {
          /* readyContainers contains matching container */
          if (type == "publisher") {
            createAndAppendPublisher(assignedContainerId);
          } else if (type == "subscriber") {
            createAndAppendSubscriber(assignedContainerId);
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