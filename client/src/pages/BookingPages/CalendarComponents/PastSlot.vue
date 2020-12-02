<template>
  <div class="past-container tooltip">
    <!-- <span id="tooltip-span"> This hour has passed. </span> -->
    <div @mousemove="showIsPast" class="past-inner tooltip">
      <span id="tooltip-span"> This hour has passed. </span>
    </div>
  </div>
</template>

<script>
export default {
  name: "PastSlot",
  methods: {
    showIsPast(e) {
      // if (!document.hidden) {
      let tooltip = e.target.children[0];
      if (tooltip) {
        var x = e.clientX,
          y = e.clientY;
        tooltip.style.top = y + 20 + "px";
        tooltip.style.left = x + 20 + "px";
      }
      // }
    },
  },
};
</script>
<style scoped>
.past-container {
  /* display: flex;
  align-items: center;
  justify-content: center;
  height: 70px;
  cursor: default;
  margin-top: 5px; */

  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  width: 100%;
  height: calc(100px / 4);
  z-index: unset;
  /* background: repeating-linear-gradient(
    -55deg,
    transparent,
    transparent 5px,
    #f5f5f5 5px,
    #f5f5f5 14px
  ); */
  /* background: repeating-linear-gradient(
    135deg,
    transparent,
    transparent 5px,
    #f5f5f5 5px,
    #f5f5f5 10px
  ); */
  /* background: repeating-linear-gradient(
    -55deg,
    transparent,
    transparent 8px,
    #f5f5f5 5px,
    #f5f5f5 15px
  );
  background: repeating-linear-gradient(
    -55deg,
    transparent,
    transparent 5px,
    #f5f5f5 5px,
    #f5f5f5 15px
  );
  background-color: white; */
}

.past-inner {
  background-color: #eef1f3;
  border-radius: 4px;
  height: 95%;
  width: 95%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  cursor: default;

  background: repeating-linear-gradient(
    -55deg,
    transparent,
    transparent 5px,
    #f5f5f5 5px,
    #f5f5f5 15px
  );
  background-color: white;
}

.tooltip {
  text-decoration: none;
  position: relative;
}
.tooltip span {
  display: none;
  z-index: 9999;
  background-color: white;
  padding: 4px 8px;
  border-radius: 360px;
}
.tooltip:hover span {
  display: block;
  position: fixed;
  overflow: hidden;
}
</style>
