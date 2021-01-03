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

      slot.isSelected = true;
      this.$store.dispatch("calendar/selectSlot", slot);

      let updateData = {
        targetSlot: slot,
        newSlotState: true,
        all: false,
        field: 0,
      };
      this.$store.dispatch("calendar/updateCalendarSelectedSlots", updateData);

      this.$store.dispatch("booking/setBookerData", slot);

      this.$nextTick(function () {
        // In case user tried to selected slot in the past
        this.$store.dispatch("calendar/removeSelectionsInThePast");
        this.$store.dispatch("calendar/updateCalendarSlotAvailability", 1);
        this.scrollToNewestSelection();
      });
    },

    scrollToNewestSelection() {
      let selections = document.getElementById("groups");

      let selectionTimeInMS = new Date(this.slotData.dateTime).valueOf();

      let latestSelection = document.getElementById(selectionTimeInMS);
      let topPos = latestSelection.offsetTop;

      selections.scrollTop = topPos - 10;

      this.handleSelectionInView(latestSelection);
      setTimeout(() => {
        this.handleSelectionInView(latestSelection);
      }, 300);
    },

    handleSelectionInView(selection) {
      if (selection.classList.contains("just-selected")) {
        console.log("here");
        selection.classList.remove("just-selected");
      } else {
        console.log("ADD");
        selection.classList.add("just-selected");
      }
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
  background-color: #f5f8f8;
  border-radius: 4px;
  height: 95%;
  width: 95%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  pointer-events: auto;
  box-shadow: 0px 1px 2px 0px #cccccc;
  border-radius: 2px;
  color: #525252;
  font-size: 16px;
}
</style>
