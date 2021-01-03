<template>
  <div class="tooltip_container">
    <div
      :class="tooltipState ? 'icon-button-active' : 'icon-button'"
      :style="getButtonSizes"
      @click="triggerTooltipFunction"
    >
      <IconBase
        :icon-name="iconName"
        :viewBox="viewBox"
        :width="iconWidth"
        :height="iconHeight"
        :iconColor="iconColor"
      >
        <component :is="icon"></component>
      </IconBase>
    </div>
    <div class="tooltip tooltip--top tooltip--middle">
      <span class="tooltip_tip">{{
        tooltipState ? activeText : defaultText
      }}</span>
      <span v-if="shortcutLetter" class="tooltip_shortcut">C</span>
    </div>
  </div>
</template>

<script>
import IconBase from "./IconBase";

export default {
  data() {
    return {};
  },
  props: [
    "icon",
    "iconName",
    "viewBox",
    "boxHeight",
    "boxWidth",
    "iconWidth",
    "iconHeight",
    "iconColor",
    "borderRadius",
    "activeText",
    "defaultText",
    "tooltipState",
    "shortcutLetter",
  ],
  components: {
    IconBase,
    IconRefresh: () =>
      import(/* webpackPrefetch: true */ "./SVG/IconRefresh.vue"),
    IconPreferences: () =>
      import(/* webpackPrefetch: true */ "./SVG/IconPreferences.vue"),
  },
  computed: {
    getButtonSizes() {
      return `height: ${this.boxHeight}px; width: ${this.boxWidth}px; border-radius: ${this.borderRadius}px;`;
    },
  },
  methods: {
    triggerTooltipFunction() {
      this.$emit("triggerTooltipFunction");
    },
  },
};
</script>

<style scoped>
.icon-button {
  /* border: 1px solid #ececec; */
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  position: relative;
  box-sizing: border-box;
}

.icon-button:hover {
  background-color: #f3f2f2;
  background-color: #f5f8f8;
}

.icon-button-active {
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  background-color: #ccc;
  position: relative;
  box-sizing: border-box;
}

.icon-button-active:hover {
  background-color: #ccc;
}

/*! CSS Used from: Embedded */
.tooltip {
  background: #040d1e;
  display: var(--tooltip-display);
  border-radius: 4px;
  color: white;
  filter: var(--tooltip-filter, none);
  flex-direction: row;
  flex-shrink: 0;
  font-weight: normal;
  font-size: 12px;
  padding: 6px 12px;
  position: absolute;
  text-align: center;
  transform: translate(var(--translateX, 0), var(--translateY, 0));
  white-space: nowrap;
  z-index: 10001;
}

.tooltip--top {
  --translateY: 210%;
  top: 0;
}
.tooltip--top::before {
  bottom: 0;
  transform: rotate(45deg) translate(-50%, 50%);
  transform-origin: left bottom;
}
.tooltip--top.tooltip--middle {
  --translateX: -50%;
  left: 50%;
}
.tooltip--top.tooltip--middle::before {
  left: 50%;
}
.tooltip_container {
  --tooltip-display: none;
  display: inline-flex;
  position: relative;
  margin-right: 10px;
}
@media (hover: hover) {
  .tooltip_container:hover {
    --tooltip-display: flex;
  }
}
.tooltip_shortcut {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
  color: #adb6d1;
  margin-left: 8px;
  padding: 1px 5px;
  text-transform: uppercase;
}
</style>