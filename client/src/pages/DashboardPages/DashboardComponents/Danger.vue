<template>
  <div class="password-settings">
    <DeleteModal
      v-if="deleteModal"
      :password="password"
      :deletingAccount="deletingAccount"
      :generalError="generalError"
      :generalErrorMessage="generalErrorMessage"
      @toggleDeleteModal="toggleDeleteModal"
      @deleteAccount="deleteAccount"
      @passwordEmit="passwordEmit"
    />
    <div class="settings-title mb-20">Danger Zone</div>
    <div class="delete-account">
      <div class="settings-subtitle">Delete my account</div>
      <div class="consideration">
        I've taken a good look at my life and have come to the conclusion that
        eventroom.to, at this stage, just doesn't quite fit into my life. As
        such,
        <span style="font-weight: bold"
          >I would like to delete my eventroom.to account</span
        >
        along with all the rooms, history and data I've ever produced on this
        website.
      </div>
      <div
        class="delete"
        @click="toggleDeleteModal"
        :disabled="deletingAccount"
      >
        {{ deletingAccount ? "Byebye..." : "Delete account" }}
      </div>
      <div class="row-separator"></div>
    </div>
    <div class="general-password-error" v-if="exceptionError">
      {{ exceptionErrorMessage }}
    </div>
  </div>
</template>

<script>
import { requestWithAuthentication } from "../../../config/api";
import DeleteModal from "./DeleteModal";

export default {
  name: "Danger",
  data() {
    return {
      deletingAccount: false,
      password: "",
      deleteModal: false,
      generalError: false,
      generalErrorMessage: "",
      exceptionError: false,
      exceptionErrorMessage: "",
    };
  },
  props: ["user"],
  components: {
    DeleteModal,
  },
  methods: {
    passwordEmit(password) {
      this.password = password;
    },
    toggleDeleteModal() {
      this.deleteModal = !this.deleteModal;
    },
    async deleteAccount() {
      if (this.deletingAccount) {
        return;
      }
      this.deletingAccount = true;
      this.generalError = false;
      this.generalErrorMessage = "";

      if (!this.password) {
        this.generalError = true;
        this.generalErrorMessage = "Must provide password to authorize delete.";
        this.deletingAccount = false;
        return;
      }

      try {
        const result = await requestWithAuthentication(
          `post`,
          "/api/settings/deleteAccount",
          { userId: this.user._id, password: this.password }
        );

        if (result.data.success) {
          // Redirect to custom page saying 'Thanks for being a part of Eventroom.'
          // Simple page, having no taste of desperation or trying to get anyone back;

          this.generalError = false;
          this.generalErrorMessage = "";
          this.exceptionError = false;
          this.exceptionErrorMessage = "";
          this.deleteModal = false;
          this.deletingAccount = false;
          this.$router.push("/");
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
        this.deletingAccount = false;
      }
    },
    processAndDisplayServerErrors(errors) {
      console.log("@processServerError: ", errors);
      this.generalError = false;
      this.generalErrorMessage = "";
      this.exceptionError = false;
      this.exceptionErrorMessage = "";

      if (!errors) {
        this.exceptionError = true;
        this.exceptionErrorMessage =
          "Your account couldn't be deleted. Please contact support.";
        this.deleteModal = false;
        return console.warn("Threw error but no errors. Ehhh...");
      } else if (errors.exceptionError) {
        this.exceptionError = true;
        this.exceptionErrorMessage = errors.exceptionErrorMessage;
        this.deleteModal = false;
      } else if (errors.didNotReceiveResponseBack) {
        this.generalError = true;
        this.generalErrorMessage =
          "Network error. Please refresh and try again.";
      } else if (errors.PasswordDoesNotMatchError) {
        this.generalError = true;
        this.generalErrorMessage = "Password is incorrect.";
      } else if (errors.UserNotFoundError) {
        this.generalError = true;
        this.generalErrorMessage =
          "User not found. Please refresh to see if you're still logged in.";
      } else if (errors.InvalidRequest) {
        this.generalError = true;
        this.generalErrorMessage =
          "Something went wrong. Try again or contact support.";
      } else if (errors.UserIdMissing) {
        this.generalError = true;
        this.generalErrorMessage =
          "User not found. Please refresh to see if you're still logged in.";
      } else if (errors.PasswordIsMissing) {
        this.generalError = true;
        this.generalErrorMessage = "Must provide password to authorize delete.";
      } else if (errors) {
        if (errors.generalError) {
          this.generalError = true;
          this.generalErrorMessage = errors.generalErrorMessage;
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

.delete-account {
  background-color: #ffefef;
  padding: 30px;
  padding-bottom: 0px;
  border-radius: 3px;
  margin-top: 35px;
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
  border-bottom: 1px solid transparent;
  margin: 40px auto;
  width: 95%;
}

.input-label {
  padding: 5px;
  color: #a2a2a2;
  padding-bottom: 6px;
  padding-left: 4px;
}

.consideration {
  padding: 5px;
  color: #222;
  padding-bottom: 6px;
  padding-left: 4px;
  font-size: 18px;
  line-height: 24px;
  word-spacing: 2px;
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

.delete {
  min-width: 165px;
  max-width: 200px;
  padding: 10px 10px;
  border: 0 solid #f1f1f1;
  font-weight: bold;
  /* background-color: #f5f5f5; */
  background-color: #a72143;
  border-radius: 19px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  /* color: #222; */
  color: white;
  font-size: 20px;
  margin: 11px 0px;
  margin-right: auto;
  margin-top: 20px;
}

.delete:hover {
  background-color: #a72143af;
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