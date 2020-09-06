<template>
  <div v-if="!boxData.spotlight" :id="boxData.objectId" class="container-box">
    <div class="control-buttons">
      <div
        v-if="boxData.elementId"
        @click="addToSpotlight"
        class="control-button add-spotlight"
      >Add to spotlight</div>
    </div>
  </div>
</template>

<script>
export default {
  name: "ContainerBox",
  props: ["boxData"],
  methods: {
    addToSpotlight() {
      console.log("Adding.");
      let containerId = this.boxData.objectId;
      this.$emit("addToSpotlight", containerId);
      // emit to EventRoom to change spotlight value to true
      // then copy video
      // remove video
      // append video
      // update database with new state
    },
  },
  mounted() {
    if (!this.boxData.republishInProcess) {
      console.log("@containerBox");
      let containerData = {
        objectId: this.boxData.objectId,
        type: this.boxData.type,
        spotlight: this.boxData.spotlight,
      };
      containerData = JSON.parse(JSON.stringify(containerData));
      this.$store.dispatch("session/addReadyContainer", containerData);
      console.log("Added regular container into readyContainers in Vuex store");
    } else if (this.boxData.republishInProcess) {
      // Notify that container is ready for republishing use
      let streamData = JSON.parse(JSON.stringify(this.boxData));
      this.$emit("containerReady", streamData);
    }
  },
};
</script>

<style scoped>
.container-box {
  display: flex;
  flex-direction: column;
  height: 250px;
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