<template>
  <div class="myrooms">
    <div v-if="eventroom && eventroom.eventroomName" class="profile">
      <router-link to="/account/rooms" class="goBack">Go back</router-link>
      <input spellcheck="false" class="room-title" v-model="eventroomName" />
      <!-- <div class="myrooms-sub">View and manage all of your rooms</div> -->
      <div class="profileImage"></div>
      <div class="link-container">
        <IconBase
          class="link-icon"
          icon-name="link"
          iconColor="#555561"
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
      <div class="toggle-setting">
        <div class="setting">
          <div class="setting-name">Require password?</div>
          <Toggle @click.native="togglePassword" :boolean="passwordEnabled" />
        </div>
        <div class="setting pass-setting">
          <input
            v-if="passwordEnabled"
            class="setting-input"
            type="password"
            placeholder="Your room password"
            v-model="roomPassword"
          />
          <div @click="saveRoomPass" v-if="passwordEnabled" class="save-pass">
            {{ savingPassword ? "Saving" : "Save" }}
          </div>
          <div v-if="passwordEnabled" class="copy-pass" @click="copyRoomPass">
            {{ roomPassCopiedState ? "Copied!" : "Copy" }}
          </div>
        </div>
        <div class="setting pass-setting pass-notifiers">
          <div v-if="passwordUpdatedSuccess" class="pass-update-success">
            Room password successfully updated!
          </div>
          <div v-if="passwordUpdateFail" class="pass-update-fail">
            Failed to update room password! Try again or contact support!
          </div>
          <div v-if="passwordWarning" class="pass-update-warning">
            Warning! No password means any password will work!
          </div>
        </div>
      </div>
      <div class="toggle-setting">
        <div class="setting">
          <div class="setting-name">Require knocking to enter?</div>
          <Toggle @click.native="toggleKnocking" :boolean="knockingEnabled" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import { mapState } from "vuex";
import IconBase from "../../../components/IconBase";
import IconLink from "../../../components/SVG/IconLink";
import Toggle from "./Toggle";

import DecoupledEditor from "@ckeditor/ckeditor5-build-decoupled-document";
import { requestWithAuthentication } from "../../../config/api";

