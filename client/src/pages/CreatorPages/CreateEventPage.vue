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
      class="button-create"
      @click="createEvent"
      :disabled="creatingEvent"
    >{{ creatingEvent === true ? "Creating event..." : "Create event" }}</div>
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
      isAuthenticated: false,
      isVerified: false,
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
      creatingEvent: false,
    };
  },
  mounted() {
    let authenticationResult = auth.isAuthenticated();
    if (authenticationResult) {
      this.user = authenticationResult;
      this.isVerified = authenticationResult.isVerified;
      this.isAuthenticated = true;
    }
  },
  methods: {
    async createEvent() {
      try {
        this.creatingEvent = true;

        let eventData = {
          name: this.eventName,
          description: this.eventDescription,
          dateCreated: new Date(),
        };

        const result = await axios.post(`api/events/createEvent`, eventData);
        const test = await axios.get(`api/events/testing`);
        console.log(test);
        this.$router.push(`/events/${result.data.event._id}`);
      } catch (error) {
        window.scrollTo(0, 0);
        this.error = true;
        this.creatingEvent = false;
      }
    },
  },
};
</script>