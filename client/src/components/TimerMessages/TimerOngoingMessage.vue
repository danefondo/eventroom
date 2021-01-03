<template>
  <div v-if="hasJoinedDuringSession">
    <div v-if="isCurrentlyInSession" class="notifier-message">
      {{ `Session ends in ${timeLeft} minutes. Are you being productive?` }}
    </div>
    <div v-else class="notifier-message">
      {{ `Please get back in the session! Ends in ${timeLeft} minutes.` }}
    </div>
  </div>
  <div v-else class="notifier-message">
    <div v-if="sessionStartedTwoMinAgo">
      {{ `You're late! Please join the session. ${timeLeft} minutes left.` }}
    </div>
    <div v-else class="notifier-message">
      {{
        `The session has started. Time to join! Session ends in ${timeLeft} minutes.`
      }}
    </div>
  </div>
</template>


<script>
export default {
  name: "TimerOngoingMessage",
  props: [
    "isCurrentlyInSession",
    "hasJoinedDuringSession",
    "sessionIsMatched",
    "partnerName",
    "timeLeft",
    "sessionStartedTwoMinAgo",
  ],
};
</script>

<style scoped>
.notifier-message {
  padding: 0px 10px;
}
</style>
