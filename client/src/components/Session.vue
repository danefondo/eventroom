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
  },
  async mounted() {
    //- https://glitch.com/edit/#!/basic-video-chat
    this.session = OT.initSession(this.apiKey, this.sessionId);

    let publisherOptions = {
      insertMode: "append",
      width: "100%",
      height: "100%",
    };

    var publisher = OT.initPublisher(
      this.$refs.publisher,
      publisherOptions,
      this.handleCallback
    );
    this.session.connect(this.token, (err) => {
      if (err) {
        errorHandler(err);
      } else {
        this.session.publish(publisher, this.handleCallback);
      }
    });

    this.session.on("streamCreated", (event) => {
      this.session.subscribe(
        event.stream,
        this.$refs.subscriber,
        {
          insertMode: "append",
          width: "100%",
          height: "100%",
        },
        this.handleCallback
      );
    });
    this.session.on("streamDestroyed", (event) => {
      console.log("stream destroyed");
      const idx = this.streams.indexOf(event.stream);
      if (idx > -1) {
        this.streams.splice(idx, 1);
      }
    });
  },
  data: () => ({
    streams: [],
    session: null,
  }),
  methods: {
    errorHandler,
    handleCallback(error) {
      if (error) {
        console.log("error: " + error.message);
      } else {
        console.log("callback success");
      }
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
  flex-direction: row;
  flex-wrap: wrap;
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