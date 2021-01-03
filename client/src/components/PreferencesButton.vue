<template>
  <TooltipIcon
    icon="IconPreferences"
    iconName="Preferences"
    viewBox="0 0 64 64"
    boxHeight="40"
    boxWidth="40"
    iconWidth="22"
    iconHeight="22"
    iconColor="#3d3d3d"
    borderRadius="360"
    defaultText="Customize your preferences"
    activeText="Syncing calendar..."
    styleOne=""
    :tooltipState="currentlyRefreshingData"
    @triggerTooltipFunction="togglePreferences"
  />
</template>

<script>
import TooltipIcon from "./TooltipIcon";

export default {
  name: "PreferencesButton",
  props: ["currentlyRefreshingData"],
  components: {
    TooltipIcon,
  },
  methods: {
    togglePreferences() {
      this.$store.dispatch("cofocusPreferences/togglePreferences");
    },
  },
};
</script>