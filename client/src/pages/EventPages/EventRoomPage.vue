<template>
  <div class="eventroom-container party" v-if="room">
    <SettingsModal />
    <div class="eventroom-ribbon">
      <div class="eventroom-layout-controls">
        <div class="eventroom-chat-icon">Chat o/c</div>
        <LayoutSelector v-if="layoutSelectorShown" />
        <div
          class="dropdown"
          @click="layoutSelectorShown ? layoutSelectorShown=false : layoutSelectorShown=true"
        >
          <div class="toggle">
            <div class="control">
              <svg
                class="icon"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                height="24"
                width="24"
                stroke="currentColor"
                stroke-width="2"
                stroke-linejoin="round"
                stroke-linecap="round"
              >
                <rect
                  x="2"
                  y="2"
                  width="20"
                  height="20"
                  rx="4"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
                <path
                  fill="currentColor"
                  fill-opacity="0.4"
                  d="M2 6C2 3.79086 3.79086 2 6 2H7V12V22H6C3.79086 22 2 20.2091 2 18V6Z"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
                <path
                  fill="currentColor"
                  fill-opacity="0.4"
                  d="M22 6C22 3.79086 20.2091 2 18 2H17V12V22H18C20.2091 22 22 20.2091 22 18V6Z"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="eventroom-panel">
      <SearchForm v-on:search="search" />
      <NoVideosText v-if="videos" />
      <SearchResults
        v-if="videos.length > 0"
        v-bind:videos="videos"
        v-bind:reformattedSearchString="reformattedSearchString"
      />
      <Pagination
        v-if="videos.length > 0"
        v-bind:prevPageToken="api.prevPageToken"
        v-bind:nextPageToken="api.nextPageToken"
        v-on:prev-page="prevPage"
        v-on:next-page="nextPage"
      />
    </div>
    <!-- <div class="eventroom-feed"></div> -->
    <div
      v-if="filteredForSpotlightObjects.length > 0"
      id="spotlight-boxes"
      class="spotlight-boxes empty"
    >
      <SpotlightBox
        v-for="boxData in filteredForSpotlightObjects"
        :key="boxData.objectId"
        :boxData="boxData"
        ref="spotlight"
        @removeFromSpotlight="removeFromSpotlight"
        @spotlightContainerReady="startPublishingSpotlightStream"
      />
    </div>
    <EmptyVideoPanel v-if="spotlightStreams.length < 1" />
    <div class="watch">
      <div class="host-bar">
        <div class="is_host">{{userIsHost ? 'You are the HOST!' : 'You are currently not a host.'}}</div>
      </div>
      <div v-if="filteredForRegularObjects.length > 0" id="container-boxes">
        <ContainerBox
          v-for="boxData in filteredForRegularObjects"
          :key="boxData.objectId"
          :boxData="boxData"
          ref="nonspotlight"
          @addToSpotlight="addToSpotlight"
          @containerReady="startPublishingContainerStream"
        />
      </div>
      <Session
        v-if="sessionId &amp;&amp; apiKey &amp;&amp; token"
        :sessionId="sessionId"
        :apiKey="apiKey"
        :token="token"
        :participants="currentBoxObjects"
        ref="session"
        @participantData="addParticipantToBox"
        @updatedParticipantData="findAndUpdateParticipantBox"
        @participantLeft="findAndRemoveParticipantBox"
      ></Session>
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";

import axios from "axios";
import auth from "../../config/auth";
import { setTempToken } from "../../config/axios";
import Session from "../../components/Session";
import SpotlightBox from "../../components/EventComponents/EventRoomComponents/SpotlightBox";
import ContainerBox from "../../components/EventComponents/EventRoomComponents/ContainerBox";
import SettingsModal from "../../components/EventComponents/EventRoomComponents/SettingsModal";
import SearchForm from "../../components/EventComponents/EventRoomComponents/SearchForm";
import SearchResults from "../../components/EventComponents/EventRoomComponents/SearchResults";
import Pagination from "../../components/EventComponents/EventRoomComponents/Pagination";
import LayoutSelector from "../../components/EventComponents/EventRoomComponents/LayoutSelector";
import NoVideosText from "../../components/EventComponents/EventRoomComponents/NoVideosText";
import EmptyVideoPanel from "../../components/EventComponents/EventRoomComponents/EmptyVideoPanel";

