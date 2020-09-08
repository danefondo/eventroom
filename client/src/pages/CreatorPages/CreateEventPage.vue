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
      <div class="input-container">
        <div class="input-title">Event date</div>
        <div class="date_picker date_picker_special">
          <datepicker v-model="date" placeholder="Pick a date" name="date"></datepicker>
          <button class="date_picker_button">
            <i class="fa fa-calendar"></i>
          </button>
        </div>
        <div class="input-container">
          <div class="input-title">Event time</div>
          <div class="time_picker">
            <input
              v-model="time"
              class="timepicker timepicker_special"
              name="time"
              type="time"
              placeholder="Choose a time"
            />
            <button class="date_picker_button">
              <i class="fa fa-clock-o"></i>
            </button>
          </div>
        </div>
      </div>
      <div class="input-container">
        <div class="input-title">Allow room creation by participants</div>
        <label>
          <input
            class="allow-room-creation"
            type="radio"
            v-model="roomCreationAllowed"
            :value="1"
            checked
          />
          Yes
        </label>
        <label>
          <input
            class="allow-room-creation"
            type="radio"
            v-model="roomCreationAllowed"
            :value="0"
          />
          No
        </label>
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
import { mapState } from "vuex";

// import axios from "axios";
// import { authAxios } from "../../config/axios";
import { requestWithAuthentication } from "../../config/api";
import DecoupledEditor from "@ckeditor/ckeditor5-build-decoupled-document";
import Datepicker from "vuejs-datepicker";

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
      date: "",
      time: "",
      roomCreationAllowed: "1"
    };
  },
  components: {
    Datepicker,
  },
  computed: {
    ...mapState({
      user: state => state.auth.user,
      isAuthenticated: state => state.auth.authenticationStatus,
      isVerified: state => state.auth.verificationStatus,
    }),
  },
  methods: {
    async createEvent() {
      try {
        this.creatingEvent = true;
        // console.log("@createevent")
        if (
          !this.date ||
          !this.time ||
          !this.eventName ||
          !this.eventDescription
        ) {
          return alert("Fill in the deets!");
        }

        const dateTime = this.date;
        const time = this.time.split(":");
        dateTime.setHours(time[0]);
        dateTime.setMinutes(time[1]);

        let eventData = {
          name: this.eventName,
          description: this.eventDescription,
          dateCreated: new Date(),
          userId: this.user._id,
          scheduledStartTime: dateTime,
          roomCreationAllowed: this.roomCreationAllowed,
        };
        console.log("@createevent eventData", eventData);
        const response = await requestWithAuthentication("post", `api/events/createEvent`, eventData, true);
        console.log("@createevent response", response);
        this.$router.push(`/events/${response.data._id}`);
      } catch (error) {
        // TODO catch 401 error!
        console.log(error);
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
  width: 300px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.event-creator-input {
  outline: none;
  padding: 15px;
  margin: 0 auto;
  margin-bottom: 15px;
  border: 1px solid #eee;
  border-radius: 4px;
  font-size: 18px;
  min-width: 300px;
  max-width: 300px;
  box-sizing: border-box;
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
  border-radius: 4px !important;
}

.ck-creator-input:focus {
  border: 1px solid #493eff !important;
}
</style>