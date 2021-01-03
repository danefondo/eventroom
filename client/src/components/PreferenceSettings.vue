<template>
  <div class="myrooms">
    <div class="edit-section">
      <div class="edit-title">General</div>
      <div class="toggle-setting">
        <div class="setting">
          <div>
            <div class="setting-name">Direct Match Requests</div>
            <div class="setting-info">
              When enabled, people who are connected to you can send you match
              requests for specific times.
            </div>
          </div>
          <Toggle
            @click.native="toggle('directMatchRequests')"
            :boolean="preferencesState.general.directMatchRequests"
          />
        </div>
        <ComingSoon />
      </div>
    </div>
    <div class="edit-section">
      <div class="edit-title">Matching preferences</div>
      <div class="toggle-setting">
        <div class="setting">
          <div>
            <div class="setting-name">Don't rematch me</div>
            <div class="setting-info">
              When you're already matched, we won't show you on the calendar,
              nor rematch you, even when someone with more suiting preferences
              books a session.
            </div>
          </div>
          <Toggle
            @click.native="toggle('rematchingEnabled')"
            :boolean="!preferencesState.calendarPreferences.rematchingEnabled"
          />
        </div>
      </div>
      <div class="toggle-setting">
        <div class="setting">
          <div>
            <div class="setting-name">Prefer similar activity</div>
            <div class="setting-info">
              Whenever you specify an activity for a session (e.g. coding,
              yoga), we'll try to match you with people with a similar activity.
            </div>
          </div>
          <Toggle
            @click.native="toggle('preferSimilarActivity')"
            :boolean="preferencesState.preferSimilarActivity"
          />
        </div>
        <ComingSoon />
      </div>
      <div class="toggle-setting">
        <div class="setting">
          <div>
            <div class="setting-name">Prefer people from my lists</div>
            <div class="setting-info">
              Whenever possible, we'll try to match you with people in your
              lists, such as people in your Favorites list.
            </div>
            <button class="setting-link">Edit my lists</button>
          </div>
          <Toggle
            @click.native="toggle('preferPeopleFromLists')"
            :boolean="preferencesState.preferPeopleFromLists"
          />
        </div>
        <ComingSoon />
      </div>
      <div class="toggle-setting">
        <div class="setting">
          <div>
            <div class="setting-name">Prefer people from my groups</div>
            <div class="setting-info">
              Whenever possible, we'll try to match you with members from your
              groups.
            </div>
            <button class="setting-link">Edit my groups</button>
          </div>
          <Toggle
            @click.native="toggle('preferPeopleFromGroups')"
            :boolean="preferencesState.preferPeopleFromGroups"
          />
        </div>
        <ComingSoon />
      </div>
      <!-- <div class="toggle-setting">
        <div class="setting">
          <div>
            <div class="setting-name">
              Prefer people I've had the most sessions with
            </div>
            <div class="setting-info">When.</div>
          </div>
          <Toggle @click.native="toggle(2)" :boolean="activityPref" />
        </div>
      </div> -->
    </div>
    <div class="edit-section">
      <div class="edit-title">Session type preferences</div>
      <div class="setting-subtitle">
        <div>
          Set your default preferences for your ideal sessions. You can also
          re-order the preferences in an order of importance to you. Whenever
          possible, we'll match you with people with similar preferences.
        </div>
        <button class="setting-helper">Click here to see how</button>
      </div>
      <Container @drop="onDrop">
        <Draggable v-for="(preference, i) in preferences" :key="preference.id">
          <div class="preference">
            <div class="preference-header">
              <span class="preference-number">{{ i + 1 }}</span>
              <div class="preference-name">{{ preference.name }}</div>
            </div>
            <div class="preference-choice">
              <div
                class="switch-field"
                v-for="(option, index) in preference.options"
                :key="option.id"
              >
                <!-- <input
                  :id="'radio' + i + index"
                  type="radio"
                  v-model="matchingPreferences[preference.type]"
                  :value="index"
                /> -->
                <input
                  :id="'radio' + i + index"
                  type="radio"
                  v-model="preference['preference']"
                  :value="index"
                />
                <label :for="'radio' + i + index">{{ option }}</label>
              </div>
            </div>
          </div>
        </Draggable>
      </Container>
    </div>
    <div class="edit-section">
      <div class="edit-title">Calendar settings</div>
      <div class="toggle-setting">
        <div class="setting">
          <div>
            <div class="setting-name">Real time updates</div>
            <div class="setting-info">
              When disabled, you stop receiving real time updates when people
              book or cancel sessions and you will have to use the Manual
              Refresh button to get new data.<span class="italic">
                Disabling this is only recommended when the calendar feels slow
                to use.</span
              >
            </div>
          </div>
          <Toggle
            @click.native="toggle('preferRealTimeUpdates')"
            :boolean="
              preferencesState.calendarPreferences.preferRealTimeUpdates
            "
          />
        </div>
      </div>
      <div class="toggle-setting">
        <div class="setting">
          <div class="setting-name">Use 24-hour format</div>
          <Toggle
            @click.native="toggle('prefer24HourFormat')"
            :boolean="preferencesState.calendarPreferences.prefer24HourFormat"
          />
        </div>
      </div>
    </div>
    <div class="edit-section">
      <div class="edit-title">Theme</div>
      <div class="toggle-setting">
        <div class="preference">
          <div class="preference-choice">
            <div class="switch-field" @click="themeSwitch('spacegrey')">
              <input
                id="radio-light"
                type="radio"
                v-model="preferencesState.theme"
                value="spacegrey"
              />
              <label for="radio-light">Space Grey</label>
            </div>
          </div>
          <div class="preference-choice">
            <div class="switch-field" @click="themeSwitch('light')">
              <input
                id="radio-dark"
                type="radio"
                v-model="preferencesState.theme"
                value="light"
              />
              <label for="radio-dark">Light</label>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";