export default {
  name: "EventRoomPage",
  data() {
    return {
      tempUser: {},
      room: {},
      event: {},
      sessionId: "",
      apiKey: "",
      token: "",
      hostPresent: false,
      userIsHost: false,
      isConnected: false,
      connection: null,
      layoutSelectorShown: false,
      videos: [],
      reformattedSearchString: "",
      api: {
        q: "",
        prevPageToken: "",
        nextPageToken: "",
      },
      currentlyInSpotlight: 0,
      spotlightStreams: [],
      regularStreams: [],
      currentParticipantsCount: 0,
      currentBoxObjects: [],
      filteredForSpotlightObjects: [],
      filteredForRegularObjects: [],
    };
  },
  computed: {
    ...mapState({
      user: (state) => state.auth.user,
      isAuthenticated: (state) => state.auth.authenticationStatus,
      isVerified: (state) => state.auth.verificationStatus,
    }),
  },
  beforeRouteLeave(to, from, next) {
    this.$refs.session.disconnect();
    next();
  },
  components: {
    Session,
    SpotlightBox,
    ContainerBox,
    SettingsModal,
    SearchForm,
    SearchResults,
    Pagination,
    LayoutSelector,
    NoVideosText,
    EmptyVideoPanel,
  },
  async mounted() {
    if (!this.$store.state.auth.authenticationStatus) {
      this.createTempUser();
    }

    if (this.$store.state.auth.user) {
      this.getRoom();
    }
  },
  methods: {
    addParticipantToBox(participant) {
      this.currentBoxObjects.push(participant);
      this.filteredForRegularObjects.push(
        JSON.parse(JSON.stringify(participant))
      );
      console.log(
        "@Publisher-6/Subscriber-5, @EventRoomPage.vue participant container object added to currentBoxObjects",
        this.currentBoxObjects
      );
    },
    findAndUpdateParticipantBox(newDetails) {
      let objectId = newDetails.objectRefId;
      let obj = this.currentBoxObjects.find((e) => e.objectId === objectId);
      let regular = this.filteredForRegularObjects.find(
        (e) => e.objectId === objectId
      );
      let spotlight = this.filteredForSpotlightObjects.find(
        (e) => e.objectId === objectId
      );

      if (obj) {
        // to maintain reactivity, use $set as opposed to obj.x = newValue
        this.$set(obj, "streamId", newDetails.streamId);
        this.$set(obj, "elementId", newDetails.elementId);
      }

      if (regular) {
        // to maintain reactivity, use $set as opposed to obj.x = newValue
        this.$set(regular, "streamId", newDetails.streamId);
        this.$set(regular, "elementId", newDetails.elementId);
      } else if (spotlight) {
        // to maintain reactivity, use $set as opposed to obj.x = newValue
        this.$set(spotlight, "streamId", newDetails.streamId);
        this.$set(spotlight, "elementId", newDetails.elementId);
      }

      console.log("participant updated", this.currentBoxObjects);
    },
    findAndRemoveParticipantBox(participantStreamId) {
      // When user has left, remove them from default boxes
      let participantBoxes = this.currentBoxObjects;
      let index = participantBoxes.findIndex(
        (box) => box.streamId === participantStreamId
      );
      participantBoxes.splice(index, 1);

      // When user has left, remove them from spotlight boxes
      let spotlightBoxes = this.filteredForSpotlightObjects;
      let arrayIndex = spotlightBoxes.findIndex(
        (box) => box.streamId === participantStreamId
      );
      spotlightBoxes.splice(arrayIndex, 1);
    },
    addToSpotlight(containerId) {
      console.log(
        "@2 @EventRoomPage.vue Received emit with containerId for add container to spotlight from ContainerBox.vue"
      );
      let container = this.currentBoxObjects.find(
        (box) => box.objectId === containerId
      );

      console.log(
        "@3 @EventRoomPage.vue Iterated over currentBoxObjects and grabbed correct container by passed containerId"
      );

      let elementId = container.elementId;

      // stop publishing / subscribing
      if (container.type == "publisher") {
        console.log(
          "@4 @EventRoomPage.vue About to activate function in subcomponent session to stopPublishingStream() where it is for a Publisher object"
        );
        this.$refs.session.stopPublishingStream();
      } else if (container.type == "subscriber") {
        console.log(
          "@4 @EventRoomPage.vue About to activate function in subcomponent session to stopSubscribingToStream() where it is for a Subscriber object"
        );
        this.$refs.session.stopSubscribingToStream(elementId);
      }

      console.log(
        "@7/@8 @EventRoomPage.vue, Stopped or in process of stopping publishing/subscribing"
      );
      // changing spotlight to true removes old box automatically
      this.$set(container, "republishInProcess", true);
      this.$set(container, "spotlight", true);
      console.log(
        "@8/@9 @EventRoomPage.vue, Set republishing to true, set spotlight to true for container object in currentBoxObjects"
      );
      let spotlightContainer = JSON.parse(JSON.stringify(container));
      this.spotlightStreams.push(spotlightContainer);
      this.filteredForSpotlightObjects.push(spotlightContainer);
      console.log(
        "@9/@10 @EventRoomPage.vue, Pushed new spotlight container to spotlightStreams"
      );

      let regularStreams = this.regularStreams;
      let index = regularStreams.findIndex(
        (box) => box.objectId === containerId
      );
      regularStreams.splice(index, 1);

      let regularBoxes = this.filteredForRegularObjects;
      let indexArray = regularBoxes.findIndex(
        (box) => box.objectId === containerId
      );
      regularBoxes.splice(indexArray, 1);
    },
    removeFromSpotlight(containerId) {
      let container = this.currentBoxObjects.find(
        (box) => box.objectId === containerId
      );

      let elementId = container.elementId;

      // stop publishing / subscribing
      if (container.type == "publisher") {
        this.$refs.session.stopPublishingStream();
      } else if (container.type == "subscriber") {
        this.$refs.session.stopSubscribingToStream(elementId);
      }

      // changing spotlight to true removes old box automatically
      this.$set(container, "republishInProcess", true);
      this.$set(container, "spotlight", false);
      let regularContainer = JSON.parse(JSON.stringify(container));
      this.regularStreams.push(regularContainer);
      this.filteredForRegularObjects.push(regularContainer);

      let spotlightStreams = this.spotlightStreams;
      let index = spotlightStreams.findIndex(
        (box) => box.objectId === containerId
      );
      spotlightStreams.splice(index, 1);

      let spotlightBoxes = this.filteredForSpotlightObjects;
      let indexArray = spotlightBoxes.findIndex(
        (box) => box.objectId === containerId
      );
      spotlightBoxes.splice(indexArray, 1);
    },
    startPublishingSpotlightStream(streamData) {
      // Send element id to identify subscriber / publisher
      console.log(
        "@11/@12 @EventRoomPage.vue, About to send signal to Session.vue to republish/resubscribe stream"
      );
      let containerId = streamData.objectId;
      this.$refs.session.setStreamToSpotlight(streamData);
      let container = this.currentBoxObjects.find(
        (box) => box.objectId === containerId
      );
      // Complete republish cycle
      this.$set(container, "republishInProcess", false);
    },
    startPublishingContainerStream(streamData) {
      console.log("streamData", streamData);
      let containerId = streamData.objectId;
      this.$refs.session.setStreamToSpotlight(streamData);
      let container = this.currentBoxObjects.find(
        (box) => box.objectId === containerId
      );
      // Complete republish cycle
      this.$set(container, "republishInProcess", false);
    },
    generateUniqueId(length) {
      return parseInt(
        Math.ceil(Math.random() * Date.now())
          .toPrecision(length)
          .toString()
          .replace(".", "")
      );
    },
    async createTempUser() {
      try {
        const roomIdParam = window.location.href.substring(
          window.location.href.lastIndexOf("/") + 1
        );
        const { data } = await axios.post(
          `/api/accounts/createTempUser`,
          roomIdParam
        );

        setTempToken(data.tempToken);
        localStorage.tempUser = JSON.stringify(data.tempUser);

        if (auth.checkTempToken()) {
          this.tempUser = auth.checkTempToken();
        }
      } catch (error) {
        console.log("Failed to create temporary user", error);
      }
    },
    async getRoom() {
      const roomIdParam = window.location.href.substring(
        window.location.href.lastIndexOf("/") + 1
      );
      try {
        const { data } = await axios.get(
          `/api/events/${this.$route.params.id}/getRoom/${roomIdParam}`
        );
        this.roomNotFound = false;
        this.room = data.room;
        this.sessionId = data.sessionId;
        this.apiKey = data.apiKey;
        this.token = data.token;

        //- SET HOST

        if (this.user && this.user._id == this.room.hostId) {
          this.userIsHost = true;
        }

        const roomId = this.room._id;
        let userId;
        if (this.tempUser) {
          userId = this.tempUser._id;
        } else {
          userId = this.user._id;
        }
        //- JOIN ROOM
        const roomData = {
          userId: userId,
          roomId: roomId,
        };
        this.$socket.emit("joinRoom", roomData);
      } catch (error) {
        console.log("event", error);
        this.roomNotFound = true;
      }
    },
    search(searchParams) {
      this.reformattedSearchString = searchParams.join(" ");
      this.api.q = searchParams.join("+");
      const { baseUrl, part, type, order, maxResults, q } = this.api;
      const apiUrl = `${baseUrl}part=${part}&type=${type}&order=${order}&q=${q}&maxResults=${maxResults}`;
      this.getData(apiUrl);
    },
    prevPage() {
      const {
        baseUrl,
        part,
        type,
        order,
        maxResults,
        q,
        key,
        prevPageToken,
      } = this.api;
      const apiUrl = `${baseUrl}part=${part}&type=${type}&order=${order}&q=${q}&maxResults=${maxResults}&key=${key}&pageToken=${prevPageToken}`;
      this.getData(apiUrl);
    },
    nextPage() {
      const {
        baseUrl,
        part,
        type,
        order,
        maxResults,
        q,
        key,
        nextPageToken,
      } = this.api;
      const apiUrl = `${baseUrl}part=${part}&type=${type}&order=${order}&q=${q}&maxResults=${maxResults}&key=${key}&pageToken=${nextPageToken}`;
      this.getData(apiUrl);
    },
    async getData() {
      try {
        let query = this.api.q;
        console.log("qq", query);
        let queryData = { query };
        const { data } = await axios.post(
          `/api/events/getYouTubeQuery`,
          queryData
        );
        console.log("data", data);
        this.videos = data.videos;
        // this.videos = res.data.items;
        // this.api.prevPageToken = res.data.prevPageToken;
        // this.api.nextPageToken = res.data.nextPageToken;
      } catch (error) {
        console.log("err", error);
      }
    },
  },
  watch: {
    tempUser: function () {
      if (this.tempUser) {
        this.getRoom();
      }
    },
  },
};
</script>

