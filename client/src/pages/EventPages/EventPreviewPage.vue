<template>
  <div class="event-container">
    <div v-if="!ready">
      Loading event...
    </div>
    <div v-else>
      <div v-if="eventExists" class="event">
        <div class="event-title">{{ event.name }}</div>
        <div v-html="event.description" class="event-description"></div>
        <div v-if="event.scheduledStartTime" class="eventDatetime">
          <div class="eventDate">{{ getEventDate(event)}}</div>
          <div class="eventTime">{{ getEventTime(event) }}</div>
        </div>
        <div v-if="rooms && rooms.length != 0">
          Join existing rooms!
          <div v-for="(room, index) in rooms" :key="index">
            <router-link class="button" :to="`/events/${event._id}/rooms/${room}`">Enter room</router-link>
          </div>
        </div>
        <div v-else>
          There are currently no rooms available!
        </div>
        <div v-if="roomCreationAllowed || userIsHost || userIsAdmin">
          You can create your own room!
          <button @click="createRoom" class="button">Create your own room!</button>
        </div>
        <div v-else>
          Unfortunately, the event host has not allowed you to create your own rooms!
        </div>
      </div>
      <div v-else>
        Could not find event!
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";

import axios from "axios";
import { requestWithAuthentication } from '../../config/api';

export default {
  name: "EventPreviewPage",
  data() {
    return {
      ready: false,
      userIsHost: false,
      userIsAdmin: false,   // for future purposes
      // Event data
      event: {},
      rooms: [],
      eventName: "",
      eventDescription: "",
      roomCreationAllowed: false,
    };
  },

  computed: {
    ...mapState({
      user: state => state.auth.user,
      isAuthenticated: state => state.auth.authenticationStatus,
      isVerified: state => state.auth.verificationStatus,
    }),
    eventExists: function() {
      return this.event && this.event != {};
    }
  },

  async mounted() {
    this.getEvent();
  },
  methods: {
    async getEvent() {
      try {
        const { data } = await axios.get(`/api/events/getEvent/${this.$route.params.id}`);
        console.log("@getevent", data);
        if (!data.event) throw new Error("No event!");
        

        this.event = data.event;
        this.rooms = data.event.rooms;
        this.roomCreationAllowed = data.event.roomCreationAllowed;
        this.setUserStatus();
        this.ready = true;
      } catch (error) {
        console.log("@getevent", error);
        this.ready = true;
      }
    },
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
    async createRoom() {
      console.log("creating room?")
      try {
        const { data } = await requestWithAuthentication('post', `/api/events/createRoom/${this.$route.params.id}`, {
          hostId: this.event.hostId,
        });
        console.log("@createroom", data);
        this.rooms.push(data.room._id);
      } catch (error) {
        console.log("@creatroom error", error);
      }
    },
    setUserStatus() {
      if (this.user && this.event) {
        this.userIsHost = this.user._id == this.event.hostId;
        this.userIsAdmin = false;     // future stuff unnecessary atm
      }
    }

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