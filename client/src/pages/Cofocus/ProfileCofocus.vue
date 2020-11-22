<template>
  <div class="myrooms">
    <div class="profile">
      <div class="myrooms-title">{{displayName}}</div>
      <!-- <div class="myrooms-sub">View and manage all of your rooms</div> -->
      <div class="profileImage"></div>
      <div class="links">
        <div class="viewProfile">View my public profile</div>
        <div class="newRoom" @click="createNewRoom">+ New room</div>
      </div>
      <!-- <div class="profileName">{{ getName }}</div> -->
    </div>
    <div class="rooms">
      <!-- <RoomBox
        v-for="eventroom in sortedRooms"
        :key="eventroom._id"
        :eventroom="eventroom"
      /> -->
    </div>
  </div>
</template>

<script>
// import { mapState } from "vuex";

// import axios from "axios";
import { mapState } from "vuex";
// import RoomBox from "./RoomBox";
import { requestWithAuthentication } from "../../config/api";

export default {
  name: "ProfileCofocus",
  data() {
    return {
      requestProfileDataFinished: false,
      gettingRooms: false,
      gettingRoomsError: false,
      firstName: '',
      lastName: '',
      displayName: '',
      username: '',
      // rooms: [],
    };
  },
  components: {
    // RoomBox,
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
    // this.getUserRooms();
    this.getProfileDataByUserId();
  },
  methods: {
    async getProfileDataByUserId() {
      let userId = this.$route.params.userId

      try {
        const response = await requestWithAuthentication(
          `post`,
          `api/settings/getProfileDataByUserId`,
          { userId }
        );

        let profileData = response.data.result;
        if (!profileData) throw { failedToGetProfileData: true };

        for (var key in profileData) {
          if (key !== "profileImage") {
            this[key] = profileData[key];
          } 
          // else {
          //   let fileName = profileData[key]["fileName"];
          //   let fileUrl = profileData[key]["fileUrl"];
          //   if (fileName && fileUrl) {
          //     this.fileName = profileData[key]["fileName"];
          //     this.fileUrl = profileData[key]["fileUrl"];
          //     this.image = {
          //       preview: profileData[key]["fileUrl"],
          //     };
          //   }
          // }
        }
      } catch (error) {
        // this.failedToGetProfileData = true;
        console.log(error);
      } finally {
        this.requestProfileDataFinished = true;
      }
    },
    async loadProfilePage(paramsUsername) {
      try {
        const response = await requestWithAuthentication(
          "get",
          `api/accounts/profile/${paramsUsername}`
        );
        // console.log("@profile response:", response);
        if (response && response.data && response.data.success) {
          this.setInitialData({
            profileUserId: response.data.userId,
            numberOfFollowers: response.data.followers,
            numberOfFollowing: response.data.following,
            isUserFollowed: response.data.isFollowed,
            bioText: response.data.bioText,
          });

          this.profileExists = true;
          this.ready = true;
        } else {
          this.ready = true;
        }
      } catch (err) {
        if (err.response && err.response.status === 404) {
          console.log("@profile: error 404");
          this.ready = true;
        }
        console.log("@profile mount error:", err);
      }
    },
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
  /* width: 800px; */
  width: 725px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  /* padding: 20px; */
  padding: 40px 20px 25px 20px;
  /* background-color: #f3f4f7ad; */
  /* background-color: #f3f4f76b; */
  background-color: #f7f8f9;
  border-radius: 4px;
  margin-bottom: 10px;
  border-radius: 35px;
  padding-bottom: 30px;

  transform: scale(1.015);
}

.profileName {
  font-size: 25px;
  margin-top: 10px;
}

.links {
  display: flex;
  flex-direction: row;
  margin-top: 10px;
}

.viewProfile,
.newRoom {
  /* font-size: 19px; */
  font-size: 20px;
  margin-top: 15px;
  margin-left: 5px;
  margin-right: 5px;
  letter-spacing: 0.5px;
  /* background-color: #e4e8ec; */
  /* background-color: #dcdfe2; */
  /* background-color: #dcdfe299;
  background-color: #f3f3f3;
  background-color: #f1f1f1; */
  background-color: #e9eced;
  /* padding: 5px 28px; */
  padding: 6px 14px;
  font-weight: 700;
  border-radius: 360px;
  cursor: pointer;
  transition: 0.1s ease;
}

.viewProfile:hover,
.newRoom:hover {
  background-color: #b7bcc194;
}

.viewProfile {
  color: #222;
}

.newRoom {
  color: #5600ff;
}

/* .newRoom {
  background-color: #000000;
  color: white;
}

.newRoom:hover {
  background-color: #333;
} */

.myrooms-title {
  /* font-size: 45px; */
  font-size: 55px;
  font-weight: 600;
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