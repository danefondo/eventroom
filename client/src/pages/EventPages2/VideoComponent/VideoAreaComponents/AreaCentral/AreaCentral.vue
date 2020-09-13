<template>
  <div>
    Here is the central area. Pick layout: 
    <select v-model="layout">
      <option disabled value="">Select layout </option>
      <option>0</option>
      <option>1</option>
      <option>2</option>
      <option>3</option>
    </select>
    <button @click="changeLayout">Pick</button> 
    
    <div v-show="centralLayoutError"> 
      There was an error. Please consult god.
    </div>
    <div v-show="!centralContainsStreams || centralLayout_0">
      <EmptyVideoPanel />
    </div>
    <div v-show="centralContainsStreams && centralLayout_1">
      <VideoBox 
        videoContainerId="central_1"
      />
    </div>
    <div v-show="centralContainsStreams && centralLayout_2">
      <VideoBox 
        videoContainerId="central_2_1"
      />
      <VideoBox 
        videoContainerId="central_2_2"
      />
    </div>
    <div v-show="centralContainsStreams && centralLayout_3">
      <VideoBox 
        videoContainerId="central_3_1"
      />
      <VideoBox 
        videoContainerId="central_3_2"
      />
      <VideoBox 
        videoContainerId="central_3_3"
      />
      <VideoBox 
        videoContainerId="central_3_4"
      />
    </div>
  </div>
</template>
<script>
import { mapState, mapGetters } from 'vuex';

import SessionController from "../../../../../session/SessionController";

import EmptyVideoPanel from './EmptyVideoPanel';
import VideoBox from '../VideoBox/VideoBox';

export default {
  name: "AreaCentral",
  components: {
    EmptyVideoPanel,
    VideoBox,
  },
  data () {
    return {
      layout: "0",
    }
  },
  computed: {
    ...mapState({
      publisherSpotlighted: state => state.session.publisherSpotlighted,
      centralLayoutType: state => state.session.centralLayoutType,
    }),
    ...mapGetters({
      centralContainsStreams: ['session/centralContainsStreams']
    }),
    centralLayout_0: function() { return this.centralLayoutType === "0"; }, // should never happen
    centralLayout_1: function() { return this.centralLayoutType === "1"; },
    centralLayout_2: function() { return this.centralLayoutType === "2"; },
    centralLayout_3: function() { return this.centralLayoutType === "3"; },
    centralLayoutError: function() { 
      return !(this.centralLayout_0 || this.centralLayout_1 || this.centralLayout_2 || this.centralLayout_3);
    }
  },
  methods: {
    changeLayout() {
      console.log("@changelayout");
      SessionController.setCentralLayout(this.layout);
      console.log("@change leyout new layout:", this.centralLayoutType);
    }
  }
}
</script>
<style scoped>
</style>