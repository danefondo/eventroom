<template>
  <div class="col-md-6 box">
    <div class="roomTitle">
      <span v-if="loading"> Loading... {{ eventroomId }}</span>
      <span v-else-if="!loading && eventroomId">
        Connected to {{ eventroomId }}</span
      >
    </div>
    <div class="row remote_video_container">
      <!-- <div id="remoteTrack" ref="localVideoBlock"></div> -->
      <div class="remote-containers">
        <div
          class="remote-container"
          v-for="participant in participants"
          :id="participant.identity"
          :key="participant.sid"
        ></div>
      </div>
    </div>
    <div id="localScreenshare" ref="localscreenshare"></div>
    <div class="spacing"></div>
    <div class="row">
      <div id="localTrack"></div>
    </div>
  </div>
</template>

<script>
import {
  connect,
  LocalVideoTrack,
  // createLocalTracks,
  // createLocalVideoTrack,
} from "twilio-video";
import axios from "axios";
import { mapState } from "vuex";

function initialState() {
  return {
    loading: false,
    data: {},
    localTrack: false,
    localScreenTrack: null,
    remoteTrack: "",
    activeRoom: "",
    previewTracks: "",
    identity: "",
    roomId: null,
    room: null,
    localVideoBlock: null,
    participants: [],
    // participantsData: [],
    NoParticipantsFoundError: false,
    ProfilesNotFound: false,
    remoteParticipant: {
      identity: "",
      sid: "",
    },
    localParticipant: {
      identity: "",
      sid: "",
    },
  };
}

