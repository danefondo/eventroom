<template>
  <div v-if="boxData.spotlight" :id="boxData.objectId" class="spotlight-box">
    <div class="control-buttons">
      <div
        v-if="boxData.elementId"
        @click="removeFromSpotlight"
        class="control-button remove-spotlight"
      >Remove from spotlight</div>
    </div>
  </div>
</template>

<script>
export default {
  name: "SpotlightBox",
  props: ["boxData"],
  methods: {
    removeFromSpotlight() {
      console.log("Removing.");
      let containerId = this.boxData.objectId;
      this.$emit("removeFromSpotlight", containerId);
    },
  },
  mounted() {
    // Notify when container is ready
    console.log("debug", this.boxData.objectId, this.boxData.spotlight);
    if (this.boxData.spotlight && !this.boxData.republishInProcess) {
      console.log("@spotlightBox box data", this.boxData);
      const containerData = {
        objectId: this.boxData.objectId,
        type: this.boxData.type,
        spotlight: this.boxData.spotlight,
      };
      this.$store.dispatch("session/addReadyContainer", JSON.parse(JSON.stringify(containerData)));
    } else if (this.boxData.spotlight && this.boxData.republishInProcess) {
      // Notify that container is ready for republishing use
      console.log("@10/@11 @SpotlightBox.vue, Republish in process, about to emit spotlight container ready to EventRoomPage.vue");
      let streamData = JSON.parse(JSON.stringify(this.boxData));
      this.$emit("spotlightContainerReady", streamData);
    }
  },
};
</script>

<style scoped>
.spotlight-box {
  display: flex;
  flex-direction: column;
  height: 100%;
}
.control-buttons {
  /* z-index: 9999;
  position: absolute;
  bottom: 0; */
  width: 100%;
}
.control-button {
  padding: 5px 10px;
  color: white;
  background-color: black;
  cursor: pointer;
  border-bottom: 1px solid #272727;
}
.control-button:hover {
  background-color: #222;
}
</style>