export default {
  name: "RoomEditor",
  data() {
    return {
      eventroomName: "",
      awaitingTyping: false,
      nameExists: false,
      gettingRoom: false,
      gettingRoomError: false,
      bio: "",
      roomPassCopiedState: false,
      passwordEnabled: false,
      roomPassword: "",
      savingPassword: false,
      passwordUpdatedSuccess: false,
      passwordUpdateFail: false,
      passwordWarning: false,
      knockingEnabled: false,
      editor: DecoupledEditor,
      editorConfig: {
        placeholder: "What's the purpose of your room?",
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
    Toggle,
  },
  computed: {
    ...mapState({
      user: (state) => state.auth.user,
      isAuthenticated: (state) => state.auth.authenticationStatus,
      eventroom: (state) => state.eventroom.eventroomData,
    }),
  },
  async mounted() {
    await this.getRoom();

    this.eventroomName = this.eventroom.eventroomName;

    this.sockets.subscribe("eventroomNameChange", (data) => {
      console.log("eventroomNameChange", data);
      this.eventroomName = data;
      this.$store.dispatch("eventroom/updateEventroomName", data);
      this.changeURL();
    });
  },
  methods: {
    togglePassword() {
      if (this.passwordEnabled == true) {
        this.disableRoomPass();
      } else {
        this.passwordEnabled = true;
      }
    },
    toggleKnocking() {
      // if (this.knockingEnabled) {
      //   this.disableRoomPass();
      // } else {
      this.knockingEnabled = !this.knockingEnabled;
      // }
    },
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

        console.log("eventroomDATA", eventroomData);
        if (eventroomData.roomPasswordEnabled && eventroomData.roomPassword) {
          this.passwordEnabled = eventroomData.roomPasswordEnabled;
          this.roomPassword = eventroomData.roomPassword;
        }

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
    async disableRoomPass() {
      try {
        this.passwordUpdateFail = false;
        this.passwordUpdatedSuccess = false;
        this.passwordWarning = false;
        this.savingPassword = false;
        this.roomPassword = "";
        this.passwordEnabled = false;

        if (!this.eventroom || !this.eventroom.eventroomId) {
          return alert(
            "Eventroom data missing! Try refreshing to see if you're still logged in!"
          );
        }

        const response = await requestWithAuthentication(
          "post",
          `/api/eventroom/disableRoomPassword`,
          {
            eventroomId: this.eventroom.eventroomId,
            userId: this.user._id,
          }
        );

        if (response.data.success) {
          this.roomPassword = "";
          this.passwordEnabled = false;
        }
      } catch (error) {
        console.log("error: ", error);
        this.passwordUpdateFail = true;
        this.passwordUpdatedSuccess = false;
        this.savingPassword = false;
        this.passwordWarning = false;
      }
    },
    async saveRoomPass() {
      try {
        this.passwordUpdateFail = false;
        this.passwordUpdatedSuccess = false;
        if (!this.roomPassword) {
          this.passwordWarning = true;
        } else {
          this.passwordWarning = false;
        }

        if (!this.eventroom || !this.eventroom.eventroomId) {
          return alert(
            "Eventroom data missing! Try refreshing to see if you're still logged in!"
          );
        }

        this.savingPassword = true;

        const response = await requestWithAuthentication(
          "post",
          `/api/eventroom/updateRoomPassword`,
          {
            roomPassword: this.roomPassword,
            eventroomId: this.eventroom.eventroomId,
            userId: this.user._id,
          }
        );

        let eventroom = response.data.result;
        if (!eventroom) throw new Error("Failed to fetch update room.");

        if (response.data.success) {
          this.savingPassword = false;
          this.passwordUpdatedSuccess = true;
          setTimeout(() => {
            this.passwordUpdatedSuccess = false;
          }, 2000);
        }
      } catch (error) {
        console.log("error: ", error);
        this.passwordUpdateFail = true;
        this.savingPassword = false;
      }
    },
    copyRoomPass() {
      var input = document.createElement("textarea");
      input.innerHTML = this.roomPassword;
      document.body.appendChild(input);
      input.select();
      var result = document.execCommand("copy");
      document.body.removeChild(input);
      this.roomPassCopiedState = true;
      setTimeout(() => {
        this.roomPassCopiedState = false;
      }, 1000);
      return result;
    },
    async updateEventroomName() {
      try {
        if (
          !this.eventroomName ||
          this.eventroomName.length == 0 ||
          this.eventroomName == ""
        ) {
          // Prevent updating eventroomName to nothing
          return console.log("Cannot set empty name.");
        }
        if (this.eventroomName == this.eventroom.eventroomName) {
          // Prevent update when updating for connected participants
          // As their old name won't exist anymore so cannot find it
          //-To update, and you wouldn't want to
          return;
        }

        let eventroomData = {
          newEventroomName: this.eventroomName,
          eventroomId: this.eventroom.eventroomId,
        };
        console.log("eveData", eventroomData);
        const response = await axios.post(
          `/api/eventroom/changeEventroomName`,
          eventroomData
        );
        console.log("success name change", response.data);
        this.$store.dispatch(
          "eventroom/updateEventroomName",
          this.eventroomName
        );
        this.$socket.emit("newEventroomName", this.eventroomName);
        this.changeURL();
      } catch (error) {
        console.log("Failed to create temporary user", error);
      }
    },
    changeURL() {
      let slash = "/account/rooms/" + this.eventroom.eventroomName;
      if (history.pushState) {
        history.pushState({}, null, slash);
      } else {
        // support for browsers not supporting pushState
        document.location.href = this.$route + slash;
      }
    },
    async checkIfNameExists() {
      if (
        !this.eventroomName ||
        this.eventroomName.length == 0 ||
        this.eventroomName == ""
      ) {
        // Prevent checking if empty
        return console.log("Cannot check empty name.");
      }
      console.log("wodddoo");
      try {
        let eventroomName = this.eventroomName;
        let eventroomData = {
          eventroomName: eventroomName,
        };
        const response = await axios.post(
          `/api/eventroom/checkIfEventroomExistsByName`,
          eventroomData
        );
        console.log("respon", response.data);
        this.nameExists = response.data.result.alreadyExists;

        if (!this.nameExists) {
          this.updateEventroomName();
        }
      } catch (error) {
        console.log(
          "@checkIfSlugExists: Emergency, our penguins cannot find igloos to check!"
        );
      }
    },
  },
  watch: {
    eventroomName: function () {
      if (!this.awaitingTyping) {
        setTimeout(() => {
          console.log("type type");
          this.checkIfNameExists();
          this.awaitingTyping = false;
        }, 3000); // 1 sec delay
      }
      this.awaitingTyping = true;
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

.save-pass,
.copy-pass {
  font-size: 20px;
  margin-top: 15px;
  margin-left: 20px;
  letter-spacing: 0.5px;
  background-color: #e9eced;
  padding: 6px 14px;
  font-weight: 700;
  border-radius: 360px;
  cursor: pointer;
  transition: 0.1s ease;
}

.save-pass:hover,
.copy-pass:hover {
  background-color: #b7bcc194;
}

.copy-pass {
  margin-left: 10px;
}

.pass-notifiers {
  flex-direction: column !important;
  align-items: flex-start;
}

.toggle-setting {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  width: 550px;
  margin: 20px auto;
  margin-bottom: 30px;
  box-sizing: border-box;
  /* padding-right: 50px; */
}

.setting {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  width: 550px;
  /* margin: 20px auto;
  margin-bottom: 30px; */
  box-sizing: border-box;
}

.pass-setting {
  justify-content: unset;
  margin-top: 10px;
}

.pass-update-success,
.pass-update-fail,
.pass-update-warning {
  font-size: 18px;
  margin-top: 15px;
  letter-spacing: 0.5px;
  background-color: #e9eced;
  color: #5600ff;
  padding: 8px 20px;
  font-weight: 700;
  border-radius: 360px;
  max-width: 522px;
  box-sizing: border-box;
}

.pass-update-fail {
  color: #a50000;
}

.pass-update-warning {
  color: #f76d42;
}

.setting-name {
  font-size: 25px;
  font-weight: 600;
  text-align: left;
  margin-right: auto;
  color: #222;
}

.toggle {
  background-color: #d7dce0;
  border-radius: 360px;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 45px;
  padding: 3px;
  cursor: pointer;
}

.toggle:hover .toggle-circle {
  background-color: #f8fafb;
}

.toggle:hover .blue {
  background-color: #4d01e2;
}

.toggle-background {
  height: 32px;
  margin: 0;
  padding: 0px 2px;
  border-radius: 360px;
  width: 65px;
  /* background-color: #5600ff; */
  display: flex;
  align-items: center;
  justify-content: center;
  transition: 0.2s ease-in-out;
}

.toggle-circle {
  background-color: #e9eced;
  height: 28px;
  width: 28px;
  box-sizing: border-box;
  margin: 0;
  padding: 0px;
  border-radius: 360px;
  transition: 0.2s ease-in-out;
}

.blue {
  background-color: #5600ff;
}

.enabled {
  margin-left: auto;
}

.disabled {
  margin-right: auto;
}

/* .newRoom {
  background-color: #000000;
  color: white;
}

.newRoom:hover {
  background-color: #333;
} */

.room-title {
  font-size: 55px;
  font-weight: 600;
  text-transform: capitalize;
  text-align: center;
  max-width: 600px;
  padding: 2px;
  transition: all 0.2s;
  word-break: break-word;
  cursor: text;
  border-radius: 10px;
  /* color: #1e2f58; */
  display: inline-block;
  font-weight: 900;
  line-height: 1.2;
  margin-left: -2px;
  margin-right: 2px;
  padding: 1px 2px;
  transition: all 0.2s;
  word-break: break-word;
  min-width: 215px;
  outline: none;
  border: none;
  font-family: "Nunito", sans-serif;
  background-color: transparent;
}

.room-title:hover,
.room-title:focus {
  /* background: #eceff4; */
  background: #edf0f1;
  outline: none;
}

.edit-title {
  font-size: 40px;
  font-weight: 600;
  text-align: left;
  margin-right: auto;
  margin-left: auto;
  margin-bottom: 20px;
}

.setting-input {
  border: 1px solid #eee;
  border-radius: 10px;
  width: 300px;
  caret-color: #666;
  padding: 8px 14px;
  font-size: 20px;
  font-family: "Nunito", sans-serif;
  transition: 0.2s ease;
  box-sizing: border-box;
  outline: none;
  margin-top: 14px;
}

.setting-input:hover {
  border-color: #ccc;
}

.setting-input:focus {
  border-color: #ccc;
}

.myrooms {
  margin-bottom: 100px;
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
  color: #555561;
  font-weight: 700;
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
  border-radius: 8px !important;
  font-size: 23px !important;
  border: 1px solid #edf1f5 !important;
  width: 600px !important;
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