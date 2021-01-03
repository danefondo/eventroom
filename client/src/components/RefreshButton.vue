<template>
  <TooltipIcon
    icon="IconRefresh"
    iconName="Refresh"
    viewBox="0 0 512 512"
    boxHeight="40"
    boxWidth="40"
    iconWidth="22"
    iconHeight="22"
    iconColor="#3d3d3d"
    borderRadius="360"
    defaultText="Manually refresh calendar data"
    activeText="Syncing calendar..."
    styleOne=""
    :tooltipState="currentlyRefreshingData"
    @triggerTooltipFunction="refreshCalendarData"
  />
</template>

<script>
import TooltipIcon from "./TooltipIcon";

export default {
  name: "RefreshButton",
  props: ["currentlyRefreshingData"],
  components: {
    TooltipIcon,
  },
  methods: {
    refreshCalendarData() {
      this.$emit("refreshCalendarData");
    },
  },
};
</script>