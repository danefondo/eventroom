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
      subscribers: [],
      session: null,
      initialPublisher: null,
      initialSubscribers: [],
      initialSubscribersData: [],
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
    // this.sockets.listener.subscribe("updateStuff", (data) => {
		// 	console.log("data", data);
		// 	this.updateEveryone();
		// });
    //- https://glitch.com/edit/#!/basic-video-chat
    this.session = OT.initSession(this.apiKey, this.sessionId);
    console.log("@2 @Session.vue, Session initialized");

    let uniquePublisherId = "box_" + this.generateUniqueId(16);
    //- Must check in case in database user is to be in spotlight by default
    //- Should this include UserId?

    /** Some Vonage features below can almost definitely be reused */

    /**
     * Preparing container data;
     * This is also where data needs to be pulled live from the database
     * So that the objectId, spotlight and orderNumber would be correct
     *
     * 'spotlight: Boolean' later determines whether any given container is shown in a regular conatiners area or a spotlight area
     * 'orderNumber: Number' later determines the position of a stream container, which allows for initial pre-sorting before displaying
     * 'republishInProcess: Boolean' later helps ContainerBox.vue & SpotlightBox.vue determine
     * whether a new box is created the first time, or whether a change of spotlight or position
     * is happening
     */
    let participant = {
      objectId: uniquePublisherId,
      type: "publisher",
      orderNumber: 0,
      spotlight: false,
      republishInProcess: false,
    };

    console.log(
      "@3 @Session.vue, Publisher Participant container object prepared"
    );

    /**
     * Set Publisher stream creation on hold
     * Purpose is to wait for container to be created, ready, with data loaded
     * Else Vonage will not know where to append the stream to
     */
    this.$store.dispatch("session/setStreamOnHold", participant);
    console.log(
      "@4 @Session.vue, Publisher participant container object dispatched to Vuex store to set on hold"
    );

    /**
     * Emit data to set as Eventroom currentBoxObjects data without Vuex reactivity
     * that comes from dispatching to Vuex store
     *
     * Emit must happen later than dispatch (or when container will be ready), there won't be a matching stream on hold for creation in Session.vue
     */
    console.log(
      "@5 @Session.vue, About to emit publisher participant container object to EventRoomPage.vue to add object to currentBoxContainers"
    );
    this.$emit("participantData", JSON.parse(JSON.stringify(participant)));

    /**
     * 'streamCreated' event will detect any newcomers to the session
     * The event will contain the important data about the subscriber
     */
    this.session.on("streamCreated", (event) => {
      console.log("@Subscriber @1 @Session.vue, streamCreated");
      let uniqueSubscriberId = "box_" + this.generateUniqueId(16);
      let subscriber = {
        objectId: uniqueSubscriberId,
        type: "subscriber",
        orderNumber: 0,
        spotlight: false,
        republishInProcess: false,
        event: event,
      };
      console.log(
        "@Subscriber @2 @Session.vue, Subscriber container object prepared"
      );
      // Set Subscriber stream on hold
      this.$store.dispatch("session/setStreamOnHold", subscriber);
      console.log(
        "@Subscriber @3 @Session.vue, Subscriber participant container object dispatched to Vuex store to set on hold"
      );
      console.log(
        "@Subscriber @4 @Session.vue, About to emit subscriber participant container object to EventRoomPage.vue to add object to currentBoxContainers"
      );
      this.$emit("participantData", JSON.parse(JSON.stringify(subscriber)));
      let initialSubscriberData = {
        objectId: subscriber.objectId,
        event: subscriber.event,
      };
      // Store subscriber event to later find through objectId;
      this.initialSubscribersData.push(initialSubscriberData);
      console.log(
        "@Subscriber @6 @Session.vue, Emitted subscriber participant container object to EventRoomPage.vue to add object to currentBoxContainers"
      );
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

    //- https://tokbox.com/developer/guides/signaling/js/
    this.session.on("signal", function (event) {
      console.log("Signal sent from connection " + event.from.id);
      // Process the event.data property, if there is any data.
    });
  },
  methods: {
    disconnect() {
      this.session.disconnect();
    },
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

      // This is for identifying correct stream to stop subscribing to
      this.initialSubscribers.push(subscriber);
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
      console.log("@5 @Session.vue, About to stop publishing");
      let publisher = this.initialPublisher;
      this.session.unpublish(publisher);
      console.log("@6 @Session.vue, Stopped publishing.");
    },
    stopSubscribingToStream(elementId) {
      console.log(
        "@5 @Session.vue, About to find correct subscriber by passed elementId"
      );
      let subscriber = this.initialSubscribers.find(
        (stream) => stream.id === elementId
      );
      console.log("@6 @Session.vue, About to stop subscribing to subscriber");
      this.session.unsubscribe(subscriber);
      console.log("@7 @Session.vue, Stopped subscribing to subscriber.");
      let index = this.initialSubscribers.findIndex(
        (box) => box.id === elementId
      );
      this.initialSubscribers.splice(index, 1);
    },
    startPublishingStream(containerData) {
      let publisherOptions = {
        insertMode: "append",
        width: "100%",
        height: "100%",
        showControls: false,
      };

      let refToContainer = document.getElementById(containerData.objectId);
      let publisher = OT.initPublisher(
        refToContainer,
        publisherOptions,
        this.handleCallback
      );
      console.log("test@");
      this.initialPublisher = publisher;

      this.session.publish(publisher, this.handleCallback);
      let streamId = publisher.streamId;
      let elementId = publisher.id;
      let newDetails = {
        streamId,
        elementId,
        objectRefId: containerData.objectId,
      };
      this.$emit("updatedParticipantData", newDetails);
    },
    startSubscribingToStream(containerData) {
      let subscriberOptions = {
        insertMode: "append",
        width: "100%",
        height: "100%",
        showControls: false,
      };

      let subscriberData = this.initialSubscribersData.find(
        (stream) => stream.objectId === containerData.objectId
      );

      let event = subscriberData.event;
      let refToContainer = document.getElementById(containerData.objectId);
      let subscriber = this.session.subscribe(
        event.stream,
        refToContainer,
        subscriberOptions,
        this.handleCallback
      );

      this.initialSubscribers.push(subscriber);
      let streamId = subscriber.streamId;
      let elementId = subscriber.id;
      let newDetails = {
        streamId,
        elementId,
        objectRefId: containerData.objectId,
      };
      this.$emit("updatedParticipantData", newDetails);
    },
    setStreamToSpotlight(streamData) {
      let containerData = streamData;
      if (streamData.type == "publisher") {
        console.log("@12/@13 @Session.vue, About to publish stream");
        this.startPublishingStream(containerData);
      } else if (streamData.type == "subscriber") {
        console.log("@12/@13 @Session.vue, About to subscribe stream");
        this.startSubscribingToStream(containerData);
      }
    },
    updateConnectedClientsData() {
      /**
       * Send relevant data to other clients, such as during spotlight change
       * Either update entire data object due to few participants in room for safety
       * Or send directly to database with
       */
      this.session.signal(
        {
          data: "hello",
        },
        function (error) {
          if (error) {
            console.log("Sending updated data to connected clients failed.");
          } else {
            console.log("Updated data sent to connected clients.");
          }
        }
      );
    },
    updateConnectedClientsDataWithSocketIO() {
      /**
       * Alternative to Vonage's signal
       * This allows for communicating with our server
       * You could emit data to the server, the server updates database
       * And when that is that, the server also uses SocketIO to 
       * push emit signal to all connected clients
       * which are listened to
       */
      let roomData;
      this.$socket.emit("emitTag", roomData);
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
  height: 250px;
  border-radius: 10px;
}
.OT_publisher {
  float: left;
  height: 250px;
  border-radius: 10px;
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