import { Container, Draggable } from "vue-smooth-dnd";
import { applyDrag, updatePriorities } from "../utilities/Helpers";
import Toggle from "./Toggle";
import ComingSoon from "./ComingSoon";
import { requestWithAuthentication } from "../config/api";

export default {
  name: "PreferenceSettings",
  data() {
    return {
      /* Currently not updating Vuex "directly"
      due to complications w/dragdrop library
      and the html radio buttons */
      preferences: [
        {
          options: ["Desk work", "No preference", "Active work"],
          type: "workType",
          name: "Work type",
          preference: 0,
          priority: 0,
        },
        {
          options: ["Mic off", "No preference", "Mic on"],
          type: "microphone",
          name: "Microphone",
          preference: 0,
          priority: 1,
        },
        {
          options: [
            "Let's share screens!",
            "No preference",
            "Prefer no screensharing",
          ],
          type: "screenshare",
          name: "Screensharing",
          preference: 0,
          priority: 2,
        },
      ],

      preferencesState: null,
    };
  },

  components: {
    Toggle,
    Container,
    Draggable,
    ComingSoon,
  },

  created() {
    this.preferencesState = this.user.preferences;
    this.syncLocalState();
  },

  computed: {
    ...mapState({
      user: (state) => state.auth.user,
    }),
  },
  methods: {
    _addTheme(theme) {
      let themeLinkEl = document.createElement("link");
      themeLinkEl.setAttribute("rel", "stylesheet");
      themeLinkEl.setAttribute("href", `/css/themes/${theme}.css`);
      themeLinkEl.setAttribute("id", `theme`);
      themeLinkEl.classList.add(theme);

      let docHead = document.querySelector("head");
      docHead.append(themeLinkEl);
    },
    _removeCurrentTheme() {
      let themeLinkEl = document.querySelector(`#theme`);
      let parentNode = themeLinkEl.parentNode;
      parentNode.removeChild(themeLinkEl);
    },
    themeSwitch(theme) {
      let themeLinkEl = document.querySelector(`#theme`);
      if (!themeLinkEl.classList.contains(theme)) {
        this._removeCurrentTheme();
        this._addTheme(theme);
      }
    },

    /* This is awkward due to the drag-drop setup
    but also as I've not come up with better ways
    to solve this whilst keeping the drag-drop
    updates working. */
    onDrop(dropResult) {
      // console.log(dropResult);
      this.preferences = applyDrag(this.preferences, dropResult);
      this.preferences = updatePriorities(this.preferences);
      /* Not updating preferences here && watching instead
      because there are still the radio buttons which are
      changing value */
    },

    toggle(field) {
      if (!this.preferencesState) return;
      let state = this.preferencesState;

      if (field == "directMatchRequests") {
        state.general[field] = !state.general[field];
      }

      if (
        field == "preferPeopleFromLists" ||
        field == "preferPeopleFromGroups" ||
        field == "preferSimilarActivity"
      ) {
        state[field] = !state[field];
      }

      if (
        field == "prefer24HourFormat" ||
        field == "preferRealTimeUpdates" ||
        field == "rematchingEnabled"
      ) {
        state.calendarPreferences[field] = !state.calendarPreferences[field];
      }

      this.updatePreferences();
    },

    updatePreferences() {
      let preferencesState = JSON.parse(JSON.stringify(this.preferencesState));
      this.updateVuexPreferences(preferencesState);
      this.updateDatabasePreferences(preferencesState);
    },

    syncLocalState() {
      let localPreferences = this.preferencesState.matchingPreferences;
      for (var i = 0; i < this.preferences.length; i++) {
        let preference = this.preferences[i];
        let type = preference.type;
        preference.preference = localPreferences[type].preference;
        preference.priority = localPreferences[type].priority;
      }

      this.preferences.sort(function (a, b) {
        return a.priority - b.priority;
      });
    },

    updateStatePreferences() {
      let localPreferences = this.preferencesState.matchingPreferences;
      for (var i = 0; i < this.preferences.length; i++) {
        let preference = this.preferences[i];
        let type = preference.type;
        localPreferences[type].preference = preference.preference;
        localPreferences[type].priority = preference.priority;
      }
    },

    async updateDatabasePreferences(preferences) {
      // Send update to database, updating user model
      // Update all sessions user is in with their preferences
      try {
        let userId = this.user._id;
        let updateData = { userId, preferences };
        await requestWithAuthentication(
          "post",
          "api/profiles/updatePreferences",
          updateData
        );
      } catch (error) {
        console.log("@updateDatabasePreferences, error: ", error);
      }
    },

    updateVuexPreferences(preferences) {
      this.$store.dispatch("auth/updatePreferences", preferences);
    },
  },

  watch: {
    preferences: {
      handler() {
        this.updateStatePreferences();
      },
      deep: true,
    },

    preferencesState: {
      handler() {
        console.log("a thing changed 2");
        this.updatePreferences();
      },
      deep: true,
    },
  },
};
</script>

