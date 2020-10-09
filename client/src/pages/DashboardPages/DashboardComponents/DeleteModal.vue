<template>
  <div class="modal-mask">
    <div class="modal-background" @click="toggleDeleteModal"></div>
    <div class="modal-wrapper">
      <div class="modal-container">
        <img @click="toggleDeleteModal" :src="cancelIcon" class="cancelIcon" />
        <div class="modal-header">
          <div class="modal-title">Delete your account</div>
        </div>
        <div class="modal-content">
          <div class="shortcuts">
            <div class="shortcut-group">
              Deleting your account is permanent. There's no going back. We keep
              no backups. Your account and its data will be irreversably
              deleted.
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <slot name="footer">
            Please enter your password to authorize account deletion.
          </slot>
        </div>
        <input
          type="password"
          class="setting-input"
          placeholder="************"
          v-model="passwordValue"
        />
        <div class="general-error" v-if="generalError">
          {{ generalErrorMessage }}
        </div>
        <div class="delete" @click="deleteAccount" :disabled="deletingAccount">
          {{
            deletingAccount
              ? "Deleting..."
              : "I understand. Please delete my account."
          }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import cancelIcon from "../../../assets/images/cancel.png";

export default {
  name: "DeleteModal",
  data() {
    return {
      cancelIcon: cancelIcon,
    };
  },
  props: ["deletingAccount", "password", "generalError", "generalErrorMessage"],
  computed: {
    passwordValue: {
      get() {
        return this.password;
      },
      set(password) {
        this.$emit("passwordEmit", password);
      },
    },
  },
  methods: {
    toggleDeleteModal() {
      this.$emit("toggleDeleteModal");
    },
    deleteAccount() {
      this.$emit("deleteAccount");
    },
  },
};
</script>

<style scoped>
.modal-mask {
  position: fixed;
  z-index: 9998;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: table;
  transition: opacity 0.3s ease;
}

.modal-wrapper {
  display: table-cell;
  vertical-align: middle;
}

.modal-background {
  z-index: -1;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  transition: opacity 0.3s ease;
}

.modal-container {
  width: 550px;
  margin: 0px auto;
  margin-bottom: 150px;
  padding: 30px 5px;
  padding-bottom: 45px;
  background-color: #fff;
  border-radius: 3px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.33);
  transition: all 0.3s ease;
  position: relative;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  justify-content: center;
  margin-top: 15px;
}

.modal-header h3 {
  margin-top: 0;
  color: #42b983;
}

.modal-title {
  font-size: 14px;
  text-transform: uppercase;
  font-weight: 800;
  color: #324269;
}

.modal-body {
  margin: 20px 0;
}

.modal-default-button {
  float: right;
}

.shortcuts {
  width: 400px;
}

.modal-content {
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 35px;
  padding-bottom: 5px;
  padding-top: 20px;
}

.shortcuts {
  display: flex;
  flex-direction: column;
  justify-content: center;
  margin: 0 auto;
}

.shortcut-group {
  font-size: 21px;
  font-weight: bold;
  color: #324269;
  margin: 0 auto;
  margin-top: 10px;
  margin-bottom: 25px;
}

.shortcut {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 6px 5px;
  margin: 10px 0px;
  text-align: center;
  background-color: #ffffff;
  border-radius: 3px;
  border: 1px solid #c4c6ca7d;
}

.shortcut-key {
  font-family: monospace, monospace;
  letter-spacing: 0px;
  word-spacing: -8px;
  background-color: #f3f3f3;
  padding: 2px 5px;
  font-size: 17px;
  border-radius: 3px;
  border: 1px solid #e4e3e3;
  color: #2b2b2b;
  font-weight: bold;
  cursor: default;
  text-align: center;
  margin: 0 auto;
}

.shortcut-action {
  text-align: left;
  padding: 3px 2px;
  width: 200px;
}

.modal-footer {
  margin: 0 auto;
  justify-content: center;
  display: flex;
  font-size: 15px;
  color: #454d61a8;
  margin-bottom: 10px;
}

.cancelIcon {
  width: 14px;
  height: 14px;
  padding: 8px;
  border-radius: 20px;
  cursor: pointer;
  margin-bottom: auto;
  position: absolute;
  right: 18px;
  top: 18px;
}

.cancelIcon:hover {
  background-color: #e5e8ef;
}

.setting-input {
  border: 1px solid #eee;
  border-radius: 4px;
  width: 395px;
  caret-color: #666;
  padding: 8px 14px;
  font-size: 20px;
  font-family: "Nunito", sans-serif;
  transition: 0.2s ease;
  box-sizing: border-box;
  outline: none;
  margin: 0 auto;
}

.setting-input:hover {
  border-color: #ccc;
}

.setting-input:focus {
  border-color: #ccc;
}

.delete {
  min-width: 165px;
  max-width: 450px;
  padding: 10px 17px;
  border: 0 solid #f1f1f1;
  font-weight: bold;
  background-color: #a72143;
  border-radius: 19px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: white;
  font-size: 20px;
  margin: 11px auto;
  margin-top: 30px;
}

.delete:hover {
  background-color: #a72143af;
}

.general-error {
  color: #a72143;
  background-color: #f9f9f9;
  padding: 6px 10px;
  border-radius: 3px;
  font-weight: bold;
  font-size: 18px;
  margin-top: 12px;
  margin-bottom: -7px;
  box-sizing: border-box;
  text-align: center;
  width: 395px;
  margin-left: auto;
  margin-right: auto;
}

/*
 * The following styles are auto-applied to elements with
 * transition="modal" when their visibility is toggled
 * by Vue.js.
 *
 * You can easily play with the modal transition by editing
 * these styles.
 */

.modal-enter {
  opacity: 0;
}

.modal-leave-active {
  opacity: 0;
}

.modal-enter .modal-container,
.modal-leave-active .modal-container {
  -webkit-transform: scale(1.1);
  transform: scale(1.1);
}
</style>
