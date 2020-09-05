<template>
  <div v-if="!ready">
    Loading data...
  </div>
  <div v-else-if="!profileExists">
    User does not exist! Or maybe there was a server error
  </div>
  <div v-else>
    <!-- The side view of the page -->
    <button @click="print">Print </button>
    <div class="left-pane"> 
      <div class="profile-picture-container">
        <div class="profile-picture">
          <!-- IMAGE WILL COME FROM SERVER SOMEHOW; I GUESS WE'LL HAVE TO USE AMAZON S3 -->
          <img src="../../assets/images/github-profile-pic.png" style="width:100%">
        </div>
      </div>
      <div class="bio-section">
        <BioComponent />
      </div>
      <div class="follow-section">
        <FollowComponent
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
            :loadFollowersToggle="loadFollowersToggle"
          />
        </div> 
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex';
import { requestWithAuthentication } from '../../config/api';

import BioComponent from './ProfilePageComponents/BioComponent';
import FollowComponent from './ProfilePageComponents/FollowComponent';
import FollowerListComponent from './ProfilePageComponents/FollowerListComponent';

export default {
  name: "ProfilePage",
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
      // profileUserId: state => state.profile.profileUserId,
      // isUserFollowed: state => state.profile.isUserFollowed,
      // numberOfFollowers: state => state.profile.numberOfFollowers,
      // numberOfFollowing: state => state.profile.numberOfFollowing,
    }),
  },
  data() {
    return {
      ready: false,
      profileExists: false, 
      
      mainViewIndex: 0,
      showFollowers: false,
      loadFollowersToggle: false,
    }
  },
  async created() {
    this.loadProfilePage(this.$route.params.username);
  },
  watch: {
    async '$route' (to) {
      this.ready = false;
      this.mainViewIndex = 0;
      this.clearProfileState();
      await this.loadProfilePage(to.params.username);
      this.ready = true;
    }
  },
  methods: {
    // For debugging purposes only
    print() {
      console.log("@profile data", this);
    },
    ...mapActions({
      setInitialData: 'profile/setInitialData',
      clearProfileState: 'profile/clearProfileState',
    }),
    async loadProfilePage(paramsUsername) {
      try {
        const response = await requestWithAuthentication('get', `api/accounts/profile/${paramsUsername}`);
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
        if (err.response && err.response.status===404) {
          console.log("@profile: error 404");
          this.ready = true;
        }
        console.log("@profile mount error:", err);
      }
    },
    async showFollowersAction(showFollowers) {
      this.mainViewIndex = 1;
      this.showFollowers = Boolean(showFollowers);
      this.loadFollowersToggle = !this.loadFollowersToggle;
    },

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