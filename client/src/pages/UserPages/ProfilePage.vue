<template>
  <div v-if="!ready">
    Loading data...
  </div>
  <div v-else-if="!profileExists">
    User does not exist!
  </div>
  <div v-else>
    <div class="left-pane"> 
      <div class="profile-picture-container">
        <div class="profile-picture">
          <!-- IMAGE WILL COME FROM SERVER SOMEHOW; I GUESS WE'LL HAVE TO USE AMAZON S3 -->
          <img src="../../assets/images/github-profile-pic.png" style="width:100%">
        </div>
      </div>
      <div class="profile-bio">
        Here be your max n word bio
      </div>
      <div class="followers">
        Here be your follows
      </div>
    </div>
    <div class="right-pane"> 
      <div class="profile-nav">
        Here be the navbar
      </div>
      <div class="profile-main">
        Here be everything else
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import { requestWithAuthentication } from '../../config/api';

export default {
  name: "ProfilePage",
  computed: {
    ...mapState({
      user: state => state.user,
      isAuthenticated: state => state.authenticationStatus,
      isVerified: state => state.verificationStatus,
    })
  },
  data() {
    return {
      ready: false,
      profileExists: false,      
    }
  },
  async mounted() {
    try {
      console.log("@profile user:", this.user);
      const response = await requestWithAuthentication('get', `api/accounts/profile/${this.$route.params.username}`);
      console.log("@profile response:", response);
      this.ready = true;
      this.profileExists = true;
    } catch (err) {
      if (err.response && err.response.status===404) {
        console.log("@profile: error 404");
        this.ready = true;
      }
      console.log("@profile mount error:", err);
    }
  },

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