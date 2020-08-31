<template>
  <div v-if="boxData.spotlight" :id="boxData.objectId" class="spotlight-box">
    <div class="control-buttons">
      <div
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
    },
  },
  mounted() {
    console.log("whadup1 spotlight");
    // let box = document.getElementById(this.boxData.objectId);
    // let hasVideo = box.querySelector("#" + this.boxData.elementId) != null;
    if (this.boxData.spotlight) {
      console.log("whadup2", this.boxData);
      const containerData = {
        objectId: this.boxData.objectId,
        type: this.boxData.type,
        spotlight: this.boxData.spotlight,
      };
      this.$store.dispatch("addReadyContainer", containerData);
      console.log("whadup3");
    }
  },
};
</script>

<style scoped>
.spotlight-box {
  display: flex;
  flex-direction: column;
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