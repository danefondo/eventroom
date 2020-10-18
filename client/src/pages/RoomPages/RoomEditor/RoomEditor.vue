<template>
  <div class="myrooms">
    <div v-if="eventroom && eventroom.eventroomName" class="profile">
      <router-link to="/account/rooms" class="goBack">Go back</router-link>
      <div class="room-title">{{ eventroom.eventroomName }}</div>
      <!-- <div class="myrooms-sub">View and manage all of your rooms</div> -->
      <div class="profileImage"></div>
      <div class="link-container">
        <IconBase
          class="link-icon"
          icon-name="link"
          iconColor="black"
          viewBox="0 0 512 512"
          width="16"
          height="16"
          ><IconLink
        /></IconBase>
        <router-link :to="`/${eventroom.eventroomName}`" class="room-url"
          >eventroom.to/{{ eventroom.eventroomName }}</router-link
        >
      </div>
      <div class="links">
        <router-link :to="`/${eventroom.eventroomName}`" class="viewProfile"
          >Go to room</router-link
        >
        <div class="newRoom">Schedule meeting in room</div>
      </div>
      <!-- <div class="profileName">{{ getName }}</div> -->
    </div>
    <div class="edit-section">
      <div class="edit-title">Add a description</div>
      <div class="profile-row bio-row">
        <ckeditor
          class="unreset event-creator-input ck-creator-input"
          :editor="editor"
          v-model="bio"
          :config="editorConfig"
        ></ckeditor>
      </div>
    </div>
    <div class="edit-section">
      <div class="edit-title">Eventroom privacy</div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import { mapState } from "vuex";
import IconBase from "../../../components/IconBase";
import IconLink from "../../../components/SVG/IconLink";

import DecoupledEditor from "@ckeditor/ckeditor5-build-decoupled-document";
// import { requestWithAuthentication } from "../../config/api";

export default {
  name: "RoomEditor",
  data() {
    return {
      gettingRoom: false,
      gettingRoomError: false,
      bio: "",
      editor: DecoupledEditor,
      editorConfig: {
        placeholder: "Tell the world your crazy, your weird!",
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
    };
  },
  components: {
    IconBase,
    IconLink,
  },
  computed: {
    ...mapState({
      user: (state) => state.auth.user,
      isAuthenticated: (state) => state.auth.authenticationStatus,
      eventroom: (state) => state.eventroom.eventroomData,
    }),
  },
  mounted() {
    this.getRoom();
  },
  methods: {
    async getRoom() {
      try {
        if (!this.user || !this.user._id) {
          return (window.location.href = "/");
        }

        this.gettingRoom = true;

        const axiosGetQuery = `/api/eventroom/${this.$route.params.eventroomName}`;
        const result = await axios.get(axiosGetQuery);

        let eventroomData = result.data.response.eventroom[0];
        if (!eventroomData) throw new Error("Failed to fetch user room.");

        this.$store.dispatch(
          "eventroom/setInitialEventroomData",
          eventroomData
        );
      } catch (error) {
        console.log("error: ", error);
        this.gettingRoom = false;
        this.gettingRoomError = true;
      }
    },
  },
};
</script>

<style scoped>
.profile {
  /* width: 800px; */
  width: 725px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  /* padding: 20px; */
  padding: 65px 20px 25px 20px;
  /* background-color: #f3f4f7ad; */
  /* background-color: #f3f4f76b; */
  background-color: #f7f8f9;
  border-radius: 4px;
  margin-bottom: 10px;
  border-radius: 35px;
  padding-bottom: 30px;

  transform: scale(1.015);
}

.edit-section {
  width: 725px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px 20px 25px 20px;
  background-color: #f7f8f9;
  border-radius: 4px;
  margin-bottom: 10px;
  margin-top: 25px;
  border-radius: 35px;
  padding-bottom: 30px;
}

.profileName {
  font-size: 25px;
  margin-top: 10px;
}

.links {
  display: flex;
  flex-direction: row;
  margin-top: 10px;
}

.viewProfile,
.newRoom,
.goBack {
  /* font-size: 19px; */
  font-size: 20px;
  margin-top: 15px;
  margin-left: 5px;
  margin-right: 5px;
  letter-spacing: 0.5px;
  /* background-color: #e4e8ec; */
  /* background-color: #dcdfe2; */
  /* background-color: #dcdfe299;
  background-color: #f3f3f3;
  background-color: #f1f1f1; */
  background-color: #e9eced;
  /* padding: 5px 28px; */
  padding: 6px 14px;
  font-weight: 700;
  border-radius: 360px;
  cursor: pointer;
  transition: 0.1s ease;
}

.goBack {
  position: absolute;
  left: 20px;
  top: 5px;
  color: #aaadaf;
  font-size: 17px;
  background-color: transparent;
  display: block;
}

.goBack:hover {
  color: #b7bcc194;
}

.viewProfile:hover,
.newRoom:hover {
  background-color: #b7bcc194;
}

.viewProfile {
  color: #222;
}

.newRoom {
  color: #5600ff;
}

/* .newRoom {
  background-color: #000000;
  color: white;
}

.newRoom:hover {
  background-color: #333;
} */

.room-title {
  /* font-size: 45px; */
  font-size: 55px;
  font-weight: 600;
  text-transform: capitalize;
  text-align: center;
  max-width: 600px;
  overflow: scroll;
}

.edit-title {
  font-size: 40px;
  font-weight: 600;
  text-align: left;
  margin-right: auto;
  margin-left: 25px;
}

.myrooms-sub {
  margin-top: 5px;
}

.rooms {
  width: 800px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  /* background-color: #f3f4f7eb; */
  border-radius: 4px;
}

.link-container {
  display: flex;
  flex-direction: row;
  align-items: center;
  margin-top: 8px;
}

.link-icon {
  margin-right: 4px;
}

.room-url {
  margin-top: 5px;
  cursor: pointer;
  display: block;
  color: #2f2f31;
  font-weight: 600;
  font-size: 18px;
}

.room-url:hover {
  text-decoration: underline;
}

.profile-row {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
}

.bio-row {
  padding-top: 30px;
}

.ck-creator-input {
  padding-top: 0px !important;
  border-radius: 3px !important;
  font-size: 23px !important;
  border: 1px solid #edf1f5 !important;
  width: 650px !important;
  box-sizing: border-box;
  height: 175px !important;
  outline: none !important;
  box-shadow: none !important;
  transition: 0.2s ease !important;
  background-color: white !important;
  color: #222 !important;
  line-height: 27px !important;
}

.ck-creator-input:focus {
  border-color: #493eff !important;
  border-color: #493eff4d !important;
  border-color: #c9cdd0c7 !important;
}

.ck-creator-input:hover {
  border-color: #c9cdd0c7 !important;
}
</style>