<style scoped>
.profile {
  /* width: 800px; */
  width: 725px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  /* padding: 20px; */
  padding: 65px 20px 25px 20px;
  /* background-color: #f3f4f7ad; */
  /* background-color: #f3f4f76b; */
  background-color: #f7f8f9;
  border-radius: 4px;
  margin-bottom: 10px;
  border-radius: 35px;
  padding-bottom: 30px;

  transform: scale(1.015);
}

.edit-section {
  width: 725px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px 20px 25px 20px;
  /* background-color: #f7f8f9; */
  background-color: #f1f4f7;
  border-radius: 4px;
  margin-bottom: 10px;
  margin-top: 25px;
  border-radius: 35px;
  padding-bottom: 30px;
}

.profileName {
  font-size: 25px;
  margin-top: 10px;
}

.links {
  display: flex;
  flex-direction: row;
  margin-top: 10px;
}

.viewProfile,
.newRoom,
.goBack {
  /* font-size: 19px; */
  font-size: 20px;
  margin-top: 15px;
  margin-left: 5px;
  margin-right: 5px;
  letter-spacing: 0.5px;
  /* background-color: #e4e8ec; */
  /* background-color: #dcdfe2; */
  /* background-color: #dcdfe299;
  background-color: #f3f3f3;
  background-color: #f1f1f1; */
  background-color: #e9eced;
  /* padding: 5px 28px; */
  padding: 6px 14px;
  font-weight: 700;
  border-radius: 360px;
  cursor: pointer;
  transition: 0.1s ease;
}

.goBack {
  position: absolute;
  left: 20px;
  top: 5px;
  color: #aaadaf;
  font-size: 17px;
  background-color: transparent;
  display: block;
}

.goBack:hover {
  color: #b7bcc194;
}

