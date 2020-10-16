<template>
  <div class="myrooms">
    <div class="profile">
      <div class="myrooms-title">My Rooms</div>
      <div class="myrooms-sub">View and manage all of your rooms</div>
      <div class="profileImage"></div>
      <div class="links">
        <div class="viewProfile">View my public profile</div>
        <div class="newRoom" @click="createNewRoom">+ New room</div>
      </div>
      <!-- <div class="profileName">{{ getName }}</div> -->
    </div>
    <div class="rooms">
      <RoomBox
        v-for="eventroom in sortedRooms"
        :key="eventroom._id"
        :eventroom="eventroom"
      />
    </div>
  </div>
</template>

<script>
// import { mapState } from "vuex";

// import axios from "axios";
import { mapState } from "vuex";
import RoomBox from "./RoomComponents/RoomBox";
import { requestWithAuthentication } from "../../config/api";

export default {
  name: "UserRooms",
  data() {
    return {
      gettingRooms: false,
      gettingRoomsError: false,
      rooms: [],
    };
  },
  components: {
    RoomBox,
  },
  computed: {
    ...mapState({
      user: (state) => state.auth.user,
      isAuthenticated: (state) => state.auth.authenticationStatus,
    }),
    sortedRooms: function () {
      let toSort = this.rooms;
      let sorted = toSort.sort((a, b) => {
        return new Date(a.dateCreated) - new Date(b.dateCreated);
      });
      return sorted;
    },
    getName() {
      let returnName;
      if (this.user.displayName) {
        returnName = this.user.displayName;
      }

      if (!returnName) {
        let fullName;
        let firstName = this.user.firstName;
        let lastName = this.user.lastName;
        let username = this.user.username;
        if (firstName && lastName) {
          fullName = firstName + " " + lastName;
          returnName = fullName;
        } else if (firstName && !lastName) {
          returnName = firstName;
        } else if (!firstName && lastName) {
          returnName = lastName;
        } else if (!firstName && !lastName && username) {
          returnName = username;
        }
      }

      return returnName;
    },
  },
  mounted() {
    this.getUserRooms();
  },
  methods: {
    async createNewRoom() {
      // redirect / open modal
    },

    async getUserRooms() {
      try {
        if (!this.user || !this.user._id) {
          return (window.location.href = "/");
        }
        this.gettingRooms = true;

        let userData = {
          userId: this.user._id,
        };

        const response = await requestWithAuthentication(
          `post`,
          "/api/eventroom/getUserRooms",
          userData
        );

        let rooms = response.data.result;
        if (!rooms) throw new Error("Failed to fetch user rooms.");

        console.log("rooms", rooms);

        if (response.data.success) {
          this.gettingRooms = false;
          rooms.forEach((room) => {
            this.rooms.push(room);
          });
          // setup infinite scroll + query only a few
          // add rooms to vuex or local storage to display them in order of creation or in the order of chosen preference;
          // then display the rooms
        }
      } catch (error) {
        console.log("error: ", error);
        this.gettingRooms = false;
        this.gettingRoomsError = true;
      }
    },
  },
  // computed: {
  //   ...mapState({
  //     user: (state) => state.auth.user,
  //     isAuthenticated: (state) => state.auth.authenticationStatus,
  //     isVerified: (state) => state.auth.verificationStatus,
  //   }),
  // },
};
</script>

<style scoped>
.profile {
  width: 800px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  background-color: #f3f4f7ad;
  border-radius: 4px;
  margin-bottom: 10px;
}

.profileName {
  font-size: 25px;
  margin-top: 10px;
}

.links {
  display: flex;
  flex-direction: row;
  margin-top: 5px;
}

.viewProfile,
.newRoom {
  font-size: 19px;
  margin-top: 15px;
  margin-left: 5px;
  margin-right: 5px;
  letter-spacing: 0.5px;
  /* background-color: #e4e8ec; */
  background-color: #dcdfe2;
  /* padding: 5px 28px; */
  padding: 6px 14px;
  font-weight: 600;
  border-radius: 360px;
  cursor: pointer;
  transition: 0.1s ease;
}

.viewProfile:hover {
  background-color: #b7bcc194;
}

.newRoom {
  background-color: #000000;
  color: white;
}

.newRoom:hover {
  background-color: #333;
}

.myrooms-title {
  font-size: 45px;
}

.myrooms-sub {
  margin-top: 5px;
}

.rooms {
  width: 800px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  /* background-color: #f3f4f7eb; */
  border-radius: 4px;
}
</style>