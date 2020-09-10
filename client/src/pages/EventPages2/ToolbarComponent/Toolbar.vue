<template>
  <div class="toolbar-container">
    <div class="toolbar">
      <div class="toolbar-element" v-for="(icon, index) in iconList" :key="index">
        <div class="toolbar-element-container" @click="openTool(index)">
          <component :is="icon" > </component>
        </div>
      </div>

    </div>
    <div class="item-field">
      <!-- Siia tuleb klikkides see elemendi enda vaade - settings või yt search vms -->
      <div v-if="toolOpened">
        <component :is="openedComponent" @submitPreferences="submitPreferences"> </component>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import { requestWithAuthentication } from '../../../config/api';

import EmptyIcon from './ToolbarComponents/EmptyComponent/EmptyIcon' 
import YTSearchIcon from './ToolbarComponents/YTSearchComponent/YTSearchIcon' 
import YTSearch from './ToolbarComponents/YTSearchComponent/YTSearch' 
import PreferencesIcon from './ToolbarComponents/PreferencesComponent/PreferencesIcon' 
import Preferences from './ToolbarComponents/PreferencesComponent/Preferences' 

export default {
  name: "Toolbar",
  components: {
    EmptyIcon,
    YTSearchIcon,
    YTSearch,
    PreferencesIcon,
    Preferences,
  },
  data() {
    return {
      errors: false,
      toolbarConfiguration: [],

      toolOpened: false,
      openedComponent: "",
    };
  },
  computed: {
    ...mapState({
      user: (state) => state.auth.user,
    }),
    iconList: function() {
      let icons = [];
      let lastOccupiedPosition = -1;
      for (let i=0; i<this.toolbarConfiguration.length; i++) {
        
        let currentConfiguration = this.toolbarConfiguration[i];
        if (!currentConfiguration.visible) continue;
        for (let j=0; j<(currentConfiguration.position-1-lastOccupiedPosition); j++) {
          icons.push("EmptyIcon");
        }
        lastOccupiedPosition = currentConfiguration.position;
        icons.push(currentConfiguration.name+"Icon");
      }
      return icons;
    }
  },
  async created() {
    console.log("created: ", this);
    console.log("created: children: ", this.$children);
    await this.getToolbarConfiguration();
  },
  methods: {
    async getToolbarConfiguration() {
      try {
        const requestParams = {
          userId: this.user._id,
        }

        const { data } = await requestWithAuthentication('get', `/api/accounts/getuserconfigurations/eventroom/toolbarconfigurations`, null, requestParams);
        if (!data.eventroomToolbar) throw new Error("no configurations");
        this.toolbarConfiguration = data.eventroomToolbar.sort(this.compareConfiguration);

      } catch (err) {
        this.errors = true;
      }
    },
    async setToolbarConfiguration(newConfiguration) {
      try {
        const { data } = await requestWithAuthentication('post', `/api/accounts/setuserconfigurations/eventroom/toolbarconfigurations`, newConfiguration);
        if (!data.eventroomToolbar) throw new Error("no configurations");
        
        this.toolbarConfiguration = data.eventroomToolbar.sort(this.compareConfiguration);
      } catch (err) {
        this.errors = true;
        console.log("@toolbar set data error:", err);
      }
    },
    compareConfiguration(a, b) {
      if (a.position < b.position) return -1;
      if (a.position > b.position) return 1;
      return 0;
    },
    openTool(index) {      
      const componentIconName = this.iconList[index];
      const componentName = componentIconName.substr(0, componentIconName.length-4);
      if (componentName != "Empty") {
        this.openedComponent = componentName;
        this.toolOpened = true;
      } else {
        this.toolOpened = false;
      }
    },
    async submitPreferences(preferences) {
      preferences.userId = this.user._id;
      await this.setToolbarConfiguration(preferences);
    }
  }

}
</script>
<style scoped>
/* Only for debugging */
* {
  box-sizing: border-box;
}
.toolbar {
  float: left;
  width: 48px;
  height: 100%;
  border: 2px solid red;
}
.toolbar-element {
  max-height: 48px;
  border: 2px solid blue;
}
.item-field{
  float: left;
  max-width: 300px;
  border: 2px solid black;
}
</style>
