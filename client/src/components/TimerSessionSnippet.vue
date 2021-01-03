<template>
  <div class="session-snippet">
    <div v-if="sessionIsMatched">Matched with!</div>
    <div v-else>{{ `Unmatched session.` }}</div>
    <router-link :to="joinSessionLink" class="join-session">Join</router-link>
  </div>
</template>


<script>
export default {
  name: "TimerSessionSnippet",
  props: ["nextSession", "sessionIsMatched"],
  computed: {
    joinSessionLink() {
      let sessionId = this.nextSession._id;
      let sessionLink = "/session/" + sessionId;
      return sessionLink;
    },
  },
};
</script>

<style scoped>
.session-snippet {
  margin-top: 21px;
  padding: 12px 12px;
  padding-top: 29px;
  border-radius: 2px;
  background-color: #ffffff;
  color: #393d40;
  font-size: 20px;
  text-align: center;
  /* cursor: pointer; */
  position: relative;
  /* border: 1px solid #f2f2f5; */
  /* box-shadow: 0px 1px 3px 0px #f1f1f1; */
  /* border: 1px solid #5600ff0d; */
  box-shadow: 0px 1px 2px 0px #d8d8d8;
}
.session-snippet:hover {
  /* background-color: #e9e9f2; */
  /* border: 2px solid #b4b8b9; */
}

.join-session {
  padding: 2px 2px;
  border-radius: 360px;
  display: flex;
  align-items: center;
  justify-content: center;
  /* cursor: pointer; */
  background-color: #f2f2f5;
  color: #5600ff;
  font-size: 19px;
  outline: none;
  border: none;
  margin-top: 25px;
  border: 1px solid transparent;
  margin-right: auto;
  width: 75px;
  margin-left: 5px;
}

.join-session:hover {
  background-color: #b4b8b9;
  border: 1px solid #eee;
}
</style>