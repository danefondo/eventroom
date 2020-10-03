<template>
  <div class="modal-mask">
    <div class="modal-background" @click="closeModal"></div>
    <div class="modal-wrapper">
      <div class="modal-container">
        <img @click="closeModal" :src="cancelIcon" class="cancelIcon" />
        <div class="modal-header">
          <div class="modal-title">Room shortcuts</div>
        </div>
        <div class="modal-content">
          <div class="shortcuts">
            <div class="shortcut-group general">General shortcuts</div>
            <div class="shortcut">
              <span class="shortcut-key">ALT + S</span>
              <span class="shortcut-action">Show available shortcuts</span>
            </div>
            <div class="shortcut-group">Media controls</div>
            <div class="shortcut">
              <span class="shortcut-key">C</span>
              <span class="shortcut-action">Turn camera on / off</span>
            </div>
            <div class="shortcut">
              <span class="shortcut-key">M</span>
              <span class="shortcut-action">Turn microphone on / off</span>
            </div>
            <div class="shortcut">
              <span class="shortcut-key">Z</span>
              <span class="shortcut-action">Start / stop screenshare</span>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <slot name="footer">
            NB! Shortcuts don't work whilst typing inside inputs.
          </slot>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import cancelIcon from "../../../assets/images/cancel.png";

export default {
  name: "RoomShortcuts",
  data() {
    return {
      cancelIcon: cancelIcon,
    };
  },
  methods: {
    closeModal() {
      this.$emit("wrapperClick");
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
  width: 500px;
  margin: 0px auto;
  margin-bottom: 150px;
  padding: 20px 30px;
  background-color: #fff;
  border-radius: 3px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.33);
  transition: all 0.3s ease;
  position: relative;
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
  width: 300px;
}

.modal-content {
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 35px;
}

.shortcuts {
  display: flex;
  flex-direction: column;
  justify-content: center;
  margin: 0 auto;
}

.shortcut-group {
  font-size: 23px;
  font-weight: bold;
  color: #324269;
  margin: 0 auto;
  margin-top: 25px;
  margin-bottom: 12px;
}

.general {
  margin-top: 0px;
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
