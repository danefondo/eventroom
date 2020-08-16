<template>
  <router-link class="event" :to="'/events/'+event._id">
    <div class="event-meta-container">
      <div class="event-name-container">
        <div class="event-name">{{event.name}}</div>
      </div>
      <div class="event-desc-container">
        <div class="event-desc" v-html="event.description"></div>
      </div>
    </div>
  </router-link>
</template>

<script>
export default {
  name: "EventBox",
  props: ["event"],
};
</script>

<style scoped>
.event {
  border-radius: 3px;
  width: 200px;
  height: 150px;
  border: 1px solid #aaa;
  padding: 10px;
}
.event:hover {
  background-color: #493efe;
  color: white;
}
.event-name {
  font-size: 25px;
}
</style>