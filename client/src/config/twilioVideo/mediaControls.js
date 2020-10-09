"use strict";

export default {
  toggleTwilioVideo(videoTracks) {
    videoTracks.forEach(function(videoTrack) {
      if (videoTrack.track.isEnabled == true) {
        videoTrack.track.disable();
      } else {
        videoTrack.track.enable();
      }
    });
  },

  toggleTwilioAudio() {
    videoTracks.forEach(function(videoTrack) {
      if (videoTrack.track.isEnabled == true) {
        videoTrack.track.disable();
      } else {
        videoTrack.track.enable();
      }
    });
  },

  toggleTwilioScreenshare() {},

  toggleTwilioPictureInPicture() {},

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
