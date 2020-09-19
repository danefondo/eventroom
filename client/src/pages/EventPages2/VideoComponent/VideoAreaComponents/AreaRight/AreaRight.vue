<template>
  <div>
    Here is the right area 
    <div>
      <VideoBox 
        videoContainerId="right_1"
      />
    </div>
    <div>
      <VideoBox 
        videoContainerId="right_2"
      />
    </div>
    <div>
      <VideoBox 
        videoContainerId="right_3"
      />
    </div>
    <div>
      <VideoBox 
        videoContainerId="right_4"
      />
    </div>
    <div>
      <VideoBox 
        videoContainerId="right_5"
      />
    </div>
    
    
  </div>
</template>
<script>
import VideoBox from '../VideoBox/VideoBox';

export default {
  name: "AreaRight",
  components: {
    VideoBox,
  },



}
</script>