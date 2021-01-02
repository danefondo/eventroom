<template>
  <div @click="selectSlot">
    <div class="booked-unmatched-container">
      <div class="booked-unmatched-info">
        <ik-image
          loading="lazy"
          :transformation="[{ height: 60, width: 60 }]"
          v-if="profileImage"
          :src="profileImage"
          class="calendar-profile-icon"
        />
        <div v-else class="calendar-profile-icon borderless">
          <IconBase
            icon-name="profile"
            iconColor="#aeaeae"
            viewBox="0 0 311.541 311.541"
            width="27"
            height="27"
            ><IconProfile
          /></IconBase>
        </div>
        <span class="unmatched-title">{{ profileName }}</span>
      </div>
    </div>
  </div>
</template>

<script>
import IconBase from "../../../components/IconBase";
import IconProfile from "../../../components/SVG/IconProfile";

export default {
  name: "UnmatchedPerson",
  props: ["slotDateTime", "profileImage", "profileName"],
  components: {
    IconBase,
    IconProfile,
  },
  methods: {
    selectSlot() {
      this.$emit("unselectedSlotSelected", this.slotDateTime);
    },
  },
};
</script>
<style scoped>
.booked-unmatched-container {
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  width: 100%;

  z-index: 999;
}

.booked-unmatched-container {
  height: calc(105px / 4);
  margin-top: 5px;

  z-index: unset;
}

.booked-unmatched-info {
  background-color: #eef1f3;
  border-radius: 4px;
  height: 95%;
  width: 95%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.booked-unmatched-info {
  /* background-color: #eaedfb; */
  background-color: #fafafc;
  border: 1px solid #d8d8d833;
}

.unmatched-title {
  position: absolute;
  /* left: 40px; */
  left: 45px;
  font-size: 18px;
  color: #343556;

  z-index: 999;
}

.calendar-profile-icon {
  /* width: 25px !important;
  height: 25px !important; */
  width: 27px !important;
  height: 27px !important;
  border-radius: 360px;
  position: absolute;
  left: 7px;
  border: 1px solid #a1a4ae;

  z-index: 999;
}
</style>
