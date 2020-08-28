<template>
  <div v-if="boxData.spotlight" :id="boxData.objectId" class="spotlight-box">
    <div class="control-buttons">
      <div @click="removeFromSpotlight" class="control-button remove-spotlight">Remove from spotlight</div>
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