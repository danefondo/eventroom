<template>
  <div @click="selectSlot" :style="boxHeight" class="highlight-container">
    <div class="highlight-info">Select?</div>
  </div>
</template>

<script>
export default {
  name: "SlotHoverEmpty",
  props: ["slotData", "boxHeight"],
  methods: {
    selectSlot() {
      let slot = JSON.parse(JSON.stringify(this.slotData));
      this.$store.dispatch("booking/setBookerData", slot);

      let updateData = {
        targetSlot: slot,
        newSlotState: true,
        all: false,
        field: 0,
      };

      this.$store.dispatch("calendar/updateCalendarSelectedSlots", updateData);

      slot.isSelected = true;
      this.$store.dispatch("calendar/selectSlot", slot);
      this.$nextTick(function () {
        this.$store.dispatch("calendar/updateCalendarSlotAvailability", 1);
      });
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
