// import OT from "@opentok/client";

import Session from './Session';

import store from "../store/index";
import { requestWithAuthentication } from '../config/api';

const SessionController = {
  async initializeRoom(eventId, roomId) {
    try {
      console.log("@initroom");
      const { data } = await requestWithAuthentication('get', `/api/events/${eventId}/getRoom/${roomId}`);
      // console.log("@sc_init data:", data);
      if (!data.room) throw new Error("no room!");
      await store.dispatch('session/setInitialData', {
        apiKey: data.apiKey,
        room: data.room,
        sessionId: data.sessionId,
        sessionToken: data.token,
      });
      const roomData = {
        roomId: data.room._id,
        userId: store.state.auth.user._id,
      };
      console.log("@initroom roomdata:", roomData);
      return { success: true, roomData };
    } catch (err) {
      console.log("@sc_init error:", err);
      return { success: false };
    }
  },
  async initSession() {
    Session.initSession();
  },
  async disconnect() {
    await Session.disconnect();
  },
  // The functions below *HAVE* to go through Session, otherwise the handlers do not get subscriber and publisher objects
  async moveVideo(currentId, targetId) {
    await Session.moveVideo(currentId, targetId);
  },
  setCentralLayout(newLayout) {
    Session.setCentralLayout(newLayout);
  }
};

export default SessionController;