<template>
  <div v-if="user" class="input-area">
    <div class="input-container">
      <div class="input-title">Event name</div>
      <input
        class="input"
        v-model="eventName"
        placeholder="What will your event be called?"
        max-length="50"
      />
    </div>
    <div class="input-container">
      <div class="input-title">Event description</div>
      <ckeditor
        class="unreset input-ck"
        :editor="editor"
        v-model="eventDescription"
        :config="editorConfig"
      ></ckeditor>
    </div>
    <div
      class="button create"
      @click="updateEvent"
      :disabled="updatingEvent"
    >{{ updateEvent === true ? "Creating event..." : "Create event" }}</div>
    <div class="button delete">
      <p>Delete event</p>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import auth from "../../config/auth";
import DecoupledEditor from "@ckeditor/ckeditor5-build-decoupled-document";

export default {
  name: "CreateEventPage",
  data() {
    return {
      user: {},
      event: {},
      isAuthenticated: false,
      editor: DecoupledEditor,
      editorConfig: {
        placeholder: this.$t("newworkout.desc-holder"),
        removePlugins: [
          "FontSize",
          "MediaEmbed",
          "insertTable",
          "Heading",
          "alignment",
          "Undo",
          "Redo",
          "FontFamily",
          "highlight",
        ],
        toolbar: [
          "bold",
          "italic",
          "|",
          "bulletedList",
          "numberedList",
          "Link",
          "blockQuote",
        ],
      },
      eventName: "",
      eventDescription: "",
      updatingEvent: false,
      eventNotFound: false,
    };
  },
  mounted() {
    this.getEvent();
    if (auth.isAuthenticated()) {
      this.user = auth.isAuthenticated();
      this.isAuthenticated = true;
    }
  },
  methods: {
    async getEvent() {
     try {
        const { data } = await axios.get(`/api/events/${this.$route.params.id}`);
        this.eventNotFound = false;
        this.event = data.event;
      } catch (error) {
        this.eventNotFound = true;
      }
    },
    async updateEvent() {
      try {
        this.updatingEvent = true;

        let eventData = {
          name: this.eventName,
          description: this.eventDescription,
          eventId: this.event._id
        };
        
        const result = await axios.post(`api/events/findAndUpdateEvent`, eventData);
        this.$router.push(`/events/${result.data.event._id}`);
      } catch (error) {
        window.scrollTo(0, 0);
        this.error = true;
        this.updatingEvent = false;
      }
    },
  },
};
</script>