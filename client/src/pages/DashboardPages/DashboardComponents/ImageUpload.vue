<template>
  <div class="image-container">
    <div class="stream_input_title image-caption">{{ caption }}</div>
    <div class="entryDetailsGroup auto-side-margins">
      <div class="mainImage" id="imageArea_">
        <div class="file-upload imageBlock" data-type="mainImage">
          <form
            v-show="!value"
            class="image-upload-wrap imageForm"
            action="/' + coreURL + '/sign-s3"
            method="POST"
            enctype="multipart/form-data"
          >
            <img v-if="!value" :src="profileUpload" class="profileUpload" />
          </form>
          <div v-show="value" class="file-upload-content">
            <div v-if="value" class="remove-button" @click="remove">
              <div class="remove-text">Remove</div>
            </div>
            <img
              :src="value && value.preview"
              class="file-upload-image"
              alt="your image"
            />
          </div>
        </div>
      </div>
    </div>
    <div :class="value ? 'change-button' : 'upload-button'">
      <div :class="value ? 'change-text' : 'upload-text'">
        {{ value ? "Change image" : "Upload image" }}
      </div>
      <input
        ref="fileInput"
        class="file-upload-input"
        id="file-input"
        type="file"
        name="image"
        accept="image/*"
        @change="imageChange"
      />
    </div>
  </div>
</template>

<script>
import profileUpload from "../../../assets/images/profile-upload2.png";

export default {
  name: "ImageUpload",
  model: {
    props: "value",
    event: "change",
  },
  props: {
    value: {
      type: Object,
    },
    uploading: {
      type: Boolean,
      default: false,
    },
    caption: {
      type: String,
    },
  },
  data() {
    return {
      fileName: "",
      capt: this.setCapt(),
      profileUpload: profileUpload,
    };
  },
  methods: {
    setCapt() {
      let capt = "Upload custom thumbnail";
      return capt;
    },
    imageChange({ target }) {
      const file = target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          this.$emit("change", {
            preview: e.target.result,
            file,
          });
          this.fileName = file.name;
        };
        reader.readAsDataURL(file);
        return;
      }
    },
    remove() {
      this.$emit("change", null);
      this.$refs.fileInput.value = null;
      this.fileName = "";
    },
  },
};
</script>

<style>
.image-container {
  display: flex;
  flex-direction: row;
  margin-bottom: 35px;
}
/* .image-caption {
  text-align: center;
} */
.file-upload {
  /* background-color: #fbfbfb; */
  box-sizing: border-box;
  width: 150px;
  height: 150px;
  border-radius: 360px;
}
.file-upload-btn {
  margin: 0;
  font-size: 29px;
  background: transparent;
  border: none;
  padding: 10px;
  border-radius: 4px;
  transition: all 0.2s ease;
  outline: none;
  font-weight: 700;
  color: #130089;
  font-family: "Trebuchet MS", sans-serif;
  margin-bottom: 10px;
  height: 150px;
  width: 150px;
  border-radius: 360px;
}
.file-upload-btn:hover {
  background: #120088bd;
  color: #ffffff;
  transition: all 0.2s ease;
  cursor: pointer;
}
.file-upload-btn:active {
  border: 0;
  transition: all 0.2s ease;
}
.file-upload-content {
  text-align: center;
  position: relative;
  box-sizing: border-box;
  width: 150px;
  height: 150px;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 360px;
}
.file-upload-input {
  position: absolute;
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  outline: none;
  opacity: 0;
  cursor: pointer;
}

input[type="file"],
::-webkit-file-upload-button {
  cursor: pointer;
}

.image-upload-wrap {
  position: relative;
}
.image-upload-wrap:hover {
  background-color: transparent;
  border-color: 4px solid #efefef;
  border-radius: 3px;
}
.image-title-wrap {
  padding: 0 15px 15px 15px;
  color: #222;
}
.image-uploading-title,
.image-removing-title {
  display: none;
}
.drag-text {
  text-align: center;
  /* padding: 30px 0px; */
  color: white;
  width: 150px;
  height: 150px;
}
.drag-text h3 {
  color: #333;
  font-weight: bold;
  font-size: 18px;
}
.file-upload-image {
  width: 150px;
  height: 150px;
  margin: auto;
  object-fit: cover;
  border-radius: 360px;
}
.remove-image {
  width: 200px;
  margin: 0;
  border: none;
  padding: 10px;
  border-radius: 4px;
  transition: all 0.2s ease;
  outline: none;
  text-transform: uppercase;
  font-weight: 700;
}
.remove-image {
  background: #cd4535;
  border-bottom: 4px solid #b02818;
  color: #fff;
}
.remove-image:hover {
  background: #c13b2a;
  color: #ffffff;
  transition: all 0.2s ease;
  cursor: pointer;
}
.remove-image:active {
  border: 0;
  transition: all 0.2s ease;
}

.upload-button,
.remove-button,
.change-button {
  background-color: whitesmoke;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 37px;
  border-radius: 4px;
  padding: 0px 5px;
  margin: auto;
  margin-left: 35px;
  width: 125px;
  cursor: pointer;
  position: relative;
}

.upload-button:hover,
.change-button:hover {
  /* background-color: #f1edf9; */
  background-color: #e2e2e2;
}

.upload-text,
.remove-text,
.change-text {
  color: #6e00ff;
  font-weight: bold;
  font-size: 18px;
}

.change-text {
  color: #000;
}

.remove-button {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  background-color: #ffffffc2;
  right: 0;
  padding: unset;
  margin: auto !important;
  border-radius: 360px;
  width: 150px;
  height: 150px;
  box-sizing: border-box;
  transition: 0.2s ease-in-out;
  display: none;
}

.remove-text {
  color: #000;
  font-size: 22px;
  /* padding: 10px; */
  background-color: #ffffffad;
  border-radius: 360px;
  height: 150px;
  display: flex;
  width: 150px;
  justify-content: center;
  align-items: center;
}

.profileUpload {
  height: 150px;
  width: 150px;
  border-radius: 360px;
  margin: auto;
}

.file-upload-content:hover > .remove-button {
  display: flex;
}
</style>
