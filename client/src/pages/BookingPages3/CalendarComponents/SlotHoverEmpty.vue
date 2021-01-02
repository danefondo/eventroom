<template>
  <div @click="selectSlot" :style="boxHeight" class="highlight-container">
    <div class="highlight-info">Select?</div>
  </div>
</template>

<script>
export default {
  name: "SlotHoverEmpty",
  props: ["slotDateTime", "boxHeight"],
  methods: {
    selectSlot() {
      this.$emit("unselectedSlotSelected", this.slotDateTime);
    },
  },
};
</script>
<style scoped>
.highlight-container {
  display: none;
  align-items: center;
  justify-content: center;
  position: absolute;
  width: 100%;
  cursor: default;
  pointer-events: none;

  /* z-index: 999; */
}

.highlight-info {
  background-color: #eef1f3;
  border-radius: 4px;
  height: 95%;
  width: 95%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  pointer-events: auto;
}
</style>
