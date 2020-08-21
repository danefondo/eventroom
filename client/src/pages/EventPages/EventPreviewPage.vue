<template>
  <div class="event-container">
    <div v-if="event && room" class="event">
      <div class="event-title">{{ event.name }}</div>
      <div v-html="event.description" class="event-description"></div>
      <router-link class="button" :to="`/events/${event._id}/rooms/${room._id}`">Enter room</router-link>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';

import axios from "axios";

export default {
  name: "EventPreviewPage",
  data() {
    return {
      event: {},
      room: {},
      eventName: "",
      eventDescription: "",
      eventNotFound: false,
      roomNotFound: false,
    };
  },
  
  computed: {
    ...mapState({
      user: state => state.user,
      isAuthenticated: state => state.authenticationStatus,
      isVerified: state => state.verificationStatus,
    })
  },

  async mounted() {
    this.getEvent();
  },
  methods: {
    async getEvent() {
      try {
        const { data } = await axios.get(
          `/api/events/getEvent/${this.$route.params.id}`
        );
        this.eventNotFound = false;
        this.roomNotFound = false;

        this.event = data.event;
        this.room = data.room;
      } catch (error) {
        console.log("event", error);
        this.eventNotFound = true;
        this.roomNotFound = true;
      }
    },
    // async getRoom() {
    //   try {
    //     const { data } = await axios.get(
    //       `/api/events/${this.$route.params.id}/rooms/${this.event.defaultRoomId}`
    //     );
    //     this.roomNotFound = false;
    //     this.room = data.room;
    //   } catch (error) {
    //     console.log("event", error);
    //     this.roomNotFound = true;
    //   }
    // },
  },
  // watch: {
  //   event: function() {
  //     if (this.event) {
  //       this.getRoom();
  //       //- In  the future, 'getEventRooms', as an Event could have several rooms
  //     }
  //   }
  // }
};
</script>

<style scoped>
.event-title {
  font-size: 47px;
  margin-bottom: 20px;
}
.event-container {
  display: flex;
  flex-direction: column;
  /* justify-content: center; */
  align-items: center;
  text-align: center;
  height: 100%;
}
.event {
  margin-top: 52px;
}
</style>