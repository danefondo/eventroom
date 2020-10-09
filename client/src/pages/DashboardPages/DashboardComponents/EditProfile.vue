<template>
  <div class="profile-settings">
    <div class="settings-title">Profile settings</div>
    <div class="profile-rows">
      <div class="settings-subtitle" style="margin-bottom:30px;">Avatar</div>
      <div class="profile-row">
        <ImageUpload v-model="image" :uploading="uploadingImage" />
      </div>
      <div class="profile-row">
        <div class="input-container">
          <div class="input-label">Display name</div>
          <input
            class="setting-input"
            placeholder="RocketUnicorn9000"
            v-model="displayName"
          />
        </div>
        <div class="input-container">
          <div class="input-label">Location</div>
          <input
            class="setting-input"
            placeholder="e.g. New York, USA"
            v-model="location"
          />
        </div>
      </div>
      <div class="profile-row bio-row">
        <div class="input-container">
          <div class="input-label">Bio</div>
          <ckeditor
            class="unreset event-creator-input ck-creator-input"
            :editor="editor"
            v-model="bio"
            :config="editorConfig"
          ></ckeditor>
        </div>
      </div>
      <div class="row-separator"></div>
      <div class="settings-subtitle">Name</div>
      <div class="profile-row">
        <div class="input-container">
          <div class="input-label">First name</div>
          <input
            class="setting-input"
            placeholder="Queen"
            v-model="firstName"
          />
        </div>
        <div class="input-container">
          <div class="input-label">Last name</div>
          <input
            class="setting-input"
            placeholder="Elizabeth II"
            v-model="lastName"
          />
        </div>
      </div>
    </div>
    <div class="save" @click="saveProfileSettings" :disabled="updatingSettings">
      {{ updatingSettings ? "Saving..." : "Save settings" }}
    </div>
  </div>
</template>

<script>
import DecoupledEditor from "@ckeditor/ckeditor5-build-decoupled-document";
import { requestWithAuthentication } from "../../../config/api";
import ImageUpload from "./ImageUpload";
// import axios from "axios";

export default {
  name: "EditProfile",
  data() {
    return {
      updatingSettings: false,
      uploadingImage: false,
      thumbnailKey: null,
      thumbnailUrl: null,
      thumbnailName: null,
      image: null,
      displayName: "",
      location: "",
      bio: "",
      firstName: "",
      lastName: "",
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
  props: ["user"],
  components: {
    ImageUpload,
  },
  methods: {
    async getProfileSettingsData() {
      console.log("Whatsu");
    },
    async saveProfileSettings() {
      console.log("@user", this.user);
      let profileSettings = {
        userId: this.user._id,
        displayName: this.displayName,
        firstName: this.firstName,
        lastName: this.lastName,
        bio: this.bio,
        location: this.location,
      };

      this.runInitialValidation();

      try {
        console.log("@saveProfileSettings", profileSettings);
        this.updatingSettings = true;

        const result = await requestWithAuthentication(
          `post`,
          `api/settings/updateProfileSettings`,
          profileSettings
        );

        if (result.data.success) {
          this.updatingSettings = false;
        }
      } catch (error) {
        // window.scrollTo(0, 0);
        // this.error = true;
        console.log("Error", error);
        this.updatingSettings = false;
      }
    },
    runInitialValidation() {
      console.log("Good to go!");
    },
    async uploadImage() {
      try {
        this.uploadingImage = true;
        const fileName = Date.now().toString();
        const fileType = this.image.file.type;
        let imageData = {
          fileName,
          fileType,
        };

        const result = await requestWithAuthentication(
          `post`,
          `api/settings/getS3Signature`,
          imageData
        );

        console.log("result", result);
        let returnData = result.data.returnData;
        const signedRequest = returnData.signedRequest;
        let uploadResult = await fetch(signedRequest, {
          method: "PUT",
          body: this.image.file,
          headers: {
            "Content-Type": this.image.file.type,
            processData: false,
          },
        });
        console.log("upres", uploadResult);
        this.thumbnailKey = returnData.fileName;
        this.thumbnailUrl = returnData.url;
      } catch (error) {
        this.uploadingImage = false;
      }
    },
  },
  watch: {
    image: async function () {
      if (this.image && this.image.file) {
        await this.uploadImage();
      }
    },
  },
};
</script>

<style scoped>
.profile-settings {
  padding: 15px 75px;
}

.settings-title {
  font-size: 45px;
}

.settings-subtitle {
  font-size: 30px;
  margin-bottom: 15px;
}

.profile-rows {
  padding-top: 30px;
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
  font-size: 18px !important;
  border: 1px solid #eee !important;
  width: 550px !important;
  box-sizing: border-box;
  height: 100px !important;
  outline: none !important;
  box-shadow: none !important;
  transition: 0.2s ease !important;
}

.ck-creator-input:focus {
  border-color: #493eff !important;
  border-color: #493eff4d !important;
  border-color: #ccc !important;
}

.ck-creator-input:hover {
  border-color: #ccc !important;
}

.row-separator {
  border-bottom: 1px solid #eaeaea;
  margin: 40px auto;
  width: 95%;
}

.input-label {
  padding: 5px;
  color: #a2a2a2;
  padding-bottom: 6px;
  padding-left: 4px;
}

.setting-input {
  border: 1px solid #eee;
  border-radius: 3px;
  width: 250px;
  caret-color: #666;
  padding: 8px 14px;
  font-size: 20px;
  font-family: "Nunito", sans-serif;
  transition: 0.2s ease;
  box-sizing: border-box;
  outline: none;
}

.setting-input:hover {
  border-color: #ccc;
}

.setting-input:focus {
  border-color: #ccc;
}

.save {
  width: 165px;
  padding: 10px 10px;
  border: 0 solid #f1f1f1;
  font-weight: bold;
  /* background-color: #f5f5f5; */
  background-color: #6e00ff;
  border-radius: 19px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  /* color: #222; */
  color: white;
  font-size: 20px;
  margin: 11px 0px;
  margin-left: auto;
  margin-top: 50px;
}

.save:hover {
  background-color: #6e00ffc9;
}
</style>