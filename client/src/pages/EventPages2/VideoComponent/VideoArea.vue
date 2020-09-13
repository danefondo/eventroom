<template>
  <div>
    <AreaCentral class="area-central" /> 
    <AreaRight class="area-right" />
  </div>
</template>
<script>
import SessionController from "../../../session/SessionController";

import AreaCentral from './VideoAreaComponents/AreaCentral/AreaCentral';
import AreaRight from './VideoAreaComponents/AreaRight/AreaRight';


export default {
  name: "VideoArea",
  components: {
    AreaCentral,
    AreaRight,
  },
  data() {
    return {
    }
  },
  mounted() {
    this.$nextTick( function() {
      try {
        SessionController.initSession();
      } catch (err) {
        console.log("could not init session");
      }
    })
  }
}
</script>
<style scoped>
/* Only for debugging */
* {
  box-sizing: border-box;
}
.area-central {
  float: left;
  border: 2px solid blue;
  width: 72vw;
}
.area-right {
  float: right;
  border: 2px solid green;
  max-width: 24vw;
}
</style>