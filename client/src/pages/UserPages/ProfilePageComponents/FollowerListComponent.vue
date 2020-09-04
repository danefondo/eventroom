<template>
  <div>
    <div v-if="!ready"> 
      Loading data...
    </div>
    <div v-else-if="errors">
      There was an error. Please check your connection and try refreshing, if the problem persists, come back later.
    </div>
    <div v-else class="list-of-followers">
      <div v-if="showFollowers"> 
        I am showing followers of this user
        <div v-for="(follower, index) in followerList" :key="index">
          <FollowUserPreview :follow-user-data="follower" />
        </div>
      </div>
      <div v-else>
        I am showing users this user is following
        <div v-for="(following, index) in followingList" :key="index">
          <FollowUserPreview :follow-user-data="following" />
        </div>
      </div>
      <!-- <button @click="print"> print </button> -->
    </div>
  </div>
</template>

<script>
import { requestWithAuthParams } from '../../../config/api';
import FollowUserPreview from './FollowUserPreview';
export default {
  name: "FollowerListComponent",
  components: {
    FollowUserPreview,
  },
  props: {
    showFollowers: Boolean,
    profileUserId: String,
  },
  data() {
    return {
      ready: false,
      errors: false,
      nrOfLoadedFollowerProfiles: 0,
      nrOfLoadedFollowingProfiles: 0,
      allFollowersLoaded: false,
      allFollowingLoaded: false,
      followerList: [],
      followingList: [],
    }
  },
  async mounted() {
    this.loadFollows(this.showFollowers);
    this.ready = true;
  },

  methods: {
    async loadFollows(showFollowers) {
      if ((this.allFollowersLoaded && showFollowers) || (this.allFollowingLoaded && !showFollowers)) {
        return;
      }
      let response;
      const requestParams = { 
        profileUserId: this.profileUserId, 
        nrOfLoadedProfiles: showFollowers ? this.nrOfLoadedFollowerProfiles : this.nrOfLoadedFollowingProfiles, 
        followers: showFollowers, 
      };
      try {
        response = await requestWithAuthParams('get', `api/accounts/profileData/followList`, requestParams);
      } catch (err) {
        this.errors = true;
        console.log("Error at follower list: ", err);
      }
      if (!response || !response.data || !response.data.success) {
        this.errors = true;
        console.log("Error at follower list, data not successful");
      } else {
        if (showFollowers) {
          this.followerList = this.followerList.concat(response.data.followList);
          this.nrOfLoadedFollowerProfiles += response.data.followList.length;
          if (response.data.allLoaded) {
            this.allFollowersLoaded = true;
          }
        } else {
          this.followingList = this.followingList.concat(response.data.followList);
          this.nrOfLoadedFollowingProfiles += response.data.followList.length;
          if (response.data.allLoaded) {
            this.allFollowingLoaded = true;
          }
        }
      }

    },
    // print() {
    //   console.log("follower list:", this.followerList);
    //   console.log("following list:", this.followingList);
    // },
    clearLists() {
      this.followerList = [];
      this.followingList = [];
      this.nrOfLoadedFollowerProfiles = 0;
      this.nrOfLoadedFollowingProfiles = 0;
      this.allFollowersLoaded = false;
      this.allFollowingLoaded = false;
    }
  }

}
</script>
<style scoped>
.list-of-followers {
  border: 2px solid pink;
}
</style>