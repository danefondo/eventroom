<template>
  <div class="event-discovery">
    <div v-if="coreEvents" class="events-core">
      <EventPreviewBoxComponent v-for="event in coreEvents" :key="event._id" :event="event" />
    </div>
    <div>
        <p>You have no events planned.</p>
    </div>
  </div>
</template>

<script>
import EventPreviewBoxComponent from "../components/EventDiscoveryComponents/EventPreviewBoxComponent";

export default {
  name: "EventDiscoveryPage",
  data() {
      return {
          allEvents: {},
          coreEvents: {},
      };
  },
  components: {
    EventPreviewBoxComponent,
  },
  async mounted() {
      try {
          const { data } = await axios.get(`/api/events/getAllEvents`);
          this.allEvents = data.events;
        //   const { data } = await axios.get(`/api/events/getCoreEvents`);
        //   this.coreEvents = data.events;
      } catch (error) {
          console.log("Error getting core videos: ", error);
      }
  }
};
</script>


<style scoped>
</style>
