<template>
  <div>
    Hi, my name is 
  </div>
</template>

<script>
export default {
  name: "ProfilePage",
  async beforeRouteEnter (to, from, next) {
    
    next();
  },
  data() {
    return {
      user: {},
      
    }
  },
}

</script>
