import store from '../store/index';

const ALLOWED_CENTRAL_LAYOUT_IDS = ["0","1","2","3"];

async function moveVideo(currentId, targetId, publisher, subscribers) {
  console.log("@movevideo layout ", currentId, targetId);
  const value = await store.dispatch('session/moveVideo', {
    currentId,
    targetId
  });
  console.log("@movevideo layout value:", value);
  if (value === "publisher") {
    movePublisherDom(publisher, targetId);
    return "publisher"
  } else if (!value) {
    console.log("@movevideo layout NO VALUE!");
    return "nothing"
  } else {
    const currentsub = subscribers[value];
    moveSubscriberDom(currentsub, targetId);
    return "subscriber"
  }
}

async function setCentralLayout(newLayoutId, publisher, subscribers) {
  if (!ALLOWED_CENTRAL_LAYOUT_IDS.includes(newLayoutId)) {
    console.log("@setcentrallayout new layout:", typeof(newLayoutId), newLayoutId);
    console.log("@setcentrallayout invalid layout");
    return null;
  }
  const currentLayout = store.getters['session/getCurrentCentralLayoutType'];
  if (currentLayout === newLayoutId) {
    console.log("@setcentrallayout nothing changed");
    return true;
  }
  
  const currentKeys = store.getters['session/getCentralStreamKeys']; 

  console.log("@setcentrallayout currentkeys:", currentKeys, currentKeys.length);
  if (currentKeys.length == 0) {
    console.log("@setcentrallayout no central streams");
    store.commit("session/setCentralLayoutType", newLayoutId);
    return true;
  }
  let rightKey, centralKey, firstCentralKey, secondCentralKey;
  let changes = [];
  switch (newLayoutId) {
    case "0":
      break;
    case "1":
      centralKey = currentKeys.shift();
      changes.push(moveVideo(centralKey, "central_1", publisher, subscribers));
      break;
    case "2":
      firstCentralKey = currentKeys.shift();
      changes.push(moveVideo(firstCentralKey, "central_2_1", publisher, subscribers));
      if (currentKeys.length != 0) {
        secondCentralKey = currentKeys.shift();
        changes.push(moveVideo(secondCentralKey, "central_2_2", publisher, subscribers));
      }
      break;
    case "3":
      firstCentralKey = currentKeys.shift();
      changes.push(moveVideo(firstCentralKey, "central_3_1", publisher, subscribers));
      if (currentKeys.length != 0) {
        secondCentralKey = currentKeys.shift();
        changes.push(moveVideo(secondCentralKey, "central_3_2", publisher, subscribers));
      }
      break;
    default:
      console.log("@setcentrallayout invalid layout");
      return null;
  }
  
  while (currentKeys.length != 0) {
    rightKey = store.getters['session/getEmptyRightKey'];
    centralKey = currentKeys.shift();
    changes.push(moveVideo(centralKey, rightKey, publisher, subscribers));
  }
  store.commit("session/setCentralLayoutType", newLayoutId);
  return Promise.all(changes);
}

function moveSubscriberDom(subscriber, newDom) {
  console.log("@movesubdomhandler", newDom);
  document.getElementById(newDom).appendChild(subscriber.element);
}

function movePublisherDom(publisher, newDom) {
  console.log("@publisherhandler newdom:", newDom);
  document.getElementById(newDom).appendChild(publisher.element);
}

function removeSubscriberStream(subscriber, key) {
  console.log("@removesubstream", key);
  document.getElementById(key).removeChild(subscriber.element);
}
function removePublisherStream(publisher, key) {
  console.log("@removepubstream", key);
  console.log("@removepubstream", document.getElementById(key));
  document.getElementById(key).removeChild(publisher.element);
}

const LayoutHandler = {
  moveVideo,

  setCentralLayout,

  removeSubscriberStream,

  removePublisherStream
}

export default LayoutHandler;