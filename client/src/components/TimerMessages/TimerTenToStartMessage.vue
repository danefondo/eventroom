<template>
  <div v-if="sessionIsMatched" class="notifier-message">
    {{ `Your next session begins in ${timeLeft} minutes.` }}
  </div>
  <div v-else class="notifier-message">
    {{
      `Your next session begins in ${timeLeft} minutes. You don't have a partner yet. But we're on the lookout!`
    }}
  </div>
</template>


<script>
export default {
  name: "TimerTenToStartMessage",
  props: ["sessionIsMatched", "timeLeft"],
};
</script>

<style scoped>
.notifier-message {
  padding: 0px 10px;
}
</style>
