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

        const {data} = await axios.get(
          `/api/events/getEvent/${this.$route.params.id}`
        );
        this.eventNotFound = false;
        this.$set(this, 'event', data.event)
      } catch (error) {
        console.log("event", error);
        this.eventNotFound = true;
      }
    },
  },
};
</script>