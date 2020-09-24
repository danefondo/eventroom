<template>
  <div class="central-control-station">
    <span class="welcome">Setup meetings faster than you can blink.</span>
    <div class="central-controls">
      <label class="room-creator">
        <span class="eventroom">eventroom.to/</span>
        <input class="slug" :placeholder="slug" :value="slug" autofocus="autofocus" spellcheck="false" />
      </label>
      <div v-if="isAuthenticated">
        <router-link to="/events/createEvent" class="create">Create room</router-link>
      </div>
      <div v-if="!isAuthenticated">
        <p>You are not logged in.</p>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";

import auth from "../../config/auth";
import axios from "axios";
import { slug } from "../../config/slugGenerator/slug";
// import EventBox from "../../components/EventDiscoveryComponents/EventBox";

export default {
  name: "DashboardPage",
  data() {
    return {
      events: {},
      slug: "",
    };
  },
  //   components: {
  //     EventBox,
  //   },
  computed: {
    ...mapState({
      user: (state) => state.auth.user,
      isAuthenticated: (state) => state.auth.authenticationStatus,
      isVerified: (state) => state.auth.verificationStatus,
    }),
  },
  async mounted() {
    this.getAllEvents();
    this.customSlug();
  },
  methods: {
    logout() {
      auth.logout();
    },
    customSlug() {
      var AAA = /^([a-z]+){3}$/;
      let slugWord = slug();
      slugWord = slugWord.toLowerCase();
      slugWord.match(AAA);
      this.slug = slugWord;
    },
    async getAllEvents() {
      try {
        const { data } = await axios.get(`/api/events/getAllEvents`);
        console.log("@home data", data);
        this.events = data.events;
      } catch (error) {
        console.log("error", error);
      }
    },
  },
};
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&display=swap");
/* COLORS
seashell
whitesmoke
lavender
lavenderblush
 */

/* .room-creator {
     display: flex;
     align-items: center;
 } */

.slug {
  font-size: 50px;
  width: 416px;
  margin-left: 3px;
  padding: 5px;
  padding-left: 10px;
  font-family: "Nunito", sans-serif;
  border: none;
  font-weight: 400;
  border-radius: 4px;
  color: #6e00ff;
  background-color: #f7f7fb;
}
.slug:focus {
  outline: none;
  background-color: #f7f7fb;
  color: #000;
  padding-left: 10px;
}
.events {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 200px)) !important;
  gap: 20px;
  width: 700px;
  padding-top: 20px;
}
.welcome,
.eventroom {
  font-size: 65px;
  font-weight: 600;
  margin-bottom: 5px;
  padding: 5px;
  font-family: "Nunito", sans-serif;
}
.welcome {
  max-width: 850px;
  font-size: 80px;
  font-weight: 700;
  color: #c1c1c7;
  color: #a0a0ab;
  color: #6e00ff;
}
.notice {
  font-size: 25px;
}
.central-control-station {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  height: 100%;
}
.central-controls {
  /* max-width: 350px; */
  margin-top: 75px;
  /* margin-bottom: 150px; */
  margin-bottom: 60px;
}
.create {
  outline: none;
  background-color: #000;
  color: white;
  font-size: 40px;
  font-weight: bold;
  border: unset;
  padding: 17px 10px;
  width: 100%;
  border-radius: 4px;
  cursor: pointer;
  display: block;
  margin-left: auto;
  margin-top: 30px;
  max-width: 300px;
  font-family: "Nunito", sans-serif !important;
  font-weight: 700;
}
.create:hover {
  background-color: #37373a;
}
</style>