export default {
  name: "TwilioVideo",
  data: function () {
    return initialState();
  },
  props: ["userId", "eventroomId"],
  created() {
    this.attemptLaunchTwilioVideo(this.eventroomId);
  },
  mounted() {
    this.localVideoBlock = this.$refs.localVideoBlock;
  },
  computed: {
    ...mapState({
      localVideoTrack: (state) => state.mediastates.twilioVideo.localVideoTrack,
      userMediaSettings: (state) => state.mediastates.userMediaSettings,
    }),
  },
  methods: {
    prepareToExit() {
      console.log("@prepareToExit, Attempting exit...");
      this.localVideoTrack.stop();
      // this.localVideoTrack.srcObject = null;
      this.room.disconnect();
      this.$store.dispatch("participants/resetState");
      this.$store.dispatch("toolbar/resetState");
      initialState();
    },
    async getAccessToken() {
      try {
        let userId = this.userId;
        let tokenData = {
          identity: userId,
        };

        return await axios.post(
          `/api/eventroom/generateTwilioAccessToken`,
          tokenData
        );
      } catch (error) {
        console.log("Failed to get access token", error);
      }
    },
    // Trigger log events
    dispatchLog(logMessage) {
      this.$store.dispatch("roomlogs/addNewLog", logMessage);
    },

    /**
     * Attach a Participant's Track to the DOM.
     * @param track - the Track to attach
     * @param participant - the Participant which published the Track
     */
    attachTrack(track, participant) {
      // Find HTML element matching participant's identity id.

      let containerRef = participant.identity;
      console.log("@attachTrack, containerRef:", containerRef);
      let participants = JSON.parse(JSON.stringify(this.participants));
      console.log("@attachTrack, participants:", participants);
      let container = document.getElementById(containerRef);
      console.log("@attachTrack, container:", container);

      // Attach Participant's track to the element.
      container.appendChild(track.attach());

      // If the attached Track is a VideoTrack that is published by the active
      // Participant, then attach it to the main video as well.
      // if (track.kind === "video" && participant === activeParticipant) {
      //   track.attach($activeVideo.get(0));
      //   $activeVideo.css("opacity", "");
      // }
    },

    /**
     * Detach a Track from the DOM.
     * @param track - the Track to be detached
     * @param participant - the Participant that is publishing the Track
     */
    detachTrack(track, participant) {
      // Detach the Participant's Track from the thumbnail.
      console.log("participant track detach", track, participant);
      if (track.kind !== "data") {
        track.detach().forEach((detachedElement) => {
          console.log("detachedElement", detachedElement);
          detachedElement.remove();
        });
      }

      // let containerRef = participant.identity;
      // let container = document.getElementById(containerRef);

      // track.detach().forEach(element => element.remove());

      // If the detached Track is a VideoTrack that is published by the active
      // Participant, then detach it from the main video as well.
      // if (track.kind === "video" && participant === activeParticipant) {
      //   track.detach($activeVideo.get(0));
      //   $activeVideo.css("opacity", "0");
      // }
    },

    getTracks(participant) {
      return Array.from(participant.tracks.values())
        .filter(function (publication) {
          return publication.track;
        })
        .map(function (publication) {
          return publication.track;
        });
    },

    detachParticipantTracks(participant) {
      var tracks = this.getTracks(participant);
      this.detachTracks(tracks);
    },

    detachTracks(tracks) {
      for (let track of tracks) {
        const htmlElements = track.detach();
        for (let htmlElement of htmlElements) {
          htmlElement.remove();
        }
      }
    },

    onParticipantUnpublishedTrack(track, trackPublication) {
      console.log("trackPublication", trackPublication);
      let globalThis = this;
      globalThis.detachTracks([track]);
    },

    vueDestructDisconnectedParticipant(participant) {
      let participants = this.participants;
      let arrayIndex = participants.findIndex((p) => p.sid === participant.sid);
      participants.splice(arrayIndex, 1);
    },

    /**
     * Handle the Participant's media.
     * @param participant - the Participant
     * @param room - the Room that the Participant joined
     */
    participantConnected(participant, room, isLocal = false) {
      let globalThis = this;
      // Set up the Participant's media container.
      // setupParticipantContainer(participant, room);

      // let containerRef = participant.identity;

      console.log("participant & room", participant, room);
      globalThis.participants.push(participant);

      globalThis.$nextTick(() => {
        // Scroll Down

        // Handle the TrackPublications already published by the Participant.
        participant.tracks.forEach((publication) => {
          globalThis.trackPublished(publication, participant);
        });

        if (isLocal && !this.localTrack) {
          globalThis.localTrack = true;
        }

        // participant.on("trackSubscribed", (track) =>
        //   globalThis.trackSubscribed(containerRef, track)
        // );
        // participant.on("trackUnsubscribed", globalThis.trackUnsubscribed);

        /**
         * Handle Remote Participant publishing a track after they have joined the room
         */
        participant.on("trackPublished", (publication) => {
          globalThis.trackPublished(publication, participant);
        });

        participant.on("disconnected", (publication) => {
          console.log("participant disconnected", publication);
        });

        // FOR VUEJS, TRACK UNPUBLISH
        /**
         * Handle Remote Participant unpublishing a track after they have joined the room
         */
        participant.on("trackUnpublished", (publication) => {
          console.log(
            "@trackUnpublished, probably paused;participant unpublished track",
            publication
          );
          globalThis.trackUnpublished(publication, participant);
        });
      });
    },
    // trackSubscribed(containerRef, track) {
    //   let container = document.getElementById(containerRef);
    //   container.appendChild(track.attach());
    // },
    // trackUnsubscribed(track) {
    //   track.detach().forEach((element) => element.remove());
    // },
    /**
     * Handle a disconnected Participant.
     * @param participant - the disconnected Participant
     * @param room - the Room that the Participant disconnected from
     */
    participantDisconnected(participant, room) {
      // let globalThis = this;

      // If the disconnected Participant was pinned as the active Participant, then
      // unpin it so that the active Participant can be updated.
      // if (activeParticipant === participant && isActiveParticipantPinned) {
      //   isActiveParticipantPinned = false;
      //   globalThis.setCurrentActiveParticipant(room);
      // }

      console.log("Disconnect detatch starting", participant);
      let globalThis = this;
      console.log("Participants tracks", participant.tracks);
      // let tracks = globalThis.getTracks(participant);
      participant.tracks.forEach(function (track) {
        globalThis.detachTrack(track, participant);
      });

      console.log("Later remove from vue data array", participant, room);
      console.log("PARTICIPANT SID BEFORE REMOVAL");
      let participants = this.participants;
      let arrayIndex = participants.findIndex((p) => p.sid === participant.sid);
      participants.splice(arrayIndex, 1);
    },

    /**
     * Handle to the TrackPublication's media.
     * @param publication - the TrackPublication
     * @param participant - the publishing Participant
     */
    trackPublished(publication, participant) {
      let globalThis = this;

      console.log("publicationyyy", publication);
      if (publication && publication.track) {
        if (publication.track.name && publication.track.name == "screen") {
          return;
        }
      }

      // If the RemoteTrackPublication is already subscribed to, then attach the Track to the DOM.
      if (publication.track) {
        globalThis.attachTrack(publication.track, participant);
      }

      /**
       * LocalParticipant subscribed to RemoteTrack.
       * When TrackPublication is subscribed to, attach the Track to the DOM.
       */
      publication.on("subscribed", (track) => {
        globalThis.attachTrack(track, participant);
      });

      /**
       * LocalParticipant unsubscribed from RemoteTrack.
       * When TrackPublication is unsubscribed to, detach the Track from the DOM.
       */
      publication.on("unsubscribed", (track) => {
        console.log("unsubscribed from track", track);
        // globalThis.detachTrack(track, participant);
      });

      publication.on("subscriptionFailed", (error) => {
        console.warn("Subscription to publication failed.", error);
      });
    },

    trackUnpublished(publication, participant) {
      console.log(
        "@trackUnpublished, user probably stopped camera.",
        publication,
        participant
      );
    },

    /**
     * Join a Room.
     * @param token - the AccessToken used to join a Room
     * @param connectOptions - the ConnectOptions used to join a Room
     */
    async connectToRoom(token, connectOptions, eventroomId) {
      let globalThis = this;

      // Join to the Room with the given AccessToken and ConnectOptions.
      const twilioRoom = await connect(token, connectOptions);
      this.room = twilioRoom;
      let room = this.room;

      // console.log('Successfully joined a Room: ', room);
      globalThis.dispatchLog("Successfully joined a Room: " + eventroomId);
      // set active toom
      globalThis.activeRoom = room;
      globalThis.roomId = eventroomId;
      globalThis.loading = false;

      // Save the LocalVideoTrack.
      let localVideoTrack = Array.from(
        room.localParticipant.videoTracks.values()
      )[0].track;

      const vuexQuery = "mediastates/setTwilioVideoLocalStream";
      this.$store.dispatch(vuexQuery, localVideoTrack);

      // Handle the LocalParticipant's media.
      this.participantConnected(room.localParticipant, room, true);

      // Subscribe to the media published by RemoteParticipants already in the Room.
      room.participants.forEach((participant) => {
        globalThis.participantConnected(participant, room);
      });

      // Subscribe to the media published by RemoteParticipants joining the Room later.
      room.on("participantConnected", (participant) => {
        globalThis.participantConnected(participant, room);
      });

      // Handle a disconnected RemoteParticipant.
      room.on("participantDisconnected", (participant) => {
        console.log("PARTICIPANT DISCONNECTED", participant);
        globalThis.vueDestructDisconnectedParticipant(participant);
        // globalThis.detachParticipantTracks(participant);
        // globalThis.participantDisconnected(participant, room);
      });

      // room.on("trackUnsubscribed", globalThis.onParticipantUnpublishedTrack);

      // // Access LocalTracks that are published after connecting to the Room.
      // room.localParticipant.on("trackPublished", globalThis.trackPublished);
      // // if local preview is not active, create it
      // if (!globalThis.localTrack) {
      //   createLocalVideoTrack().then((track) => {
      //     let localMediaContainer = globalThis.$refs.localVideoBlock;
      //     localMediaContainer.appendChild(track.attach());
      //     globalThis.localTrack = true;
      //   });
      // }

      room.on("reconnecting", (error) => {
        // Warn and/or update your application's UI.
        console.warn("Reconnecting!", error);
      });

      room.on("reconnected", () => {
        // Log and/or update your application's UI.
        console.log("Reconnected!");
      });

      /**
       * Handle when room is set to 'completed' status through
       * REST API. Just kick everyone out to Room completed page.
       * https://github.com/twilio/twilio-video.js/pull/380/files
       */
      room.once("disconnected", (room, error) => {
        if (!error) {
          console.log("You disconnected from the Room by calling `disconnect`");
          return;
        }
        switch (error.code) {
          case 53118:
            console.log("The Room was completed server-side");
            break;
          // Handle any other errors of interest.
          default:
            console.error(`You were disconnected: ${error.message}`);
            break;
        }

        // Stop the LocalVideoTrack.
        this.localVideoTrack.stop();

        // Handle the disconnected LocalParticipant.
        this.participantDisconnected(room.localParticipant, room);

        // Handle the disconnected RemoteParticipants.
        room.participants.forEach((participant) => {
          this.participantDisconnected(participant, room);
        });

        // Clear the active Participant's video.
        // $activeVideo.get(0).srcObject = null;

        // Clear the Room reference used for debugging from the JavaScript console.
        this.room = null;
      });

      window.onbeforeunload = () => {
        room.disconnect();
      };

      // // Set the current active Participant.
      // this.setCurrentActiveParticipant(room);
    },
    attemptLaunchTwilioVideo(eventroomId) {
      this.loading = true;
      const globalThis = this;
      this.getAccessToken().then((data) => {
        globalThis.roomId = null;

        const token = data.data.token;
        let connectOptions = {
          name: eventroomId,
          // logLevel: 'debug',
          audio: true,
          video: { width: 400 },
        };
        // before a user enters a new room,
        // disconnect the user from they joined already
        // globalThis.leaveRoomIfJoined();

        // remove any remote track when joining a new room
        // document.getElementById("remoteTrack").innerHTML = "";
        globalThis.connectToRoom(token, connectOptions, eventroomId);
      });
    },

    toggleVideo() {
      let globalThis = this;
      let localParticipant = this.room.localParticipant;
      localParticipant.videoTracks.forEach(function (videoTrack) {
        console.log("videoTrack", videoTrack);
        let settingData = {
          settingToToggle: "cameraOn",
        };

        if (videoTrack.track.isEnabled == true) {
          videoTrack.track.disable();
          settingData.settingState = false;
        } else {
          videoTrack.track.enable();
          settingData.settingState = true;
        }
        globalThis.$store.dispatch(
          "mediastates/setSpecificMediaSettingState",
          settingData
        );
      });
    },

    toggleAudio() {
      let globalThis = this;
      let localParticipant = this.room.localParticipant;
      localParticipant.audioTracks.forEach(function (audioTrack) {
        console.log("audioTrack", audioTrack);
        let settingData = {
          settingToToggle: "microphoneOn",
        };
        if (audioTrack.track.isEnabled == true) {
          audioTrack.track.disable();
          settingData.settingState = false;
        } else {
          audioTrack.track.enable();
          settingData.settingState = true;
        }
        globalThis.$store.dispatch(
          "mediastates/setSpecificMediaSettingState",
          settingData
        );
      });
    },

    async toggleScreenshare() {
      let globalThis = this;
      let settingData = {
        settingToToggle: "screenBeingShared",
      };

      if (this.userMediaSettings.screenBeingShared) {
        // Stop capturing your screen.
        globalThis.room.localParticipant.unpublishTrack(this.localScreenTrack);
        globalThis.localScreenTrack.stop();
        globalThis.localScreenTrack = null;

        settingData.settingState = false;
        globalThis.$store.dispatch(
          "mediastates/setSpecificMediaSettingState",
          settingData
        );
      } else {
        try {
          // Create and preview your local screen.
          let screenPreview = document.getElementById("localScreenshare");
          // let screenPreview = globalThis.$refs.localscreenshare;
          let screenTrack = await globalThis.createScreenshareTrack(720, 1280);
          // screenTrack.attach(screenPreview);
          console.log("screen", screenTrack);
          screenPreview.appendChild(screenTrack.attach());

          globalThis.localScreenTrack = screenTrack;
          globalThis.room.localParticipant.publishTrack(screenTrack);

          // Show the "Capture Screen" button after screen capture stops.
          // screenTrack.on("stopped");
          // Show the "Stop Capture Screen" button.
          settingData.settingState = true;
          globalThis.$store.dispatch(
            "mediastates/setSpecificMediaSettingState",
            settingData
          );
        } catch (e) {
          alert(e.message);
        }
      }
    },

    createScreenshareTrack(height, width) {
      if (
        typeof navigator === "undefined" ||
        !navigator.mediaDevices ||
        !navigator.mediaDevices.getDisplayMedia
      ) {
        return Promise.reject(new Error("getDisplayMedia is not supported"));
      }
      return navigator.mediaDevices
        .getDisplayMedia({
          video: {
            height: height,
            width: width,
          },
        })
        .then(function (stream) {
          let track = stream.getVideoTracks()[0];
          return new LocalVideoTrack(track, { name: "screen" });
        });
    },

    togglePictureInPicture() {},

    async getManyProfilesByUserIds() {
      // Run every time someone is pushed into participants
      console.log("@getManyProfilesByUserIds");
      let participants = this.participants; // get their ids
      let participantIds = [];
      let errors = {};
      let globalThis = this;

      participants.forEach(function (participant) {
        console.log("@singleParticipant", participant);
        let userId = participant.identity;
        if (userId) {
          participantIds.push(userId);
        }
      });
      console.log("@participantIds", participantIds);

      try {
        if (!participantIds) throw { NoParticipantsFoundError: true };

        let requestData = {
          participantIds,
        };

        const query = `/api/profiles/getManyProfilesByUserIds`;
        let response = await axios.post(query, requestData);

        let profiles = response.data.result;
        console.log("profiles", response);

        if (!profiles) throw { ProfilesNotFound: true };

        profiles.forEach(function (profile) {
           globalThis.$store.dispatch("participants/addParticipant", profile);
        });
      } catch (error) {
        console.log(error);
        if (errors.NoParticipantsFoundError) {
          this.NoParticipantsFoundError = true;
        }

        if (errors.ProfilesNotFound) {
          this.ProfilesNotFound = true;
        }
      }
    },
  },
  watch: {
    participants: function () {
      this.getManyProfilesByUserIds();
    },
  },
};