.viewProfile:hover,
.newRoom:hover {
  background-color: #b7bcc194;
}

.viewProfile {
  color: #222;
}

.newRoom {
  color: #5600ff;
}

.save-pass,
.copy-pass {
  font-size: 20px;
  margin-top: 15px;
  margin-left: 20px;
  letter-spacing: 0.5px;
  background-color: #e9eced;
  padding: 6px 14px;
  font-weight: 700;
  border-radius: 360px;
  cursor: pointer;
  transition: 0.1s ease;
}

.save-pass:hover,
.copy-pass:hover {
  background-color: #b7bcc194;
}

.copy-pass {
  margin-left: 10px;
}

.pass-notifiers {
  flex-direction: column !important;
  align-items: flex-start;
}

.toggle-setting {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  width: 550px;
  margin: 20px auto;
  margin-bottom: 30px;
  box-sizing: border-box;
  position: relative;
  /* padding-right: 50px; */
}

.setting {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  width: 550px;
  /* margin: 20px auto;
  margin-bottom: 30px; */
  box-sizing: border-box;
}

.pass-setting {
  justify-content: unset;
  margin-top: 10px;
}

.pass-update-success,
.pass-update-fail,
.pass-update-warning {
  font-size: 18px;
  margin-top: 15px;
  letter-spacing: 0.5px;
  background-color: #e9eced;
  color: #5600ff;
  padding: 8px 20px;
  font-weight: 700;
  border-radius: 360px;
  max-width: 522px;
  box-sizing: border-box;
}

.pass-update-fail {
  color: #a50000;
}

.pass-update-warning {
  color: #f76d42;
}

.setting-name {
  font-size: 25px;
  font-weight: 600;
  text-align: left;
  margin-right: auto;
  color: #222;
}

.setting-info {
  line-height: 20px;
  padding: 2px 0px;
  margin-top: 2px;
  color: #383838;
}

.setting-link {
  background-color: #e0e3e7;
  padding: 5px 8px;
  border-radius: 3px;
  width: 130px;
  text-align: center;
  font-weight: bold;
  margin-top: 12px;
  display: block;
  color: #222222;
  outline: none;
  border: none;
  font-family: "Nunito", sans-serif;
  font-size: 15px;
  cursor: pointer;
}

.setting-link:hover {
  background-color: #d7dce0;
}

.toggle {
  background-color: #d7dce0;
  border-radius: 360px;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 45px;
  padding: 3px;
  cursor: pointer;
}

.toggle:hover .toggle-circle {
  background-color: #f8fafb;
}

.toggle:hover .blue {
  background-color: #4d01e2;
}

.toggle-background {
  height: 32px;
  margin: 0;
  padding: 0px 2px;
  border-radius: 360px;
  width: 65px;
  /* background-color: #5600ff; */
  display: flex;
  align-items: center;
  justify-content: center;
  transition: 0.2s ease-in-out;
}

.toggle-circle {
  background-color: #e9eced;
  height: 28px;
  width: 28px;
  box-sizing: border-box;
  margin: 0;
  padding: 0px;
  border-radius: 360px;
  transition: 0.2s ease-in-out;
}

.blue {
  background-color: #5600ff;
}

.enabled {
  margin-left: auto;
}

.disabled {
  margin-right: auto;
}

/* .newRoom {
  background-color: #000000;
  color: white;
}

.newRoom:hover {
  background-color: #333;
} */

.room-title {
  font-size: 55px;
  font-weight: 600;
  text-transform: capitalize;
  text-align: center;
  max-width: 600px;
  padding: 2px;
  transition: all 0.2s;
  word-break: break-word;
  cursor: text;
  border-radius: 10px;
  /* color: #1e2f58; */
  display: inline-block;
  font-weight: 900;
  line-height: 1.2;
  margin-left: -2px;
  margin-right: 2px;
  padding: 1px 2px;
  transition: all 0.2s;
  word-break: break-word;
  min-width: 215px;
  outline: none;
  border: none;
  font-family: "Nunito", sans-serif;
  background-color: transparent;
}

.room-title:hover,
.room-title:focus {
  /* background: #eceff4; */
  background: #edf0f1;
  outline: none;
}

