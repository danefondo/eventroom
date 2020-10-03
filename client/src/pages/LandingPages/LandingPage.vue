<template>
  <div class="central-control-station">
    <div class="controls-container">
      <span class="welcome">Create meetings faster than you can blink.</span>
      <div class="central-controls">
        <label class="room-creator">
          <span class="eventroom">eventroom.to/</span>
          <div class="input-container">
            <input
              :class="nameExists ? 'slug slug-red' : 'slug'"
              :placeholder="slug"
              v-model="slug"
              v-on:keyup="timeOutSearch"
              autofocus="autofocus"
              spellcheck="false"
            />
            <img :src="dice" @click="customSlug" class="dice" />
          </div>
        </label>
        <div></div>
        <!-- <router-link to="/events/createEvent" class="create">Create room</router-link> -->
        <div
          :class="cannotCreateRoom ? 'already-exists scaled' : 'already-exists'"
          v-if="nameExists"
        >
          Yikes! Room with that epic name already exists!
        </div>
        <div class="create" @click="createEventroom">Create room</div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";

import axios from "axios";
import { slug } from "../../config/slugGenerator/slug";
import dice from "../../assets/images/dice.png";

export default {
  name: "LandingPage",
  data() {
    return {
      slug: "",
      nameExists: false,
      awaitingTyping: false,
      cannotCreateRoom: false,
      showPreScreenPreference: true,
      dice: dice,
    };
  },
  computed: {
    ...mapState({
      user: (state) => state.auth.user,
      isAuthenticated: (state) => state.auth.authenticationStatus,
      isVerified: (state) => state.auth.verificationStatus,
    }),
  },
  async mounted() {
    this.customSlug();
  },
  methods: {
    async createEventroom() {
      try {
        let slug = this.slug;
        if (!slug) {
          // If slug has been removed, generate new slug
          slug = slug();
        }
        let eventroomData = {
          eventroomName: slug,
        };

        let exists = await this.checkIfSlugExists();

        console.log("exi", exists);
        if (exists) {
          this.cannotCreateRoom = true;
          setTimeout(() => {
            console.log("type type");
            this.checkIfSlugExists();
            this.cannotCreateRoom = false;
          }, 1000); // 1 sec delay
          return;
        }

        if (this.isAuthenticated) {
          eventroomData.hostId = this.user._id;
        }

        const response = await axios.post(
          `/api/eventroom/createEventroom`,
          eventroomData
        );
        console.log("@createEventroom response", response);
        if (this.showPreScreenPreference) {
          this.$router.push(`/${response.data.eventroom.eventroomName}/check`);
        } else {
          this.$router.push(`/${response.data.eventroom.eventroomName}`);
        }
      } catch (error) {
        alert(
          "Well, bollocks. Here's the thing, something went wrong. Try refreshing. Helps sometimes."
        );
        console.log(
          "@createEventroom: Emergency, our penguins cannot create igloos!"
        );
      }
    },
    async checkIfSlugExists() {
      try {
        let slug = this.slug;
        let eventroomData = {
          eventroomName: slug,
        };
        const response = await axios.post(
          `/api/eventroom/checkIfEventroomExistsByName`,
          eventroomData
        );
        console.log("respon", response.data);
        this.nameExists = response.data.alreadyExists;
        return response.data.alreadyExists;
      } catch (error) {
        console.log(
          "@checkIfSlugExists: Emergency, our penguins cannot find igloos to check!"
        );
      }
    },
    customSlug() {
      this.slug = slug();
      this.checkIfSlugExists();
    },
    timeOutSearch() {
      if (!this.awaitingTyping) {
        setTimeout(() => {
          console.log("type type");
          this.checkIfSlugExists();
          this.awaitingTyping = false;
        }, 1000); // 1 sec delay
      }
      this.awaitingTyping = true;
    },
  },
  // watch: {
  //   slug: function () {
  //     if (!this.awaitingTyping) {
  //       setTimeout(() => {
  //         console.log("type type");
  //         this.checkIfSlugExists();
  //         this.awaitingTyping = false;
  //       }, 1000); // 1 sec delay
  //     }
  //     this.awaitingTyping = true;
  //   },
  // },
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

.input-container {
  position: relative;
  display: flex;
  flex-direction: row;
}

.dice {
  position: absolute;
  right: -44px;
  max-width: 32px;
  cursor: pointer;
  margin: auto 0px;
  bottom: 0;
  top: 0;
}

.dice:hover {
  transition: 0.2s ease;
  transform: scale(1.07);
}

.slug {
  font-size: 50px;
  width: 416px;
  margin-left: 3px;
  padding: 5px;
  padding-left: 10px;
  font-family: "Nunito", sans-serif;
  border: none;
  border: 1px solid #e4e4ec82;
  font-weight: 400;
  border-radius: 4px;
  color: #6e00ff;
  /* background-color: #f7f7fb; */
  background-color: #f2f2f9;
  background-color: white;
}
.slug:focus {
  outline: none;
  background-color: #f2f2f9;
  color: #000;
  padding-left: 10px;
}

.slug-red {
  border: 1px solid #ac01024f;
}

.already-exists {
  margin-left: auto;
  width: 400px;
  color: #ab0000;
  font-weight: bold;
  padding: 12px;
  text-align: right;
}

.scaled {
  transform: scale(1.06);
  transition: 0.4s ease;
}

.room-creator {
  display: flex;
  flex-direction: row;
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
  max-width: 950px;
  font-size: 85px;
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

.controls-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  padding: 125px 100px;
  background-color: #fbfbfb;
  margin-bottom: 50px;
}

.central-controls {
  /* max-width: 350px; */
  margin-top: 75px;
  /* margin-bottom: 150px; */
  /* margin-bottom: 60px; */
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