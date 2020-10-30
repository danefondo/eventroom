<template>
  <div class="settings">
    <div class="sidebar-container">
      <div :style="styleSidebarTitle" class="sidebar-header flex pbt-16 plr-16">
        <h1 class="sidebar-title flex">Participants</h1>
        <img
          @click="toggleToolbar('participants')"
          :src="cancelIcon"
          class="cancelIcon"
        />
      </div>
      <div class="sidebar-inner">
        <h1 class="participants-count flex">
          {{ participantsList.length }} participants
        </h1>
        <div class="participants" v-if="participantsList">
          <Participant
            v-for="participant in participantsList"
            :key="participant.userId"
            :participant="participant"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import cancelIcon from "../../../../assets/images/cancel.png";
import { mapState } from "vuex";
import Participant from "./Participant";

export default {
  name: "Participants",

  data() {
    return {
      cancelIcon: cancelIcon,
      themeCoreColor: "#111158",
    };
  },
  computed: {
    ...mapState({
      leftSidebar: (state) => state.toolbar.containersConfig.leftSidebar,
      participants: (state) => state.toolbar.toolbarConfig.participants,
      participantsList: (state) => state.participants.participantsData,
    }),
    styleSidebarTitle() {
      return `color: ${this.themeCoreColor};`;
    },
  },
  components: {
    Participant,
  },
  methods: {
    toggleToolbar(toolbarTool) {
      let data = {
        toolbarTool,
      };

      if (toolbarTool) {
        data.boolean = !this[toolbarTool];
        this.$store.dispatch("toolbar/toggleToolbar", data);
      }
    },
  },
};
</script>
<style scoped>
.participants {
  /* padding-top: 10px; */
}

.participants-count {
  padding: 15px 20px;
  font-size: 17px;
  color: #a7adbd;
  font-weight: 600;
}

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
  /* color: #1e2f58; */
  color: #323b50;
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
