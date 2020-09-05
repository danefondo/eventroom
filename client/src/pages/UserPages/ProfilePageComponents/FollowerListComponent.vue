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
    </div>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex';
import { requestWithAuthParams } from '../../../config/api';
import FollowUserPreview from './FollowUserPreview';
export default {
  name: "FollowerListComponent",
  components: {
    FollowUserPreview,
  },
  props: {
    showFollowers: Boolean,
    loadFollowersToggle: Boolean,
  },
  computed: {
    ...mapState({
      profileUserId: state => state.profile.profileUserId,
      allFollowersLoaded: state => state.profile.allFollowersLoaded,
      allFollowingLoaded: state => state.profile.allFollowingLoaded,
      nrOfLoadedFollowerProfiles: state => state.profile.nrOfLoadedFollowerProfiles,
      nrOfLoadedFollowingProfiles: state => state.profile.nrOfLoadedFollowingProfiles,
      followerList: state => state.profile.followers,
      followingList: state => state.profile.following,
    })
  },
  data() {
    return {
      ready: false,
      errors: false,
    }
  },
  watch: {
    loadFollowersToggle: function() {
      this.loadFollows(this.showFollowers);
    }
  },
  async created() {
    this.loadFollows(this.showFollowers);
    this.ready = true;
  },

  methods: {
    ...mapActions({
      loadAdditionalFollowers: 'profile/loadAdditionalFollowers',
      loadAdditionalFollowing: 'profile/loadAdditionalFollowing',
    }),
    async loadFollows(showFollowers) {
      if ((this.allFollowersLoaded && showFollowers) || (this.allFollowingLoaded && !showFollowers)) {
        console.log("STOPPED");
        return;
      }
      let response;
      const requestParams = { 
        profileUserId: this.profileUserId, 
        nrOfLoadedProfiles: showFollowers ? this.nrOfLoadedFollowerProfiles : this.nrOfLoadedFollowingProfiles, 
        followers: showFollowers, 
      };
      // console.log("@loadfollows reqparams", requestParams);
      try {
        response = await requestWithAuthParams('get', `api/accounts/profileData/followList`, requestParams);
        // console.log("@loadfollows response", response);
      } catch (err) {
        this.errors = true;
        console.log("Error at follower list: ", err);
      }
      if (!response || !response.data || !response.data.success) {
        this.errors = true;
        console.log("Error at follower list, data not successful");
      } else {
        const argumentObject = {
          loadedProfiles: response.data.followList,
          nrOfLoadedProfiles: response.data.followList.length,
          allLoaded: response.data.allLoaded,
        };
        if (showFollowers) {
          this.loadAdditionalFollowers(argumentObject);
        } else {
          this.loadAdditionalFollowing(argumentObject);
        }
      }

    },
  }

}
</script>
<style scoped>
.list-of-followers {
  border: 2px solid pink;
}
</style>