<template>
  <transition name="fade">
    <div class="alert" :style="alertStyle" v-if="showAlert">
      {{ alertMessage }}
    </div>
  </transition>
</template>

<script>
export default {
  name: "Alert",
  props: ["alertStyle", "alertMessage", "showAlert"],
};
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s;
}
.fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
  opacity: 0;
}
</style>