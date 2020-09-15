<template>
  <div class="video">
    Video area with video container id: {{videoContainerId}}. This box contains video? {{thisBoxContainsVideo}}.
    <VideoContainer :videoContainerId="videoContainerId"/>
    <div v-if="moveToCentralPossible">
      <button @click="moveVideoToCentral" :disabled="!moveToCentralPossible" class="spotlightbutton">{{moveToCentralButtonText}}</button> 
      <span>
        <select v-model="moveToCentralTarget">
          <option disabled value="">choose spotlight location!</option>
          <option v-for="(central, index) in currentlyAvailableCentral" :key="index">
            {{central}}
          </option>
        </select>
      </span>
    </div>
    <div v-if="moveToRightPossible">
      <button @click="moveVideoToRight" :disabled="!moveToRightPossible" class="movetorightbutton">{{moveToRightButtonText}}</button> 
      <span>
        <select v-model="moveToRightTarget">
          <option disabled value="">choose a new location!</option>
          <option v-for="(right, index) in currentlyAvailableRight" :key="index">
            {{right}}
          </option>
        </select>
      </span>
    </div>
  </div>
</template>
<script>
import { mapState, mapGetters } from 'vuex';

import SessionController from "../../../../../session/SessionController";

import VideoContainer from './VideoContainer';

export default {
  name: "VideoBox",
  components: {
    VideoContainer,
  },
  props: {
    videoContainerId: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      moveToCentralTarget: "",
      moveToRightTarget: "",
      currentlyMoving: false,
    }
  },
  computed: {
    ...mapState({
    }),
    ...mapGetters({
      currentlyAvailableCentral: 'session/currentlyAvailableCentral',
      currentlyAvailableRight: 'session/currentlyAvailableRight',
      currentlyAvailableKeys: 'session/currentlyAvailableKeys',
    }),
    // Metadata
    thisBoxContainsVideo: function() {
      return this.currentlyAvailableKeys && !this.currentlyAvailableKeys.includes(this.videoContainerId);
    },
    location: function() {
      const firstLetters = this.videoContainerId.substring(0,3);
      switch(firstLetters) {
        case "cen":
          return "central";
        case "rig":
          return "right";
        case "top":
          return "top";
        case "bot":
          return "bottom";
        case "lef":
          return "left";
        default:
          return "";
      }
    },
    // Move to central data
    moveToCentralPossible: function() {
      return this.currentlyAvailableCentral && this.currentlyAvailableCentral.length !== 0 && this.thisBoxContainsVideo;
    },
    moveToCentralButtonText: function() {
      if (this.currentlyMoving) return "currently moving";
      if (!this.moveToCentralPossible) return "";
      if (this.location === "central") return "switch spotlight location!";
      return "spotlight this stream!";
    },
    // Move to right data
    moveToRightPossible: function() {
      return this.currentlyAvailableRight && this.currentlyAvailableRight.length !== 0 && this.thisBoxContainsVideo;
    },
    moveToRightButtonText: function() {
      if (this.currentlyMoving) return "currently moving";
      if (!this.moveToRightPossible) return "";
      if (this.location === "right") return "switch location!";
      return "remove from spotlight!";
    },


  },
  methods: {
    printLocation() {
      console.log("@print id:", this.videoContainerId);
      console.log(this.location);
    },
    async moveVideoToCentral() {
      this.currentlyMoving = true;
      const targetCentral = this.moveToCentralTarget == ""  
        ? this.currentlyAvailableCentral[0] 
        : this.moveToCentralTarget;
      console.log("@movevideocentral current, target", this.videoContainerId, targetCentral);
      try {
        await SessionController.moveVideo(this.videoContainerId, targetCentral); 
        this.currentlyMoving = false;
      } catch (err) {
        console.log("@movevideocentral error:", err);
      }
    },
    async moveVideoToRight() {
      this.currentlyMoving = true;
      const targetRight = this.moveToRightTarget == ""  
        ? this.currentlyAvailableRight[0] 
        : this.moveToRightTarget;
      console.log("@movevideoright current, target", this.videoContainerId, targetRight);
      try {
        await SessionController.moveVideo(this.videoContainerId, targetRight); 
        this.currentlyMoving = false;
      } catch (err) {
        console.log("@movevideoright error:", err);
      }
    }

  }
}
</script>
<style scoped>
.video {
  border: 2px solid black;
}
</style>