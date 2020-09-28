<template>
  <div class="toolbar-container">
    <div class="toolbar">
      <div class="buttonContainer">
        <button class="hoverButton">
          <i id="mic-icon" class="fas fa-microphone fa-xs">Open chat</i>
        </button>
      </div>
      <!-- <div class="toolbar-element" v-for="(icon, index) in iconList" :key="index">
        <div class="toolbar-element-container" @click="openTool(index)">
          <component :is="icon" > </component>
        </div>
      </div> -->
    </div>
    <div class="item-field">
      <!-- Siia tuleb klikkides see elemendi enda vaade - settings või yt search vms -->
      <!-- <div v-if="toolOpened">
        <component :is="openedComponent" @submitPreferences="submitPreferences"> </component>
      </div> -->
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";
// import { requestWithAuthentication } from "../../../config/api";

export default {
  name: "RoomToolbar",
  data() {
    return {
      errors: false,
      //   toolbarConfiguration: [],
      //   toolOpened: false,
      //   openedComponent: "",
    };
  },
  computed: {
    ...mapState({
      user: (state) => state.auth.user,
    }),
  },
};
</script>
<style scoped>
/* Only for debugging */
* {
  box-sizing: border-box;
}
.toolbar-container {
  height: 100%;
  width: 48px;
  border: 2px solid red;
}
/* .toolbar {
  float: left;
  width: 48px;
  height: 100%;
  border: 2px solid red;
}
.toolbar-element {
  max-height: 48px;
  border: 2px solid blue;
}
.item-field {
  float: left;
  max-width: 300px;
  border: 2px solid black;
} */
</style>
