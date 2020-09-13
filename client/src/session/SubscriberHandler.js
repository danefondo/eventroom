// import store from '../store/index';

// subscriberId: subscriber 

let nextSubscriberId = 0;



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
    },
    disconnected: function() {
      console.log("subscriber with id " + subscriberId + " disconnected");
    },
    destroyed: function() {
      console.log("subscriber destroyed");
    }
  })

  return { id: subscriberId, subscriber}
}

function moveSubscriberDom(subscriber, newDom) {
  console.log("@movesubdomhandler", newDom);
  document.getElementById(newDom).appendChild(subscriber.element);
}

const SubscriberHandler = {
  nextSubscriberId,

  handleStreamCreated,

  moveSubscriberDom
}
export default SubscriberHandler;