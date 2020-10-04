<template>
  <div class="col-md-3 box">
    <div class="log" v-for="log in logs" v-bind:key="log.id">
      {{ log.message }}
    </div>
  </div>
</template>

<script>
import { EventBus } from "../Event";
import axios from "axios";
export default {
  name: "Logs",
  data() {
    return {
      logs: [],
      logCount: 0,
    };
  },
  mounted() {
      this.logs = this.$store.state.roomslogs.allLogs;
      this.logCount = this.logs.length;
  },
  watch: {
    "$store.state.roomslogs.lastLog": function (lastLog) {
      // Check if readyContainers contains matching container
      this.logs.push(lastLog);
      this.logCount = this.logs.length;
    },
  },
};
</script>

<style scoped>
.log {
  border: 1px solid rgb(124, 129, 124);
  padding: 13px;
  margin: 3px 0px;
  color: ghostwhite;
}
</style>