.edit-title {
  font-size: 40px;
  font-weight: 600;
  text-align: left;
  margin-right: auto;
  margin-left: auto;
  margin-bottom: 20px;
}

.setting-subtitle {
  margin-bottom: 45px;
  line-height: 20px;
  width: 450px;
}

.setting-helper {
  margin-top: 10px;
  font-weight: bold;
  cursor: pointer;
  border: none;
  outline: none;
  font-size: 16px;
  font-family: "Nunito", sans-serif;
  padding: 0px;
  border-radius: 3px;
  background-color: transparent;
  color: #222;
}

.setting-helper:hover {
  color: #656565;
}

.setting-input {
  border: 1px solid #eee;
  border-radius: 10px;
  width: 300px;
  caret-color: #666;
  padding: 8px 14px;
  font-size: 20px;
  font-family: "Nunito", sans-serif;
  transition: 0.2s ease;
  box-sizing: border-box;
  outline: none;
  margin-top: 14px;
}

.setting-input:hover {
  border-color: #ccc;
}

.setting-input:focus {
  border-color: #ccc;
}

.myrooms {
  margin-bottom: 100px;
  margin-top: 50px;
  width: 765px;
  margin-left: auto;
  margin-right: auto;
}

.myrooms-sub {
  margin-top: 5px;
}

.rooms {
  width: 800px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  /* background-color: #f3f4f7eb; */
  border-radius: 4px;
}

.link-container {
  display: flex;
  flex-direction: row;
  align-items: center;
  margin-top: 8px;
}

.link-icon {
  margin-right: 4px;
}

.room-url {
  margin-top: 5px;
  cursor: pointer;
  display: block;
  color: #555561;
  font-weight: 700;
  font-size: 18px;
}

.room-url:hover {
  text-decoration: underline;
}

.profile-row {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
}

.bio-row {
  padding-top: 30px;
}

/* -------------------------
    radio buttons
------------------------- */

.switch-field {
  display: flex;
  margin-top: 15px;
  overflow: hidden;
}

.switch-field input {
  position: absolute !important;
  clip: rect(0, 0, 0, 0);
  height: 1px;
  width: 1px;
  border: 0;
  overflow: hidden;
}

.switch-field label {
  background-color: #d7dce2;
  color: #1b263b;
  font-size: 18px;
  font-weight: bold;
  line-height: 1;
  text-align: center;
  padding: 12px 22px;
  margin-right: -1px;
  transition: all 0.1s ease-in-out;
  border: 1px solid #d2d8e0;
  width: 120px;
  height: 90px;
  margin: 2px 12px;
  border-radius: 3px;
}

.switch-field label:hover {
  cursor: pointer;
  background-color: #a6afbd;
}

.switch-field input:checked + label {
  background-color: #212225;
  box-shadow: none;
  border: 3px solid #5d646d;
  color: #f2f4f7;
}

#radio-one:checked {
  border-right: none;
}

#radio-two:checked {
  border-left: none;
}

/* .switch-field label:first-of-type {
  border-radius: 4px 0 0 4px;
}

.switch-field label:last-of-type {
  border-radius: 0 4px 4px 0;
} */

.preference {
  margin-bottom: 20px;
  border-radius: 6px;
  padding: 10px 16px 10px 16px;
  /* cursor: pointer;
  cursor: grab; */
  cursor: move;
}

.smooth-dnd-ghost {
  border-radius: 6px;
  border-color: transparent !important;
  padding: 0px !important;
  margin: 0px !important;
  background-color: transparent !important;
  height: 200px !important;
}

.preference:hover,
.smooth-dnd-ghost {
  background-color: #e7ebf0 !important;
}

.preference-header {
  display: flex;
  align-items: center;
  justify-content: center;
  /* justify-content: space-between; */
  padding: 6px 24px;
  background-color: #e7ebf0;
  border-radius: 4px;
}

.preference-number {
  background-color: #d7dce1;
  border-radius: 360px;
  padding: 14px;
  font-size: 20px;
  font-weight: bold;
  width: 14px;
  height: 14px;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #1b273a;
}

.preference-name {
  font-size: 28px;
  margin: 0px 14px;
  color: #000000;
  font-weight: 600;
}
.preference-choice {
  display: flex;
}

.italic {
  font-style: italic;
}
</style>