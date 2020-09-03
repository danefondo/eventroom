<template>
  <div class="profile-preview-container">
    The profile pic and name should direct to profile
    <div class="big-ass-name-box">
      <p style="font-size:24px" @click="routeToProfile"> {{followUserData.displayName}} </p>
    </div>
    <div class="data-container">
      <p> Followers: {{followUserData.followersNumber}} </p>
      <p> Following: {{followUserData.followingsNumber}} </p>
      <p> Upcoming public events: {{followUserData.upcomingPublicEventNumber}} </p>
      <p> Past public events: {{followUserData.pastPublicEventNumber}} </p>
      <p> Bio: {{followUserData.bio}} </p>
    </div>
  </div>
</template>

<script>
export default {
  name: "FollowUserPreview",
  props: {
    followUserData: Object,
  },
  mounted() {
    console.log("@mounted followuserpreview");
  },
  methods: {
    routeToProfile() {
      this.$router.push(`/profile/${this.followUserData.username}`);
    }
  }
}
</script>
<style scoped>
.profile-preview-container {
  border: 2px solid green;
}
</style>