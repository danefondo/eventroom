<template>
  <div class="participant">
    <img
      v-if="participant.profileImage && participant.profileImage.fileUrl"
      :src="participant.profileImage.fileUrl"
      class="profileImage"
    />
    <div v-else class="profileImageAlt">
      {{ participant.displayName.charAt(0) }}
    </div>
    <div class="displayName">{{ displayName }}</div>
  </div>
</template>

<script>
export default {
  name: "Participant",
  props: ["participant"],
  computed: {
    displayName() {
      let returnName;
      if (this.participant.displayName) {
        returnName = this.participant.displayName;
      }

      if (!returnName) {
        let fullName;
        let firstName = this.participant.firstName;
        let lastName = this.participant.lastName;
        let username = this.participant.username;
        if (firstName && lastName) {
          fullName = firstName + " " + lastName;
          returnName = fullName;
        } else if (firstName && !lastName) {
          returnName = firstName;
        } else if (!firstName && lastName) {
          returnName = lastName;
        } else if (!firstName && !lastName && username) {
          returnName = username;
        }
      }

      return returnName;
    },
  },
};
</script>

<style scoped>
.participant {
  width: 250px;
  height: 25px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  padding: 12px 15px;
  border-radius: 3px;
  color: #1f3058;
  transition: 0.1s ease-in-out;
  cursor: pointer;
  margin-bottom: 4px;
}

.participant:hover {
  /* transform: scale(1.01); */
  /* background-color: #e0e2e7; */
  background-color: #f5f6f9;
}

.displayName {
  font-size: 21px;
  overflow: hidden;
  text-overflow: ellipsis;
}

.profileImage {
  height: 32px;
  width: 32px;
  border-radius: 360px;
  margin-right: 12px;
  border: 1px solid #a7aebd;
}

.profileImageAlt {
  height: 32px;
  width: 32px;
  flex-shrink: 0;
  border-radius: 360px;
  margin-right: 12px;
  border: 1px solid #a7aebd;
  display: flex;
  align-items: center;
  font-weight: 600;
  color: white;
  justify-content: center;
  background-color: #520cd5;
}
</style>