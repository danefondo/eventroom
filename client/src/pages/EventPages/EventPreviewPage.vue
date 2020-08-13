<template>
  <div class="event-preview-area">
    <div>siin on kohal</div>
    <div v-if="event" class="event-name">{{ event.name }}</div>
    <div v-if="event" v-html="event.description" class="event-description"></div>
  </div>
</template>

<script>
import axios from "axios";
import auth from "../../config/auth";

export default {
  name: "EventPreviewPage",
  data() {
    return {
      user: {},
      event: {},
      isAuthenticated: false,
      eventName: "",
      eventDescription: "",
      eventNotFound: false,
    };
  },
  mounted() {
    if (auth.isAuthenticated()) {
      this.user = auth.isAuthenticated();
      this.isAuthenticated = true;
    }
    this.getEvent();
  },
  methods: {
    async getEvent() {
      try {
        console.log("event", `/api/events/getEvent/${this.$route.params.id}`)

        const {data} = await axios.get(
          `/api/events/getEvent/${this.$route.params.id}`
        );
        let data2 = axios.get(`/api/events/getEvent/${this.$route.params.id}`)
          .then(function(response) {
            console.log("RESPONSE:: ", response)
          })

        console.log(data2)
        let self = this
        this.eventNotFound = false;
        this.$set(self, 'event', data.event)
        console.log("test", data);
        console.log("test2", data.event)
        console.log("test3", typeof(data))
      } catch (error) {
        console.log("event", error);
        this.eventNotFound = true;
      }
    },
  },
};
</script>