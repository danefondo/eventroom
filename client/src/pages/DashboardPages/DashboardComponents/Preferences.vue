<template>
  <div class="password-settings">
    <div class="settings-title">Change password</div>
    <div class="profile-rows">
      <div class="settings-subtitle">Old password</div>
      <div class="profile-row">
        <div class="input-container">
          <div class="input-label">Enter old password</div>
          <input
            type="password"
            class="setting-input"
            placeholder="************"
            v-model="oldPassword"
          />
          <div class="password-error" v-if="oldPasswordError">
            {{ oldPasswordErrorMessage }}
          </div>
        </div>
      </div>
      <div class="row-separator"></div>
      <div class="settings-subtitle">New password</div>
      <div class="profile-row">
        <div class="input-container">
          <div class="input-label">Enter new password</div>
          <input
            type="password"
            class="setting-input"
            placeholder="************"
            v-model="newPassword"
          />
          <div class="password-error" v-if="newPasswordError">
            {{ newPasswordErrorMessage }}
          </div>
        </div>
        <div class="input-container">
          <div class="input-label">Confirm new password</div>
          <input
            type="password"
            class="setting-input"
            placeholder="************"
            v-model="newPasswordConfirmation"
          />
          <div class="password-error" v-if="newPasswordConfirmationError">
            {{ newPasswordConfirmationErrorMessage }}
          </div>
        </div>
      </div>
    </div>
    <div class="general-password-error" v-if="generalPasswordError">
      {{ generalPasswordErrorMessage }}
    </div>
    <div class="general-password-success" v-if="passwordChangeSuccess">
      {{ passwordChangeSuccessMessage }}
    </div>
    <div class="save" @click="changePassword" :disabled="changingPassword">
      {{ changingPassword ? "Saving..." : "Change password" }}
    </div>
  </div>
</template>

<script>
import { requestWithAuthentication } from "../../../config/api";

export default {
  name: "Preferences",
  data() {
    return {
      changingPassword: false,
      oldPassword: "",
      newPassword: "",
      newPasswordConfirmation: "",
      oldPasswordError: false,
      newPasswordError: false,
      newPasswordConfirmationError: false,
      oldPasswordErrorMessage: "",
      newPasswordErrorMessage: "",
      newPasswordConfirmationErrorMessage: "",
      generalPasswordError: false,
      generalPasswordErrorMessage: "",
      passwordChangeSuccess: false,
      passwordChangeSuccessMessage: "",
    };
  },
  props: ["user"],
  methods: {
    async changePassword() {
      let passwordChangeData = {
        oldPassword: this.oldPassword,
        newPassword: this.newPassword,
        newPasswordConfirmation: this.newPasswordConfirmation,
      };

      this.changingPassword = true;

      let passwordErrorState = this.runInitialValidation();
      if (passwordErrorState) {
        return;
      }

      try {
        const result = await requestWithAuthentication(
          `post`,
          "/api/accounts/updatePassword",
          passwordChangeData
        );

        if (result.data.success) {
          this.changingPassword = false;
          this.oldPassword = "";
          this.newPassword = "";
          this.newPasswordConfirmation = "";
          this.passwordChangeSuccess = true;
          this.passwordChangeSuccessMessage = "Password successfully changed.";
          setTimeout(function () {
            this.passwordChangeSuccess = false;
            this.passwordChangeSuccessMessage = "";
          }, 5000);
        }
      } catch ({ response }) {
        if (response.data.errors) {
          this.processAndDisplayServerErrors(response.data.errors);
        } else {
          let errors = {
            didNotReceiveResponseBack: true,
          };
          this.processAndDisplayServerErrors(errors);
        }
        this.changingPassword = false;
      }
    },
    runInitialValidation() {
      let passwordError = false;

      this.oldPasswordError = false;
      this.newPasswordError = false;
      this.newPasswordConfirmationError = false;

      this.oldPasswordErrorMessage = "";
      this.newPasswordErrorMessage = "";
      this.newPasswordConfirmationErrorMessage = "";

      if (!this.oldPassword) {
        this.oldPasswordError = true;
        this.oldPasswordErrorMessage = "Cannot be empty!";
        passwordError = true;
      }

      if (this.newPassword.length < 8) {
        this.newPasswordError = true;
        this.newPasswordErrorMessage =
          "Password must be at least 8 characters long";
        passwordError = true;
      }

      if (!this.newPassword) {
        this.newPasswordError = true;
        this.newPasswordErrorMessage = "Cannot be empty!";
        passwordError = true;
      }

      if (!this.newPasswordConfirmation) {
        this.newPasswordConfirmationError = true;
        this.newPasswordConfirmationErrorMessage = "Cannot be empty!";
        passwordError = true;
      }

      if (
        this.newPassword &&
        this.newPasswordConfirmation &&
        this.newPassword !== this.newPasswordConfirmation
      ) {
        this.newPasswordConfirmationError = false;
        this.newPasswordConfirmationErrorMessage = "";
        this.newPasswordError = true;
        this.newPasswordErrorMessage = "Passwords don't match!";
        passwordError = true;
      }

      return passwordError;
    },
    processAndDisplayServerErrors(errors) {
      console.log("@processServerError: ", errors);
      this.generalPasswordError = false;
      this.generalPasswordErrorMessage = "";

      if (!errors) {
        return console.warn("Threw error but no errors. Ehhh...");
      } else if (errors.didNotReceiveResponseBack) {
        this.generalPasswordError = true;
        this.generalPasswordErrorMessage =
          "Network error. Please refresh and try again.";
      } else if (errors) {
        this.generalPasswordError = true;

        if (errors.oldPasswordError) {
          this.oldPasswordError = true;
          this.oldPasswordErrorMessage = errors.oldPasswordErrorMessage;
        }

        if (errors.newPasswordError) {
          this.newPasswordError = true;
          this.newPasswordErrorMessage = errors.newPasswordErrorMessage;
        }

        if (errors.newPasswordConfirmationError) {
          this.newPasswordConfirmationError = true;
          this.newPasswordConfirmationErrorMessage =
            errors.newPasswordConfirmationErrorMessage;
        }

        if (errors.generalPasswordError) {
          this.generalPasswordError = true;
          this.generalPasswordErrorMessage = errors.generalPasswordErrorMessage;
        }
      }
    },
  },
};
</script>

<style scoped>
.password-settings {
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
}

.ck-creator-input:focus {
  border-color: #493eff !important;
  border-color: #493eff4d !important;
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
  min-width: 165px;
  max-width: 200px;
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

.password-error {
  color: #a72143;
  background-color: #f9f9f9;
  padding: 6px 10px;
  border-radius: 3px;
  font-weight: bold;
  font-size: 15px;
  margin-top: 5px;
  max-width: 250px;
  box-sizing: border-box;
}

.general-password-error {
  color: #a72143;
  background-color: #f9f9f9;
  padding: 6px 10px;
  border-radius: 3px;
  font-weight: bold;
  font-size: 21px;
  margin-top: 45px;
  margin-bottom: -25px;
  box-sizing: border-box;
  text-align: center;
}

.general-password-success {
  color: #21a764;
  background-color: #f9f9f9;
  padding: 6px 10px;
  border-radius: 3px;
  font-weight: bold;
  font-size: 21px;
  margin-top: 45px;
  margin-bottom: -25px;
  box-sizing: border-box;
  text-align: center;
}
</style>