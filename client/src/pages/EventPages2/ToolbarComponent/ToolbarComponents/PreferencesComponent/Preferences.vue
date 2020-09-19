<template>
  <div>
    This is preferences
    <form>
      <label for="fname">YTSearch position (-1 if invisible):</label><br>
      <input type="text"  v-model="ytsearchPosition"><br>
      <label for="lname">Preferences position (cannot be set invisible):</label><br>
      <input type="text" v-model="preferencesPosition"><br><br>
    </form> 
    <button @click="submitPreferences"> Submit </button>
  </div>
</template>
<script>
export default {
  name: "Preferences",
  
  data() {
    return {
      ytsearchPosition: 0,
      preferencesPosition: 1,
    }
  },
  methods: {
    submitPreferences() {
      let returnObject = {
        YTSearch: {
          visible: true,
          position: 0,
        },
        Preferences: {
          visible: true,
          position: 1,
        }
      }
      if (this.ytsearchPosition == -1) {
        returnObject.YTSearch.visible = false;
      }
      returnObject.YTSearch.position = this.ytsearchPosition;
      returnObject.Preferences.position = this.preferencesPosition;
      this.$emit("submitPreferences", returnObject);
    }
  }
}
</script>