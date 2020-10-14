<template>
<!-- If you change the input div's class, shortcut events will break in RoomBottomBar which prevents key shortcuts if event.target.classList.contains("eventroom-name") -->
  <div
    ref="editable"
    spellcheck="false"
    data-max-length="35"
    data-placeholder="Meeting title"
    :class="nameExists ? 'eventroom-name flex name-red' : 'eventroom-name flex'"
    contenteditable="true"
    v-once
    v-on:keypress="isLetterOrNumber($event)"
    v-html="eventroomName"
    :value="eventroomName"
    @input="$emit('input', $event.target.innerHTML)"
  >
    {{ eventroomName }}
  </div>
</template>

<script>
import { mapState } from "vuex";
import { maxlengthContentEditable } from "maxlength-contenteditable";
export default {
  name: "Editable",
  props: ["eventroomName", "initialName", "nameExists"],
  mounted() {
    this.$refs.editable.innerHTML = this.initialName;
    maxlengthContentEditable();
  },
  computed: {
    ...mapState({
      eventroom: (state) => state.eventroom.eventroomData,
    }),
  },
  methods: {
    isLetterOrNumber(e) {
      let char = String.fromCharCode(e.keyCode);
      if (/^[a-zA-Z0-9_-]*$/.test(char)) return true;
      else e.preventDefault();
    },
  },
  watch: {
    eventroomName: function (newName) {
      if (document.activeElement == this.$refs.editable) {
        return;
      }
      this.$refs.editable.innerHTML = newName;
    },

    "eventroom.eventroomName": function () {
      this.$refs.editable.innerHTML = this.eventroom.eventroomName;
    },
  },
};
</script>

<style scoped>
.name-red {
  border: 1px solid #ac01024f;
}
</style>