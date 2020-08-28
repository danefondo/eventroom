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
      isMyStream: true,
    };
    this.$emit("emit_participant", participant);

    let publisherOptions = {
      insertMode: "appendChild",
      width: "100%",
      height: "100%",
      showControls: false,
    };
    //- Here I will need Correct REF, which is participant.objectId, allowing finding the new object; after this I can append to the right place

    // let containerBox = document.getElementById(uniquePublisherId);

    // console.log("cont", containerBox);
    var publisher = OT.initPublisher(
      document.getElementById(uniquePublisherId),
      publisherOptions,
      this.handleCallback
    );
    // var publisher = OT.initPublisher(
    //   this.$refs.publisher,
    //   publisherOptions,
    //   this.handleCallback
    // );

    this.session.connect(this.token, (err) => {
      if (err) {
        errorHandler(err);
      } else {
        this.session.publish(publisher, this.handleCallback);
        // let leId = JSON.parse(JSON.stringify(publisher.streamId));
        let streamId = publisher.streamId;
        console.log("streamid", streamId);
        let elementId = publisher.id;
        let newDetails = {
          streamId,
          elementId,
          objectRefId: uniquePublisherId,
        };
        this.$emit("emit_stream_details", newDetails);
      }
    });

    this.session.on("streamCreated", (event) => {
      const subscriber = this.session.subscribe(
        event.stream,
        this.$refs.subscriber,
        {
          insertMode: "append",
          width: "100%",
          height: "100%",
        },
        this.handleCallback
      );
      console.log("subscriber joined", subscriber);
    });

    this.session.on("streamDestroyed", (event) => {
      console.log("stream destroyed");
      const idx = this.streams.indexOf(event.stream);
      if (idx > -1) {
        this.streams.splice(idx, 1);
      }
    });
  },
  methods: {
    errorHandler,
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
      // when this is run, get correct video box
      // remove its current location
      // add to spotlight default
      // when spotlight changes, update database
      // next time, when code is run
    },
    initRemoveSpotlight() {},
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