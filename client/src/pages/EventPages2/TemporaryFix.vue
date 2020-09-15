<template>
  <div>
    haha just kidding
  </div>
</template>
<script>
export default {
  name: "TemporaryFix",
  beforeRouteEnter (to, from, next) { // eslint-disable-line no-unused-vars
    console.log("HERE")
    console.log(to, from);
    this.$forceUpdate();
    next('/');
  }
}
</script>