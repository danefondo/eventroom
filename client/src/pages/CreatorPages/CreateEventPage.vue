<template>
  <div v-if="user" class="event-creator">
    <div class="event-creator-inputs">
      <p class="title">Create event</p>
      <div class="input-container">
        <div class="input-title">Event name</div>
        <input
          class="event-creator-input"
          v-model="eventName"
          placeholder="What will your event be called?"
          max-length="50"
        />
      </div>
      <div class="input-container">
        <div class="input-title">Event description</div>
        <ckeditor
          class="unreset event-creator-input ck-creator-input"
          :editor="editor"
          v-model="eventDescription"
          :config="editorConfig"
        ></ckeditor>
      </div>
      <div
        class="button"
        @click="createEvent"
        :disabled="creatingEvent"
      >{{ creatingEvent === true ? "Creating event..." : "Create event" }}</div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';

import axios from "axios";
import DecoupledEditor from "@ckeditor/ckeditor5-build-decoupled-document";

export default {
  name: "CreateEventPage",
  data() {
    return {
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
  computed: {
    ...mapState({
      user: state => state.user,
      isAuthenticated: state => state.authenticationStatus,
      isVerified: state => state.verificationStatus,
    })
  },
  mounted() {
    console.log("@ce: ", this.$store.state.user);
    console.log("@ce: ", this.$store.state.authenticationStatus);
    console.log("@ce: ", this.$store.state.verificationStatus);
  },
  methods: {
    async createEvent() {
      try {
        this.creatingEvent = true;

        let eventData = {
          name: this.eventName,
          description: this.eventDescription,
          dateCreated: new Date(),
          userId: this.user._id
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

<style scoped>
.title {
  font-size: 47px;
  margin-bottom: 20px;
}
.event-creator {
  display: flex;
  flex-direction: column;
  /* justify-content: center; */
  align-items: center;
  text-align: center;
  height: 100%;
}
.event-creator-inputs {
  margin-top: 104px;
  width: 275px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.event-creator-input {
  outline: none;
  padding: 10px;
  margin: 0 auto;
  margin-bottom: 15px;
  border: 1px solid #ddd;
  border-radius: 3px;
  font-size: 16px;
  min-width: 275px;
  max-width: 275px;
}
.event-creator-input:focus {
  border: 1px solid #493eff;
}

.input-title {
  text-align: left;
  margin-bottom: 7px;
}

.ck-creator-input {
  padding-top: 0px !important;
}

.ck-creator-input:focus {
  border: 1px solid #493eff !important;
}

</style>