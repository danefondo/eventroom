<template>
  <div class="line" :style="getSlotLinePosition">
    <div class="relative">
      <div class="arrow-right"></div>
      <div class="arrow-left"></div>
    </div>
  </div>
</template>

<script>
export default {
  name: "CurrentHourLine",
  props: ["slotLinePercentage"],
  computed: {
    getSlotLinePosition() {
      return `top: ${this.slotLinePercentage}%;`;
    },
  },
};
</script>
