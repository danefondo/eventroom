<template>
  <div @click="selectSession" :style="boxHeight" class="booked-container">
    <div class="booked-info">
      <span class="booked-time">{{ sessionTime }}</span>
      <span class="booked-title">{{ `${matchedPartnerName}` }}</span>
    </div>
  </div>
</template>

<script>
export default {
  name: "PastSession",
  props: [
    "slotData",
    "boxHeight",
    "profileImage",
    "profileName",
    "sessionTime",
    "user",
    "matchedPartnerName",
  ],
  methods: {
    selectSession() {
      console.log("Old session has been selected!");
    },
  },
};
</script>
<style scoped>
.booked-container {
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  width: 100%;

  z-index: 999;
}

.booked-info {
  background-color: #ffffff;
  height: 95%;
  width: 95%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  pointer-events: auto;
  box-shadow: 0px 1px 3px 0px #f2f5f5;
  border-radius: 2px;
  color: #c8cece;
  font-size: 16px;
  /* border: 1px solid #f7f7f9; */
  box-shadow: 0px 1px 2px 0px #d0d0d0;
}

.booked-time {
  padding: 1px 6px;
  /* padding-right: 22px; */
  border-radius: 360px;
  /* border-top-left-radius: 10px; */
  /* border-bottom-right-radius: 32px; */
  font-size: 13px !important;
  font-weight: bold;
  color: #d3d6d6;
  margin-right: auto;
  /* margin-top: -5px; */
  font-weight: 800;
  /* margin-left: 8px; */
  position: absolute;
  top: 8px;
  left: 6px;
  /* background-color: #f6f2ff; */
  /* background-color: #ebecfb; */
}

.booked-title,
.booked-title-unmatched {
  color: #343556de;
  position: absolute;
  top: 25px;
  left: 10px;
  /* color: #5600ff; */
  font-size: 17px;
  font-weight: 700;
  text-transform: capitalize;
  white-space: nowrap;
  width: 110px;
  text-overflow: ellipsis;
  overflow: hidden;
  text-align: left;
}

.booked-title-unmatched {
  color: #555a5e;
  text-transform: none;
  text-align: left;
}

.join-session {
  position: absolute;
  left: 10px;
  bottom: 5px;
  padding: 2px 12px;
  border-radius: 360px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  background-color: #ebecfb;
  color: #5600ff;
  font-size: 17px;
  outline: none;
  border: none;
}

.join-session:hover {
  background-color: #b4b8b9;
}

.selected-close {
  position: absolute;
  right: 5px;
  top: 5px;
  width: 16px;
  height: 16px;
  line-height: 17px;
  border-radius: 360px;
  display: flex;
  box-sizing: border-box;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  text-align: center;
}

.selected-close:hover {
  background-color: #dcdfe0;
}
</style>