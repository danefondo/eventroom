<template>
  <div :style="boxHeight" class="booked-container">
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
  background-color: #eef1f3;
  border-radius: 4px;
  height: 95%;
  width: 95%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  flex-direction: column;
  justify-content: space-around;
  height: 88%;
  /* background-color: #f7f7fb; */
  background-color: #f7f7fbad;
  background-color: #fafafc;
  /* border: 1px solid #a3a3ff33; */
  border: 1px solid #d8d8d833;
}

.booked-time {
  /* background-color: #dcdfe0; */
  padding: 1px 6px;
  /* padding-right: 22px; */
  border-radius: 360px;
  /* border-top-left-radius: 10px; */
  /* border-bottom-right-radius: 32px; */
  font-size: 13px !important;
  font-weight: bold;
  /* color: #5600ff;
  color: #310090cc; */
  color: #b7b7ca;
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
  top: 23px;
  left: 10px;
  /* color: #5600ff; */
  font-size: 18px;
  font-weight: 700;
  text-transform: capitalize;
}

.booked-title-unmatched {
  color: #343556bf;
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