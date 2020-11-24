<template>
  <div class="settings">
    <div class="settings-left">
      <SettingsMenu />
    </div>
    <div class="settings-right">
      <EditProfile :user="user" />
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";
import SettingsMenu from "./DashboardComponents/SettingsMenu";
import EditProfile from "./DashboardComponents/EditProfile";

export default {
  name: "AccountSettings",
  components: {
    SettingsMenu,
    EditProfile,
  },
  computed: {
    ...mapState({
      user: (state) => state.auth.user,
    }),
  },
  beforeRouteLeave (to, from, next) {
    const imageInput = document.querySelector('input[name="image"]');
    var cloneToClearListener = imageInput.cloneNode(true);
    imageInput.replaceWith(cloneToClearListener);
    next();
  }
};
</script>

<style scoped>
.settings {
  display: flex;
  flex-wrap: wrap;
  width: 100%;
  height: 100%;
  margin-bottom: 100px;
  justify-content: center;
  align-content: space-between;
}

.settings-right {
  width: 700px;
  margin-left: 25px;
}

.settings-left,
.settings-right {
  padding-top: 50px;
  padding-bottom: 75px;
}

.resend_verif_message,
.resend_verif_success,
.resend_verif_fail {
  line-height: 23px;
  color: darkblue;
}

.resend_verif_message:hover,
.resend_verif_fail:hover {
  cursor: pointer;
  color: #00008bc2;
}

