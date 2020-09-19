import store from '../store/index';

// import LayoutHandler from './LayoutHandler';

function publishCallback(publisher, err) {
  if (err) {
    switch (err.name) {
       
      case "OT_USER_MEDIA_ACCESS_DENIED":
        store.commit('session/setPublisherFirstConnectionStatus', true); 
        store.commit('session/setPublisherFirstConnectionMessage', "Please allow access to the Camera and Microphone and try publishing again.");
        break;
      case "OT_NOT_CONNECTED":
        store.commit('session/setPublisherFirstConnectionStatus', true); 
        store.commit('session/setPublisherFirstConnectionMessage', "Publishing your video failed. You are not connected to the internet.");
        break;
      case "OT_CREATE_PEER_CONNECTION_FAILED":
        store.commit('session/setPublisherFirstConnectionStatus', true);
        store.commit('session/setPublisherFirstConnectionMessage', "Publishing your video failed. This could be due to a restrictive firewall.");
        break;
      default:
        store.commit('session/setPublisherFirstConnectionStatus', true);
        store.commit('session/setPublisherFirstConnectionMessage', "An unknown error occurred while trying to publish your video. Please try again later.");
    }
    publisher.destroy();
    return true;
  }
  return false;
}

async function handleStreamDestroyed(publisher, event) {
  if (event.reason === 'networkDisconnected') {
    event.preventDefault();
    store.commit('session/setPublisherNetworkDisconnected', true);
  }
  let key;
  try {
    key = await store.dispatch('session/getStreamLocation', "publisher");
    if (key === null) {
      throw new Error("STREAM DOES NOT EXIST!")
    }
  } catch (err) {
    console.log("@handlepublisherdestroyed error:", err);
  }
  if (key[1] === "central") {
    console.log("@handlepublisherdestroyed central", key)
    store.commit('session/removeFromCentral', key[0]);
  } else if (key[1] === "right") {
    console.log("@handlepublisherdestroyed right", key);
    store.commit('session/removeFromRight', key[0]);
  } else {
    console.log("@handlepublisherdestroyed something is very wrong");
  }
  // LayoutHandler.removePublisherStream(publisher, key[0]);
  publisher.destroy();
  publisher = null;
}

const PublisherHandler = {
  publishCallback,

  handleStreamDestroyed
}

export default PublisherHandler;