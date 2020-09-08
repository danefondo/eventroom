<template>
  <router-link class="event" :to="'/events/'+event._id">
    <div class="event-meta-container">
      <div class="event-name-container">
        <div class="event-name">{{event.name}}</div>
      </div>
      <div class="event-desc-container">
        <div class="event-desc" v-html="event.description"></div>
      </div>
      <div v-if="event.scheduledStartTime" class="eventDatetime">
        <div class="eventDate">{{ getEventDate(event)}}</div>
        <div class="eventTime">{{ getEventTime(event) }}</div>
      </div>
    </div>
  </router-link>
</template>

<script>
export default {
  name: "EventBox",
  props: {
    event: Object,
  },
  mounted() {
    console.log("@mounted eventbox: ", this.event);
  },
  methods: {
    getEventTime(event) {
      let time;
      if (event.scheduledStartTime) {
        time = event.scheduledStartTime;
        time = new Date(time);
        const options = { hour: "2-digit", minute: "2-digit" };
        time = time.toLocaleTimeString("et-EE", options);
      }
      return time;
    },
    getEventDate(event) {
      let date;
      if (event.scheduledStartTime) {
        date = event.scheduledStartTime;
        date = new Date(date);
        const options = { month: "long", day: "numeric" };
        date = date.toLocaleDateString("et-EE", options);
      }
      return date;
    },
  },
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