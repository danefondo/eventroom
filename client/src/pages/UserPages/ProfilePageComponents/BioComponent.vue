<template>
  <div>
    <div v-if="profileBelongsToUser"> 
      <div @click="modifyBioText" v-if="noBioText && !modifyingBioText">
        Current bio text: {{bioText}} 
        <br/>
        Add bio
      </div>
      <div v-else-if="modifyingBioText">
        Max length of bio is 240 characters!
        <textarea v-model="localBioText" maxlength="240"> </textarea>
        <button @click="confirmBioTextChanges"> {{saveButtonText}} </button>
      </div>
      <div v-else>
        {{bioText}}
        <div @click="modifyBioText">
          Click to modify
        </div>
      </div>
    </div>


    <div v-else>
      <div v-if="noBioText">
        Default bio text
      </div>
      <div v-else>
        {{bioText}}
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex';
import { requestWithAuthentication } from '../../../config/api';

export default {
  name: "BioComponent",
  computed: {
    noBioText() { return !this.bioText || this.bioText.length===0; },
    ...mapState({
      bioText: state => state.profile.bioText,
    }),
    ...mapGetters({
      profileBelongsToUser: 'profile/profileBelongsToCurrentUser',
    }),
  },
  data() {
    return {
      modifyingBioText: false,
      localBioText: "", 
      saveButtonText: "Save",
    }
  },
  methods: {
    modifyBioText() {
      this.localBioText = this.bioText; // TODO if doesn't work TODO toString()
      this.modifyingBioText = true;
    },
    async confirmBioTextChanges() {
      this.saveButtonText = "Saving...";
      try {
        const result = await requestWithAuthentication('post', `/api/accounts/profileData/saveBio`, { newBioText: this.localBioText });
        if (result.data.success) {
          this.$store.commit('profile/setBioText', this.localBioText);
        } else {
          console.log("no success");
        }
      } catch (err) {
        console.log("@confirm bio changes errors:", err);
      }
      this.saveButtonText = "Save";
      this.modifyingBioText = false;
    },

  }
}
</script>