<style scoped>
.eventroom-feed {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  background-color: #242729;
  border-right: 1px solid #333537;
  width: 100%;
  height: 100%;
  overflow: hidden;
  position: relative;
}
.watch {
  width: 324px;
  max-height: 100%;
  height: 100%;
  background-color: #242729;
  overflow: hidden;
  padding: 20px;
}
.eventroom-container {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: row;
  /* justify-content: center; */
  align-items: center;
}
.eventroom-ribbon {
  width: 50px;
  background-color: #242729;
  height: 100%;
  border-right: 1px solid #333537;
}
.eventroom-panel {
  width: 324px;
  height: 100%;
  background-color: #242729;
  border-right: 1px solid #333537;
}
.title {
  font-size: 47px;
  margin-bottom: 20px;
}
.event-creator {
  display: flex;
  flex-direction: column;
  /* justify-content: center; */
  align-items: center;
  text-align: center;
  height: 100%;
}
.event-creator-inputs {
  margin-top: 104px;
  width: 275px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.event-creator-input {
  outline: none;
  padding: 10px;
  margin: 0 auto;
  margin-bottom: 15px;
  border: 1px solid #ddd;
  border-radius: 3px;
  font-size: 16px;
  min-width: 275px;
  max-width: 275px;
}
.event-creator-input:focus {
  border: 1px solid #493eff;
}

.input-title {
  text-align: left;
  margin-bottom: 7px;
}

.ck-creator-input {
  padding-top: 0px !important;
}

.ck-creator-input:focus {
  border: 1px solid #493eff !important;
}

/*! CSS Used from: https://campfire.gg/styles.04163730.css */
.dropdown {
  position: relative;
  display: flex;
  user-select: none;
}
.dropdown .toggle {
  display: flex;
  cursor: pointer;
}
.controls .control {
  display: flex;
  align-items: center;
  cursor: pointer;
}
* {
  box-sizing: border-box;
}
::-webkit-scrollbar {
  -webkit-appearance: none;
}
::-webkit-scrollbar-track {
  background-color: transparent;
}
::-webkit-scrollbar-thumb {
  background-color: rgba(0, 0, 0, 0.25);
}

.eventroom-container .spotlight-boxes {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  background-color: #000;
  border-right: 1px solid #333537;
  /* width: 100%; */
  height: 100%;
  overflow: hidden;
  position: relative;
  padding: 30px;
}
.eventroom-container .spotlight-boxes.empty {
  background-color: #242729;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  scrollbar-width: none;
}

/*! CSS Used keyframes */
@keyframes infiniteMove {
  0% {
    background-position: 0 0;
  }
  50% {
    background-position: 0 1200px;
  }
  to {
    background-position: 0 0;
  }
}
</style>