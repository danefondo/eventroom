<template>
  <div class="settings">
    <div class="sidebar-container">
      <div class="sidebar-header flex pbt-16 plr-16">
        <h1 data-v-6b4e9726="" class="sidebar-title flex">Settings</h1>
        <img
          @click="toggleToolbar('settings')"
          :src="cancelIcon"
          class="cancelIcon"
        />
      </div>
      <div class="sidebar-inner"></div>
    </div>
  </div>
</template>

<script>
import cancelIcon from "../../../../assets/images/cancel.png";
import { mapState } from "vuex";
export default {
  name: "RoomSettings",

  data() {
    return {
      cancelIcon: cancelIcon,
    };
  },
  computed: {
    ...mapState({
      leftSidebar: (state) => state.toolbar.containersConfig.leftSidebar,
      settings: (state) => state.toolbar.toolbarConfig.settings,
    }),
  },
  methods: {
    toggleToolbar(toolbarTool) {
      let data = {
        toolbarTool,
      };

      if (this.settings == true) {
        data.boolean = false;
        this.$store.dispatch("toolbar/toggleToolbar", data);
      } else if (this.settings == false) {
        data.boolean = true;
        this.$store.dispatch("toolbar/toggleToolbar", data);
      }
    },
  },
};
</script>
<style scoped>
.sidebar-left {
  width: 300px;
  background-color: #9e9e9e38;
  height: 100%;
  flex: 0 0 auto;
}
.sidebar-header {
  height: 40px;
  background-color: white;
  border-bottom: 1px solid #e0e4f0;
  justify-content: space-between;
  text-transform: capitalize;
  width: calc(100% - 34px);
  margin-left: 1px;
  color: #1e2f58;
}

.sidebar-container {
  width: 300px;
}

.sidebar-title {
  font-size: 18px;
  font-weight: 700;
}

.cancelIcon {
  width: 14px;
  height: 14px;
  padding: 8px;
  border-radius: 20px;
  cursor: pointer;
}

.cancelIcon:hover {
  background-color: #e5e8ef;
}

.flex {
  align-items: center;
  display: flex;
}

.pbt-16 {
  padding-bottom: 16px !important;
  padding-top: 16px !important;
}

.plr-16 {
  padding-left: 16px !important;
  padding-right: 16px !important;
}

.pl-16 {
  padding-left: 16px !important;
}

.pr-16 {
  padding-right: 16px !important;
}
</style>
