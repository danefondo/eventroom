<template>
  <div v-if="!ready">
    Loading data...
  </div>
  <div v-else-if="!profileExists">
    User does not exist! Or maybe there was a server error
  </div>
  <div v-else>
    <!-- The side view of the page -->
    <div class="left-pane"> 
      <div class="profile-picture-container">
        <div class="profile-picture">
          <!-- IMAGE WILL COME FROM SERVER SOMEHOW; I GUESS WE'LL HAVE TO USE AMAZON S3 -->
          <img src="../../assets/images/github-profile-pic.png" style="width:100%">
        </div>
      </div>
      <div class="bio-section">
        <BioComponent 
          ref="BioComponent"
          :bio-text="bioText" 
          :profile-belongs-to-user="profileBelongsToUser"
          @bioTextModification="bioTextModificationAction"
        />
      </div>
      <div class="follow-section">
        <FollowComponent
          :profile-belongs-to-user="profileBelongsToUser"
          :is-user-followed="isUserFollowed"
          :profile-user-id="profileUserId"
          :number-of-followers="numberOfFollowers"
          :number-of-following="numberOfFollowing"
          @followedUser="followedUserAction"
          @unfollowedUser="unfollowedUserAction"
          @showFollowers="showFollowersAction"
        />
      </div>
    </div>
    <!-- The main view of the app -->
    <div class="right-pane"> 
      <div class="profile-nav">
        Here be the navbar
      </div>
      <div class="profile-main">
        Here be everything else
        <div v-if="mainViewIndex===0">
          Here be the events
        </div>
        <div v-else-if="mainViewIndex===1">
          <FollowerListComponent 
            ref="FollowerListComponent"
            :showFollowers="showFollowers"
            :showFollowing="showFollowing"
            :profileUserId="profileUserId"
          />
        </div> 
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import { requestWithAuthentication } from '../../config/api';

import BioComponent from './ProfilePageComponents/BioComponent';
import FollowComponent from './ProfilePageComponents/FollowComponent';
import FollowerListComponent from './ProfilePageComponents/FollowerListComponent';

export default {
  name: "ProfilePage",
  watch: {
    async '$route' (to) {
      this.ready = false;
      await this.loadProfilePage(to.params.username);
      this.$refs.FollowerListComponent.clearLists();
      this.ready = true;
    }
  },
  components: {
    BioComponent,
    FollowComponent,
    FollowerListComponent,
  },
  computed: {
    ...mapState({
      user: state => state.auth.user,
      isAuthenticated: state => state.auth.authenticationStatus,
      isVerified: state => state.auth.verificationStatus,
    })
  },
  data() {
    return {
      ready: false,
      profileExists: false, 
      
      mainViewIndex: 0,
      showFollowers: 0,

      profileBelongsToUser: true, // TODO computed
      profileUserId: "",

      isUserFollowed: false, // TODO computed
    
      numberOfFollowers: 0,
      numberOfFollowing: 0,

      bioText: "",
    }
  },
  async mounted() {
    this.loadProfilePage(this.$route.params.username);
  },
  methods: {
    async loadProfilePage(paramsUsername) {
      try {
        const response = await requestWithAuthentication('get', `api/accounts/profile/${paramsUsername}`);
        console.log("@profile response:", response);
        if (response && response.data && response.data.success) {
          this.profileBelongsToUser = response.data.userId == this.user._id;
          this.profileUserId = response.data.userId;
          this.numberOfFollowers = response.data.followers;
          this.numberOfFollowing = response.data.following;
          this.isUserFollowed = response.data.isFollowed;
          this.bioText = response.data.bioText;
          this.profileExists = true;
          this.ready = true;
        } else {
          this.ready = true;
        }
        
      } catch (err) {
        if (err.response && err.response.status===404) {
          console.log("@profile: error 404");
          this.ready = true;
        }
        console.log("@profile mount error:", err);
      }
    },
    followedUserAction() {
      this.isUserFollowed = true;
      this.numberOfFollowers += 1;
    },
    unfollowedUserAction() {
      this.isUserFollowed = false;
      this.numberOfFollowers -= 1;
    },
    showFollowersAction(showFollowers) {
      this.mainViewIndex = 1;
      this.showFollowers = showFollowers;
      this.$refs.FollowerListComponent.loadFollows(showFollowers);
    },
    bioTextModificationAction(newBioText) {
      this.bioText = newBioText;
    }
  }
}

</script>

<style scoped>
* {
  box-sizing: border-box;
}
/* For desktop and tablet */
@media screen and (min-width: 480px) {
  .left-pane {
    width: 25%;
    float: left;
    border: 2px solid red;
  }
  .profile-picture-container {
    padding-top: 100%;
    position: relative;
  }
  .profile-picture {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    border: 2px solid blue;
  }
  .right-pane {
    width: 75%;
    float: right;
    border: 2px solid blue;
  }
  .bio-section {
    border: 2px solid turquoise;
  }
  .follow-section {
    border: 2px solid purple;
  }
  .profile-nav {
    border: 2px solid black;
  }
  .profile-main {
    border: 2px solid yellow;
  }
}
/* For mobile */
@media screen and (max-width: 480px) {
  .left-pane {
    width: 100%;
    float: left;
    border: 2px solid red;
  }
  .right-pane {
    width: 100%;
    float: right;
    border: 2px solid blue;
  }
}
</style>