/*
OVERVIEW OF WHAT MUST HAPPEN IN TWILIO VIDEO.

1. After client connects to Twilio Video using their access token
  1.1 Add all existing participants to to participants list
    -> This creates the VueJS <div> in the DOM for the participant
    -> The <div> will have participant.sid & participant.identity as identifiers
  1.2 Setup listening to participant 'trackSubscribed' && 'trackUnsubscribed' with respective functions set up to either attach or remove media
  1.2 Attach published media tracks to the newly created <div>


* Handling new Twilio patterns
* https://www.twilio.com/docs/video/migrating-1x-2x#trackpublication

A LocalTrackPublication is created when a LocalParticipant successfully publishes a LocalTrack


EVENTS THAT CAN OCCUR IN TWILIO VIDEO.
And what should ideally happen when
those events fire.

ROOM
- 'participantConnected'
    --> Create div for participant's tracks
    --> Associate sid & identity with div
    --> Subscribe to track
- 'participantDisconnected'

PARTICIPANT
- 'trackPublished'
- 'trackUnpublished' --> Fires when remote participant disconnects

"trackPublished" is emitted on a RemoteParticipant when it successfully publishes a RemoteTrack after joining a Room, where as "trackSubscribed" is emitted when the LocalParticipant successfully subscribes to a RemoteParticipant's published RemoteTrack.
"trackPublished" and "trackUnpublished" events help to keep track of published RemoteTracks (through their corresponding RemoteTrackPublications).

PUBLICATION
- 'subscribed'
- 'unsubscribed'

AVAILABLE ACTIONS
Unpublish local participant's track
- LocalParticipant.unpublishTrack()
- localParticipant.videoTracks.forEach(trackPublication => trackPublication.unpublish())

Publish local participant's video track
- createLocalVideoTrack().then(track => localParticipant.publishTrack(track))


ORDER OF EVENTS
https://github.com/twilio/twilio-video.js/issues/391

When a RemoteParticipant publishes a RemoteTrack 
1. remoteParticipant.on('trackPublished', remoteTrackPublication => {
  2. If successfully subscribed
  remoteTrackPublication.on('subscribed', remoteTrack => {...});

  2. If failed to subscribe
  remoteTrackPublication.on('subscriptionFailed', error => {...});
});

3. If successfully subscribed
remoteParticipant.on('trackSubscribed', (remoteTrack, remoteTrackPublication) => {...});

3. If failed to subscribe
remoteParticipant.on('trackSubscriptionFailed', (error, remoteTrackPublication) => {...});

When RemoteParticipant unpublishes a RemoteTrack
1. publication.on("unsubscribed")
2. remoteParticipant.on('trackUnsubscribed')
3. remoteParticipant.on('trackUnpublished')

When RemoteParticipant disconnects from the Room
1. "unsubscribed" on each RemoteTrackPublication of the RemoteParticipant
2. "trackUnsubscribed" on the RemoteParticipant for each published RemoteTrack


*/
</script>

<style >
.remote_video_container {
  left: 0;
  margin: 0;
  border: 1px solid rgb(124, 129, 124);
}
#localTrack video {
  border: 3px solid rgb(124, 129, 124);
  margin: 0px;
  max-width: 50% !important;
  background-repeat: no-repeat;
}
.spacing {
  padding: 20px;
  width: 100%;
}
.roomTitle {
  border: 1px solid rgb(124, 129, 124);
  padding: 4px;
  color: dodgerblue;
}
</style>