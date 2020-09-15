import store from '../store/index';

import LayoutHandler from './LayoutHandler'

let nextSubscriberId = 0;

/**
 * Handles the case when a subscribed stream gets destroyed. Removes subscriber data from store 
 * and removes subscriber element from dom
 * @param {*} subscriber - the subscriber object given by Vonage
 * @param {*} subscriberId - the id given to subscriber when subscribed
 */
async function handleStreamDestroyed(subscriber, subscriberId) {
  let key;
  try {
    key = await store.dispatch('session/getStreamLocation', subscriberId);
    if (key === null) {
      throw new Error("STREAM DOES NOT EXIST!")
    }
  } catch (err) {
    console.log("@handlestreamdestroyed error:", err);
  }
  if (key[1] === "central") {
    console.log("@handlestreamdestroyed central", key)
    store.commit('session/removeFromCentral', key[0]);
  } else if (key[1] === "right") {
    console.log("@handlestreamdestroyed right", key);
    store.commit('session/removeFromRight', key[0]);
  } else {
    console.log("@handlestreamdestroyed something is very wrong");
  }
  LayoutHandler.removeSubscriberStream(subscriber, key[0]);
}

function handleStreamCreated(session, event, subscriberTarget) {
  const subscriberProperties = { insertMode: 'append' };

  const subscriberId = String(nextSubscriberId);
  nextSubscriberId++;

  console.log("@handlestreamcreated target element", subscriberTarget);

  if (subscriberTarget === null) {
    throw new Error("no target element");
  }
  let subscriber = session.subscribe(
    event.stream, 
    subscriberTarget,
    subscriberProperties,
    function(err) {
      console.log("subscriber error:", err);
    }  
  );
  
  
  subscriber.on({
    connected: function() {
      console.log("subscriber connected");
      console.log("subscriber data: ", subscriber);
      console.log("subscriber id:", subscriberId);
    },
    disconnected: function() {
      console.log("subscriber with id " + subscriberId + " disconnected");
    },
    destroyed: function() {
      console.log("subscriber destroyed");
      handleStreamDestroyed(subscriber, subscriberId);
    }
  })

  return { id: subscriberId, subscriber}
}



const SubscriberHandler = {
  nextSubscriberId,

  handleStreamCreated,

}
export default SubscriberHandler;