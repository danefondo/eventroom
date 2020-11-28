<template>
  <div class="central-control-station">
    <span class="welcome">Welp gg</span>
    Error code: {{statusCode}}
    <br/>
    Error message: {{errorMessage}}
    <br/>
    Please try again in a while and feel free to contact us
  </div>
</template>

<script>
export default {
  name: "ErrorPage",
  data() {
    return {
      statusCode: -1,
      errorMessage: "looks like we have nothing"
    }
  },
  created() {
    console.log("@error", this.$route);
    if (this.$route.params.statusCode) {
      this.statusCode = this.$route.params.statusCode;
    }
    if (this.$route.params.errorMessage) {
      this.errorMessage = this.$route.params.errorMessage;
    }
  }
};
</script>

<style scoped>

</style>