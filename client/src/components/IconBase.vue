<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    xmlns:xlink="http://www.w3.org/1999/xlink"
    :width="width"
    :height="height"
    :viewBox="viewBox"
    :aria-labelledby="iconName"
    role="presentation"
  >
    <title :id="iconName" lang="en">{{ iconName }} </title>
    <g :fill="iconColor" :stroke="iconColor">
      <slot />
    </g>
  </svg>
</template>

<script>

//- The idea is to style all the path super specific styles in the svg vue component and just change the color; this means removing all stroke & fill colors from all SVG vue path styles;

export default {
  props: {
    iconName: {
      type: String,
      default: "box",
    },
    width: {
      type: [Number, String],
      default: 18,
    },
    height: {
      type: [Number, String],
      default: 18,
    },
    iconColor: {
      type: String,
      default: "currentColor",
    },
    viewBox: {
        type: String,
        default: "0 0 18 18",
    },
  },
};
</script>

<style scoped>
svg {
  display: inline-block;
  vertical-align: baseline;
}
</style>