/*! CSS Used from: https://www.eeter.tv/css/reset.css */
div,
span,
h3,
p,
img,
form {
  margin: 0;
  padding: 0;
  border: 0;
  font-size: 100%;
  font: inherit;
  vertical-align: baseline;
}
/*! CSS Used from: https://www.eeter.tv/css/main.css */
* {
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
}
input:focus,
textarea:focus {
  outline: none;
}
input {
  width: 100%;
  padding: 16px;
  box-sizing: border-box;
  border: none;
  border-radius: 0;
  background-color: #fff;
  font-family: "Trebuchet MS", sans-serif;
}
h3 {
  font-size: 18px;
  font-weight: 500;
}
p {
  white-space: normal;
}
div,
p {
  display: block;
}
.container {
  display: flex;
  flex-wrap: wrap;
  max-width: 100%;
  height: 100%;
  min-height: calc(100vh - 116px);
}
.show {
  display: block !important;
}
.hide {
  display: none !important;
}
.success_input_title {
  font-size: 20px;
  font-weight: bold;
  text-align: center;
  color: #333;
}
.entryDetailsGroup {
  background-color: #fbfbfb;
  font-size: 20px;
  color: #0e0e0e;
  border-radius: 6px;
  position: relative;
  border: 1px solid #eee;
  margin-top: 15px;
  max-width: 325px;
}
.curataContainer {
  margin-top: 50px;
  width: 70%;
  margin-bottom: 100px;
}
.sideNavMargin {
  margin-left: auto;
  margin-right: auto;
}
.button-filled {
  display: inline-block;
  font-weight: 600;
  color: white;
  letter-spacing: 0.1rem;
  background-color: blue;
  cursor: pointer;
  border-radius: 3px;
  border: none;
  padding: 12px;
  text-align: center;
  transition: 0.2s ease;
}
.button-filled:hover {
  background-color: #0000ff94;
}
.button-outline {
  display: inline-block;
  border-radius: 2px;
  border: none;
  font-weight: 600;
  letter-spacing: 0.1rem;
  color: #9299a6;
  text-align: center;
  background: none;
  padding: 1rem;
  cursor: pointer;
  transition: 0.2s ease;
}
.button-outline:hover {
  color: #b9bcc1;
}
.deleteModal {
  position: fixed;
  z-index: 9999;
  top: 20%;
  right: 0;
  left: 0;
  margin: 0 auto;
  width: 350px;
  background: #ffffff;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.1), 0 5px 15px 0 rgba(0, 0, 0, 0.05);
  border-radius: 2px;
  border: none;
  padding: 20px;
}
.content-wrapper {
  width: 290px;
  margin: auto;
  display: flex;
  flex-wrap: wrap;
}
.msg-title {
  margin-top: 30px;
  font-size: 20px;
}
.msg-body {
  padding-top: 10px;
  font-weight: 100;
  font-size: 16px;
  display: block;
}
.action-group {
  width: 100%;
  padding-top: 30px;
  margin-left: auto;
  margin-right: auto;
  margin-left: auto;
  text-align: center;
}
.modifiedActionGroup {
  margin-left: 0px;
}
.button-outline.cancelPermaDeleteAccount,
.button-outline.cancelChangePassword {
  width: 98px;
}
.button-filled.confirmPermaDeleteAccount,
.button-filled.confirmChangePassword {
  width: 98px;
  margin-right: 12px;
}
.confirmPermaDeleteAccount {
  background-color: #a70029 !important;
}
.modalBackground__deleteAccount,
.modalBackground__changePassword {
  background-color: #1f1f1f;
  opacity: 0.5;
  top: 0;
  z-index: 1003;
  position: fixed;
  width: 100%;
  height: 100%;
}
.pageTitle__accountSettings {
  font-size: 55px;
  font-weight: bold;
  margin-bottom: 10px;
  color: #333;
}
.pageTitle__accountSettings {
  text-align: center;
  font-size: 40px;
}
.user_not_verified {
  margin: 0 auto;
  max-width: 300px;
  text-align: center;
  padding: 10px 5px;
  border-radius: 2px;
  background-color: #ffbcbc;
  font-weight: bold;
}
.save_pass_button,
.save_username_button,
.save_email_button,
.save_description_button,
.save_name_button,
.save_social_button {
  text-align: center;
  padding: 15px;
  border-radius: 3px;
  transition: 0.2s ease-in-out;
  cursor: pointer;
  display: block;
  color: white;
  font-weight: bold;
  font-size: 16px;
  margin: 0 auto;
  background-color: #130088;
  margin-top: 20px;
}
.save_pass_button:hover,
.save_username_button:hover,
.save_email_button:hover,
.save_description_button:hover,
.save_name_button:hover,
.save_social_button:hover {
  transform: scale(1.02);
}
.deleteAccountText {
  font-size: 17px;
  color: #424242;
  padding-top: 25px;
  line-height: 23px;
  padding-left: 7px;
  padding-right: 6px;
  line-height: 25px;
  font-weight: 400;
}
.deleteAccountButton {
  text-align: center;
  background-color: #a70029;
  padding: 15px;
  margin-top: 20px;
  border-radius: 3px;
  transition: 0.2s ease-in-out;
  cursor: pointer;
  display: block;
  color: white;
  font-weight: bold;
  font-size: 16px;
}
.deleteAccountButton {
  margin-bottom: 20px;
}
.deleteAccountButton:hover {
  transform: scale(1.02);
}
.section__accountSettings {
  padding: 7px 30px;
  border: 1px solid #f9f9f9;
  margin: 28px auto;
  border-radius: 4px;
  box-shadow: 0px 3px 5px 0px #f1f1f1;
  background-color: #fff;
  margin-bottom: 40px;
  min-height: 66px;
}
.section__accountSettings {
  margin-top: 14px;
}
.deleteAccount__accountSettings {
  border: 1px solid #eaeaea;
  font-weight: bold;
  box-shadow: none;
}
.passwordChangeErrorNotifier__accountSettings {
  display: none;
  border-radius: 4px;
  color: white;
  font-weight: bold;
  align-items: center;
  justify-content: center;
  transition: 0.2s ease;
  text-align: center;
}
.passwordChangeErrorNotifier__accountSettings {
  position: relative;
  width: 100%;
  right: 0px;
  background-color: transparent;
  padding: 10px;
  margin-top: 10px;
  color: red;
  font-weight: 400;
}
.file-upload {
  background-color: #fbfbfb;
  box-sizing: border-box;
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
}
.file-upload-btn:hover {
  background: #1aa059;
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
.image-upload-wrap {
  position: relative;
}
.image-upload-wrap:hover {
  background-color: white;
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
  padding: 30px 0px;
  color: white;
}
.drag-text h3 {
  color: #333;
  font-weight: bold;
  font-size: 18px;
}
.file-upload-image {
  max-height: 200px;
  max-width: 200px;
  margin: auto;
  padding: 20px;
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
/*! CSS Used from: https://www.eeter.tv/css/registration.css */
.inputErrorContainer {
  padding: 10px;
  color: red;
  background-color: transparent;
}
/*! CSS Used from: https://www.eeter.tv/css/streaming.css */
.height-120 {
  height: 120px !important;
}
.padding-60 {
  padding-top: 60px;
  padding-bottom: 60px;
}
.auto-side-margins {
  margin-left: auto;
  margin-right: auto;
}
/*! CSS Used from: https://www.eeter.tv/css/content.css */
textarea {
  resize: none;
}
.success_content {
  margin: 50px auto 0px auto;
  max-width: 325px;
}
.settings_delete_section {
  max-width: 325px;
  margin: 0 auto;
}
.settings_section {
  margin-bottom: 50px !important;
}
.stream_input {
  width: 200px;
  border-radius: 3px;
  border: 1px solid #eee;
  margin-right: 16px;
  padding: 10px;
  margin-left: auto;
  margin-right: auto;
  width: 325px;
  padding: 15px !important;
  display: block !important;
  font-size: 18px !important;
  box-shadow: 4px 5px 0px 0px #e6e6e6;
  margin-top: 15px;
  box-sizing: border-box;
  font-family: "Trebuchet MS", sans-serif;
}
.stream_input:focus {
  border-left: 3px solid #120088;
}
/*! CSS Used from: https://www.eeter.tv/css/modal.css */
.inputErrorContainer,
.generalErrorContainer,
.inputSuccessContainer {
  padding: 10px;
  color: red;
  background-color: transparent;
}
.inputSuccessContainer {
  color: green;
}
.generalErrorContainer {
  margin-bottom: 20px;
  padding: 0;
  font-size: 18px;
}
.pass_field {
  font-size: 13px;
  color: #545454;
  font-weight: 500;
  margin-left: auto;
  display: block;
  margin-bottom: -10px;
  margin-top: 20px;
}
</style>