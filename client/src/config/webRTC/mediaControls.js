"use strict";

export default {
  toggleWebRTCMedia(type, localStream, peerConnection, userMediaSettings) {
    if (type === 0) {
      type = "video";
    } else if (type === 1) {
      type = "audio";
    }

    let localTracks = localStream.getTracks();

    // Find local stream video track
    let localTrack = localTracks.find((track) => {
      return track.kind === type;
    });

    // Reverse realtime state of local stream video
    localTrack.enabled = !localTrack.enabled;

    let tracks;

    // Check for peerConnection
    if (peerConnection) {
      tracks = peerConnection.getSenders();
    }

    // Check if peerConnection & tracks already exist
    if (tracks) {
      // Find peerConnection video track
      let peerTrack = tracks.find((sender) => {
        return sender.track.kind === type;
      });

      // Reverse realtime state of peer connection audio
      peerTrack.enabled = !peerTrack.enabled;
    }

    if (type === "video") {
      // Update local data with realtime audio state
      userMediaSettings.cameraOn = localTrack.enabled;
    } else if (type === "audio") {
      // Update local data with realtime audio state
      userMediaSettings.microphoneOn = localTrack.enabled;
    }
  },

  /**
   * Mute/unmute your media in a Room.
   * @param {Room} room - The Room you have joined
   * @param {'audio'|'video'} kind - The type of media you want to mute/unmute
   * @param {'mute'|'unmute'} action - Whether you want to mute/unmute
   */
  muteOrUnmuteYourMedia(room, kind, action) {
    const publications =
      kind === "audio"
        ? room.localParticipant.audioTracks
        : room.localParticipant.videoTracks;

    publications.forEach(function(publication) {
      if (action === "mute") {
        publication.track.disable();
      } else {
        publication.track.enable();
      }
    });
  },

  /**
   * Mute your audio in a Room.
   * @param {Room} room - The Room you have joined
   * @returns {void}
   */
  muteYourAudio(room) {
    muteOrUnmuteYourMedia(room, "audio", "mute");
  },

  /**
   * Unmute your audio in a Room.
   * @param {Room} room - The Room you have joined
   * @returns {void}
   */
  unmuteYourAudio(room) {
    muteOrUnmuteYourMedia(room, "audio", "unmute");
  },

  /**
   * Mute your video in a Room.
   * @param {Room} room - The Room you have joined
   * @returns {void}
   */
  muteYourVideo(room) {
    muteOrUnmuteYourMedia(room, "video", "mute");
  },

  /**
   * Unmute your video in a Room.
   * @param {Room} room - The Room you have joined
   * @returns {void}
   */
  unmuteYourVideo(room) {
    muteOrUnmuteYourMedia(room, "video", "unmute");
  },

  /**
   * A RemoteParticipant muted or unmuted its media.
   * @param {Room} room - The Room you have joined
   * @param {function} onMutedMedia - Called when a RemoteParticipant muted its media
   * @param {function} onUnmutedMedia - Called when a RemoteParticipant unmuted its media
   * @returns {void}
   */
  participantMutedOrUnmutedMedia(room, onMutedMedia, onUnmutedMedia) {
    room.on("trackSubscribed", function(track, publication, participant) {
      track.on("disabled", function() {
        return onMutedMedia(track, participant);
      });
      track.on("enabled", function() {
        return onUnmutedMedia(track, participant);
      });
    });
  },
};
