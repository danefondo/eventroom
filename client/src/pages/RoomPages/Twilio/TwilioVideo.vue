<template>
  <div class="col-md-6 box">
    <div class="roomTitle">
      <span v-if="loading"> Loading... {{ eventroomId }}</span>
      <span v-else-if="!loading && eventroomId">
        Connected to {{ eventroomId }}</span
      >
      <span v-else>Select a room to get started</span>
    </div>
    <div class="row remote_video_container">
      <div id="remoteTrack" ref="localVideoBlock">
        <!-- <audio autoplay style="opacity: 0"></audio>
        <video autoplay muted playsinline style="opacity: 0"></video> -->
      </div>
      <div class="remote-containers">
        <div
          class="remote-container"
          v-for="participant in participants"
          :id="participant.identity"
          :key="participant.sid"
        ></div>
      </div>
    </div>
    <div class="spacing"></div>
    <div class="row">
      <div id="localTrack"></div>
    </div>
  </div>
</template>

<script>
import {
  connect,
  // createLocalTracks,
  createLocalVideoTrack,
} from "twilio-video";
// import Twilio, {
//   connect,
//   // createLocalTracks,
//   createLocalVideoTrack,
// } from "twilio-video";
import axios from "axios";

export default {
  name: "TwilioVideo",
  data() {
    return {
      loading: false,
      data: {},
      localTrack: false,
      remoteTrack: "",
      activeRoom: "",
      previewTracks: "",
      identity: "",
      roomId: null,
      room: null,
      localVideoTrack: null,
      localVideoBlock: null,
      participants: [],
      remoteParticipant: {
        identity: "",
        sid: "",
      },
      localParticipant: {
        identity: "",
        sid: "",
      },
    };
  },
  props: ["userId", "eventroomId"], // props that will be passed to this component
  created() {
    console.log("YABABABABDOUUU");
    // this.createChat(this.eventroomId);
    this.produceAccessToken(this.eventroomId);
  },
  mounted() {
    this.localVideoBlock = this.$refs.localVideoBlock;
  },
  beforeRouteLeave(to, from, next) {
    // When a user is about to transition away from this page,
    // disconnect from the room, if joined.
    // this.$refs.session.disconnect();
    this.leaveRoomIfJoined;
    next();
  },
  methods: {
    async getAccessToken() {
      try {
        let userId = this.userId;
        let tokenData = {
          identity: userId,
        };
        console.log("generatingACCESSTOKEN, USERID", userId);
        return await axios.post(
          `/api/eventroom/generateTwilioAccessToken`,
          tokenData
        );
        // return await axios.get(`/api/eventroom/generateTwilioAccessToken?identity=${this.userId}`);
      } catch (error) {
        console.log("Failed to get access token", error);
      }
    },
    // Trigger log events
    dispatchLog(logMessage) {
      this.$store.dispatch("roomlogs/addNewLog", logMessage);
    },
    // Attach the Tracks to the DOM.
    attachTracks(tracks, container) {
      console.log("trackssss", tracks);
      console.log("contaaaainer", container);
      tracks.forEach(function (track) {
        container.appendChild(track.attach());
      });
    },
    // Attach the Participant's Tracks to the DOM.
    attachParticipantTracks(participant, container) {
      console.log("participantttttt", participant);
      let tracks = Array.from(participant.tracks.values());
      this.attachTracks(tracks, container);
    },
    // Detach the Tracks from the DOM.
    detachTracks(tracks) {
      tracks.forEach((track) => {
        track.detach().forEach((detachedElement) => {
          detachedElement.remove();
        });
      });
    },
    // Detach the Participant's Tracks from the DOM.
    detachParticipantTracks(participant) {
      let tracks = Array.from(participant.tracks.values());
      this.detachTracks(tracks);
    },
    // Leave Room.
    leaveRoomIfJoined() {
      if (this.activeRoom) {
        this.activeRoom.disconnect();
      }
    },

    /**
     * Attach a Track to the DOM.
     * @param track - the Track to attach
     * @param participant - the Participant which published the Track
     */
    attachTrack(track, participant) {
      // Attach the Participant's Track to the thumbnail.
      // const $media = $(`div#${participant.sid} > ${track.kind}`, $participants);
      // $media.css("opacity", "");
      // track.attach($media.get(0));

      let containerRef = participant.identity;
      let container = document.getElementById(containerRef);
      console.log("conta", container);
      container.appendChild(track.attach());

      // 1. Find correct div by participant sid
      // 2. Attach tracks to DOM

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
      // const $media = $(`div#${participant.sid} > ${track.kind}`, $participants);
      // $media.css("opacity", "0");
      // track.detach($media.get(0));

      console.log("participant detached", participant);
      // let containerRef = participant.identity;
      // let container = this.$refs[containerRef];
      track.detach().forEach((detachedElement) => {
        detachedElement.remove();
      });

      // If the detached Track is a VideoTrack that is published by the active
      // Participant, then detach it from the main video as well.
      // if (track.kind === "video" && participant === activeParticipant) {
      //   track.detach($activeVideo.get(0));
      //   $activeVideo.css("opacity", "0");
      // }
    },

    /**
     * Handle the Participant's media.
     * @param participant - the Participant
     * @param room - the Room that the Participant joined
     */
    participantConnected(participant, room) {
      let globalThis = this;
      // Set up the Participant's media container.
      // setupParticipantContainer(participant, room);

      console.log("room", room);
      // Handle the TrackPublications already published by the Participant.
      participant.tracks.forEach((publication) => {
        globalThis.trackPublished(publication, participant);
      });

      // Handle theTrackPublications that will be published by the Participant later.
      participant.on("trackPublished", (publication) => {
        globalThis.trackPublished(publication, participant);
      });

      // FOR VUEJS, TRACK UNPUBLISH
      // participant.on("trackUnpublished", (publication) => {
      //   globalThis.trackPublished(publication, participant);
      // });
    },

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

      console.log("Later remove from vue data array", participant, room);
      //DUE TO VUE MUST DETACH

      // Remove the Participant's media container.
      // $(`div#${participant.sid}`, $participants).remove();
    },

    /**
     * Handle to the TrackPublication's media.
     * @param publication - the TrackPublication
     * @param participant - the publishing Participant
     */
    trackPublished(publication, participant) {
      let globalThis = this;
      // If the TrackPublication is already subscribed to, then attach the Track to the DOM.
      if (publication.track) {
        globalThis.attachTrack(publication.track, participant);
      }

      // Once the TrackPublication is subscribed to, attach the Track to the DOM.
      publication.on("subscribed", (track) => {
        globalThis.attachTrack(track, participant);
      });

      // Once the TrackPublication is unsubscribed from, detach the Track from the DOM.
      publication.on("unsubscribed", (track) => {
        globalThis.detachTrack(track, participant);
      });
    },

    /**
     * Join a Room.
     * @param token - the AccessToken used to join a Room
     * @param connectOptions - the ConnectOptions used to join a Room
     */
    async connectToRoom(token, connectOptions, eventroomId) {
      let globalThis = this;

      // console.log('Successfully joined a Room: ', room);
      globalThis.dispatchLog("Successfully joined a Room: " + eventroomId);
      // set active toom
      globalThis.activeRoom = room;
      globalThis.roomId = eventroomId;
      globalThis.loading = false;

      // Join to the Room with the given AccessToken and ConnectOptions.
      const room = await connect(token, connectOptions);

      // Save the LocalVideoTrack.
      this.localVideoTrack = Array.from(
        room.localParticipant.videoTracks.values()
      )[0].track;

      // Make the Room available in the globally debugging.
      this.room = room;

      // Handle the LocalParticipant's media.
      // this.participantConnected(room.localParticipant, room);

      // Subscribe to the media published by RemoteParticipants already in the Room.
      // room.participants.forEach((participant) => {
      //   globalThis.participantConnected(participant, room);
      // });
      room.participants.forEach((participant) => {
        globalThis.participants.push(participant);
        globalThis.participantConnected(participant, room);
      });

      // Subscribe to the media published by RemoteParticipants joining the Room later.
      room.on("participantConnected", (participant) => {
        globalThis.participantConnected(participant, room);
      });

      // Handle a disconnected RemoteParticipant.
      room.on("participantDisconnected", (participant) => {
        globalThis.participantDisconnected(participant, room);
      });

      // Access LocalTracks that are published after connecting to the Room.
      room.localParticipant.on("trackPublished", globalThis.trackPublished);
      // if local preview is not active, create it
      if (!globalThis.localTrack) {
        createLocalVideoTrack().then((track) => {
          // let localMediaContainer = document.getElementById("localTrack");
          let localMediaContainer = globalThis.$refs.localVideoBlock;
          localMediaContainer.appendChild(track.attach());
          globalThis.localTrack = true;
        });
      }

      // // Set the current active Participant.
      // this.setCurrentActiveParticipant(room);
    },
    produceAccessToken(eventroomId) {
      this.loading = true;
      const VueThis = this;
      this.getAccessToken().then((data) => {
        VueThis.roomId = null;
        console.log("tokenDataaaaaa", data);
        const token = data.data.token;
        let connectOptions = {
          name: eventroomId,
          // logLevel: 'debug',
          audio: true,
          video: { width: 400 },
        };
        // before a user enters a new room,
        // disconnect the user from they joined already
        VueThis.leaveRoomIfJoined();

        // remove any remote track when joining a new room
        document.getElementById("remoteTrack").innerHTML = "";
        VueThis.connectToRoom(token, connectOptions, eventroomId);
      });
    },
    // createChat(eventroomId) {
    //   this.loading = true;
    //   const VueThis = this;
    //   this.getAccessToken().then((data) => {
    //     VueThis.roomId = null;
    //     console.log("tokenDataaaaaa", data);
    //     const token = data.data.token;
    //     let connectOptions = {
    //       name: eventroomId,
    //       // logLevel: 'debug',
    //       audio: true,
    //       video: { width: 400 },
    //     };
    //     // before a user enters a new room,
    //     // disconnect the user from they joined already
    //     this.leaveRoomIfJoined();

    //     // remove any remote track when joining a new room
    //     document.getElementById("remoteTrack").innerHTML = "";
    //     Twilio.connect(token, connectOptions).then(function (room) {
    //       // console.log('Successfully joined a Room: ', room);
    //       VueThis.dispatchLog("Successfully joined a Room: " + eventroomId);
    //       // set active toom
    //       VueThis.activeRoom = room;
    //       VueThis.roomId = eventroomId;
    //       VueThis.loading = false;
    //       // Attach the Tracks of the Room's Participants.
    //       room.participants.forEach(function (participant) {
    //         let previewContainer = document.getElementById("remoteTrack");
    //         VueThis.attachParticipantTracks(participant, previewContainer);
    //       });
    //       // When a Participant joins the Room, log the event.
    //       room.on("participantConnected", function (participant) {
    //         VueThis.dispatchLog("Joining: '" + participant.identity + "'");
    //       });
    //       // When a Participant adds a Track, attach it to the DOM.
    //       room.on("trackAdded", function (track, participant) {
    //         VueThis.dispatchLog(
    //           participant.identity + " added track: " + track.kind
    //         );
    //         let previewContainer = document.getElementById("remoteTrack");
    //         VueThis.attachTracks([track], previewContainer);
    //       });
    //       // When a Participant removes a Track, detach it from the DOM.
    //       room.on("trackRemoved", function (track, participant) {
    //         VueThis.dispatchLog(
    //           participant.identity + " removed track: " + track.kind
    //         );
    //         VueThis.detachTracks([track]);
    //       });
    //       // When a Participant leaves the Room, detach its Tracks.
    //       room.on("participantDisconnected", function (participant) {
    //         VueThis.dispatchLog(
    //           "Participant '" + participant.identity + "' left the room"
    //         );
    //         VueThis.detachParticipantTracks(participant);
    //       });

    //       // Access LocalTracks that are published after connecting to the Room.
    //       room.localParticipant.on("trackPublished", trackPublished);
    //       // if local preview is not active, create it
    //       if (!VueThis.localTrack) {
    //         createLocalVideoTrack().then((track) => {
    //           let localMediaContainer = document.getElementById("localTrack");
    //           localMediaContainer.appendChild(track.attach());
    //           VueThis.localTrack = true;
    //         });
    //       }
    //     });
    //   });
    // },
  },
};
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