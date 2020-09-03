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
import { requestWithAuthentication } from '../../../config/api';

export default {
  name: "BioComponent",
  props: {
    bioText: String,
    profileBelongsToUser: Boolean,
  },
  data() {
    return {
      modifyingBioText: false,
      localBioText: this.bioText,
      saveButtonText: "Save",
    }
  },
  computed: {
    noBioText() { return !this.bioText || this.bioText.length===0; }
  },
  methods: {
    modifyBioText() {
      this.localBioText = this.bioText;
      this.modifyingBioText = true;
    },
    async confirmBioTextChanges() {
      this.saveButtonText = "Saving...";
      try {
        const result = await requestWithAuthentication('post', `/api/accounts/profileData/saveBio`, { newBioText: this.localBioText });
        if (result.data.success) {
          this.$emit('bioTextModification', this.localBioText);
        } else {
          console.log("no success");
        }
      } catch (err) {
        console.log("@confirm bio changes errors:", err);
      }
      this.saveButtonText = "Save";
      this.modifyingBioText = false;
    },
    setLocalBioText(newLocalBioText) {
      this.localBioText = newLocalBioText;
    }
  }
}
</script>