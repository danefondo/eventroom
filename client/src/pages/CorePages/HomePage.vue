<template>
  <div class="central-control-station">
    <div class="central-controls">
      <p class="welcome">Whaddddup!</p>
      <div v-if="isAuthenticated">
        <p class="notice">You are logged in.</p>
        <router-link to="/events/createEvent" class="button">Create an event</router-link>
      </div>
      <div v-if="!isAuthenticated">
        <p>You are not logged in.</p>
      </div>
    </div>
    <div class="title">Check out these events</div>
    <div v-if="events" class="events">
      <EventBox v-for="event in events" :key="event._id" :event="event" />
    </div>
  </div>
</template>

<script>
import auth from "../../config/auth";
import axios from "axios";
import EventBox from "../../components/EventDiscoveryComponents/EventBox";

export default {
  name: "HomePage",
  data() {
    return {
      isAuthenticated: false,
      isVerified: false,
      user: {},
      events: {},
    };
  },
  components: {
    EventBox,
  },
  mounted() {
    let authenticationResult = auth.isAuthenticated();
    if (authenticationResult) {
      this.user = authenticationResult;
      this.isVerified = authenticationResult.isVerified;
      this.isAuthenticated = true;
    }
    this.getAllEvents();
  },
  methods: {
    logout() {
      auth.logout();
    },
    async getAllEvents() {
      try {
        const { data } = await axios.get(`/api/events/getAllEvents`);
        this.events = data.events;
      } catch (error) {
        console.log("error", error);
      }
    },
  },
};
</script>

<style scoped>
.events {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 200px)) !important;
  gap: 20px;
  width: 700px;
  padding-top: 20px;
}
.welcome,
.title {
  font-size: 50px;
  font-weight: bold;
  margin-bottom: 5px;
}
.notice {
  font-size: 25px;
}
.central-control-station {
  display: flex;
  flex-direction: column;
  /* justify-content: center; */
  align-items: center;
  text-align: center;
  height: 100%;
}
.central-controls {
  max-width: 350px;
  margin-top: 104px;
  margin-bottom: 50px;
}
.button {
  outline: none;
  background-color: #493eff;
  color: white;
  font-size: 16px;
  font-weight: bold;
  border: unset;
  padding: 10px;
  width: 100%;
  border-radius: 3px;
  cursor: pointer;
  display: block;
  margin: 0 auto;
  margin-top: 25px;
  max-width: 250px;
}
.button:hover {
  background-color: #493effd1;
}
</style>