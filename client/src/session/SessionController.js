// import OT from "@opentok/client";

import store from "../store/index";
import { requestWithAuthentication } from '../config/api';

const SessionController = {
  async initializeRoom(eventId, roomId) {
    try {
      const { data } = await requestWithAuthentication('get', `/api/events/${eventId}/getRoom/${roomId}`);

      console.log("@getroom data:", data);
      if (!data.room) throw new Error("no room!");
      store.dispatch('session/setInitialData', {
        apiKey: data.apiKey,
        room: data.room,
        sessionId: data.sessionId,
        sessionToken: data.token,
      });
      const roomData = {
        roomId: data.room._id,
        userId: store.state.auth.user._id,
      };
      return { success: true, roomData };
    } catch (err) {
      console.log("@sc_init error:", err);
      return { success: false };
    }
  },
};

export default SessionController;