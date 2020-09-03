<template>
  <div>
    <div class="followed-users-list">
      Here be the follows
      <div @click="emitFollowers(1)" class="number-following-this">
       {{this.numberOfFollowers}} followers
      </div>
      <div @click="emitFollowers(0)" class="number-followed-by-this">
        {{this.numberOfFollowing}} following
      </div>
    </div>
    <div v-if="!profileBelongsToUser" class="follow-button-container">
      <button v-if="isUserFollowed" :disabled="processing" @click="unFollowUser()"> Unfollow </button>
      <button v-else :disabled="processing" @click="followUser()"> Follow </button>
    </div>
  </div>
</template>

<script>
import { requestWithAuthentication } from '../../../config/api';

export default {
  name: "FollowComponent",
  props: {
    profileBelongsToUser: Boolean,
    isUserFollowed: Boolean,
    profileUserId: String,
    numberOfFollowers: Number,
    numberOfFollowing: Number
  },
  data() {
    return {
      processing: false,
    }
  },
  methods: {
    async followUser() {
      this.processing = true;
      try {
        const response = await requestWithAuthentication('post', `/api/accounts/follow`, {followUserId: this.profileUserId});
        if (response && response.data.success) {
          this.$emit("followedUser");
          this.processing = false;
        }
      } catch (err) {
        console.log("@followuser err", err);
      }
      this.processing = false;
    },
    async unFollowUser() {
      this.processing = true;
      try {
        const response = await requestWithAuthentication('post', `/api/accounts/unfollow`, {unfollowUserId: this.profileUserId});
        if (response && response.data.success) {
          this.$emit("unfollowedUser");
          this.processing = false;
        }
      } catch (err) {
        console.log("@unfollowuser err", err);
      }
      this.processing = false;
    },
    emitFollowers(showFollowers) {
      this.$emit("showFollowers", showFollowers); // 1 if followers, 0 if followings
    },

  }
}
</script>