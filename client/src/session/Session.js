import OT from '@opentok/client';

import store from '../store/index';

import SubscriberHandler from './SubscriberHandler';
// import PublisherHandler from './PublisherHandler';
import LayoutHandler from './LayoutHandler';

let connected = false;
let publisherInitialized = false;

let connectionCount = 0;

let session, publisher;
let subscribers = {};


const publish = function(session) {
  if (connected && publisherInitialized) {
    console.log("@publish: stream published with id ")
    session.publish(publisher);
  }
}

const disconnect = function(session) {
  session.disconnect();
}


async function initSession() {
  const { apiKey, sessionId, sessionToken } = store.getters['session/getStaticSessionData'];
  let targetElement;
  try {
    targetElement = await store.dispatch('session/getTargetElement', "publisher")
  } catch (err) {
    console.log("@initsession error:", err);
    throw new Error("no available element for publisher");
  }

  console.log("@sessioncontroller data:", apiKey, sessionId, sessionToken);
  
  let publisherOptions = {
    insertMode: "append",
    width: "160px",
    height: "90px",
  };

  console.log("@sessioncontroller target element", targetElement);
  // Initialize session, publisher
  session = OT.initSession(apiKey, sessionId);
  publisher = OT.initPublisher(targetElement, publisherOptions, function(err) {
    if (err) {
      console.log("@initpublisher error", err);
    } else {
      console.log("@initpublisher initialized");
      publisherInitialized = true;
      publish(session);
    }
  });

  // Set session event handlers
  session.on({
    // a client, including this, has connected to the session
    connectionCreated: function () {
      connectionCount++;
      console.log(connectionCount + ' connections.');
    },
    // a client, other than this, has disconnected to the session
    connectionDestroyed: function () {
      connectionCount--;
      console.log(connectionCount + ' connections.');
    },
    // this client has connected to the session
    sessionConnected: function() {
      console.log("session connected");
    },
    // this client has disconnected and tries to reconnect
    sessionReconnecting: function() {
      console.log("session reconnecting");
    },
    // this client has reconnected
    sessionReconnected: function() {
      console.log("session reconnected");
    },
    sessionDisconnected: function (event) {
      // The event is defined by the SessionDisconnectEvent class
      console.log('Disconnected from the session.');
      // document.getElementById('disconnectBtn').style.display = 'none';
      if (event.reason == 'networkDisconnected') {
        alert('Your network connection terminated.')
      }
    },
    streamCreated: async function (event) {
      console.log("New stream in the session: " + event.stream.streamId);
      console.log("New stream data: ", event.stream);
      try {
        const subscriberTarget = await store.dispatch('session/getTargetElement', String(SubscriberHandler.nextSubscriberId));
        console.log("New stream sub target: ", subscriberTarget);
        const subscriberObject = SubscriberHandler.handleStreamCreated(session, event, subscriberTarget);
        subscribers[subscriberObject.id] = subscriberObject.subscriber;
        console.log("New stream subscribers: ", subscribers);
      } catch (err) {
        console.log("COULD NOT subscribe to stream");
      }
    }
  });

  // Set publisher event handlers
  publisher.on({
    streamCreated: function () {
      console.log("Publisher started streaming.");
      console.log("publisher: ", publisher);
    },
    streamDestroyed: function (event) {
      console.log("Publisher stopped streaming. Reason: "
        + event.reason);
    },
  });


  session.connect(sessionToken, function(error) {
    if (error) {
      console.log('Unable to connect: ', error.message);
    } else {
      // document.getElementById('disconnectBtn').style.display = 'block';
      console.log('Connected to the session.');
      connected = true;
      connectionCount = 1;
      publish(session);
    }
  });  
}

async function moveVideo(currentId, targetId) {
  LayoutHandler.moveVideo(currentId, targetId, publisher, subscribers);
}

async function setCentralLayout(newLayout) {
  LayoutHandler.setCentralLayout(newLayout, publisher, subscribers)
    .then(result => { 
      console.log("@setcentrallayout call result", result)
    }).catch(err => {
      console.log("@setcentrallayout call error:", err);
    })
}

const Session = {
  initSession,

  disconnect,

  moveVideo,

  setCentralLayout
}

export default Session;