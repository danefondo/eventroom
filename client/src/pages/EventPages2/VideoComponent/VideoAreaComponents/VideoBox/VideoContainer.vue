<template>
  <!-- 
  If you want to modify video container size, shape or whatever, change the div with class 'video-container'
  This file should *NOT* be changed in any other way, or the world will collapse and the aliens will eat us all
  -->
  <div class="video-container">
    <!-- This div SHOULD NOT BE DELETED OR MODIFIED -->
    <div :id="videoContainerId"></div>
    <!-- but its position can be changed tho -->
  </div>
</template>
<script>
export default {
  name: "VideoContainer",
  props: {
    videoContainerId: String,
  }
}
</script>
<style scoped>
</style>