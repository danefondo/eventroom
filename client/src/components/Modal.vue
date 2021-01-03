<template>
  <div class="modal" @click.self="togglePreferences">
    <component :is="type"></component>
  </div>
</template>

<script>
export default {
  name: "Modal",
  props: ["type"],
  components: {
    PreferenceSettings: () =>
      import(/* webpackPrefetch: true */ "./PreferenceSettings.vue"),
  },
  methods: {
    togglePreferences() {
      this.$store.dispatch("cofocusPreferences/togglePreferences");
    },
  },
};
</script>

<style scoped>
.modal {
  position: absolute;
  z-index: 25000;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.4);
  overflow: auto;
}
</style>