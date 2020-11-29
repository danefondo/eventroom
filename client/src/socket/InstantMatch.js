/* eslint-disable no-unused-vars */


// do something here
const validateSessionData = function(sessionData) { // eslint-disable-line no-unused-vars
  return true;
}

// do something here too
// used to check, whether user1 and user2 have matching preferences
const comparePreferences = function(user1Data, user1Preferences, user2Data, user2Preferences) { 
  return true;
}

/**
 * 
 * @param {Socket} socket -- in namespace
 * @param {Object {
 *  ID: the id of the user who requested instant match 
 *  preferences: the preferences of this user
 *  data: the data against which other users can compare their preferences 
 * }} user
 */
const requestInstantMatch = function(socket, user) {
  return new Promise ((resolve, reject) => {
    if (!socket) {
      reject("no socket")
    }
    console.log("emitting request...")
    socket.emit("REQUEST_INSTANT_MATCH", user);
    console.log("request emitted: ", user);
    const personalEvent = "INSTANT_MATCH_"+user.ID;
    console.log("personale event: ", personalEvent);

    socket.on("INSTANT_MATCH_WAITLIST", (secondUser) => {
      console.log("@waitlist...", secondUser)
      const result = comparePreferences(user.data, user.preferences, secondUser.data, secondUser.preferences);
      if (result) {
        const sendData = {
          user1_ID: user.ID,
          user2_ID: secondUser.ID
        };
        console.log("Sending data: ", sendData);
        socket.emit("INSTANT_MATCH", sendData);
      }
    });

    socket.on("disconnect", (reason) => {
      console.log("disconnected", reason);
      reject("disconnected");
    });

    socket.once(personalEvent, (sessionData) => {
      console.log("received personalEvent!", sessionData);
      if (validateSessionData(sessionData)) {
        console.log("resolveD!!!")
        resolve(sessionData);
      } else {
        console.log("@instantMatch error");
        reject("Session data didnt pass validation"); 
      }
    });

    
  })
}

/**
 * https://stackoverflow.com/questions/21485545/is-there-a-way-to-tell-if-an-es6-promise-is-fulfilled-rejected-resolved
 * @param {Promise} promise -- the promise that RequestInstantMatch returns.
 * 
 * NB! unnecessary within components, but may be useful outside. Within components, you can just do 
 * Promise.then(res => this.data).catch(err => this.error) and check whether error or data exists.
 */
const makeRequestQuerable = function(promise) {
  if (promise.isResolved) return promise
  let isResolved = false;
  let isRejected = false;
  let result = promise.then( res => {
    isResolved = true;
    return res;
  }).catch(error => {
    console.log("reached here")
    isRejected = true;
    throw error;
  });

  result.isPending = () => { return (!isResolved && !isRejected); }
  result.isResolved = () => isResolved;
  result.isRejected = () => isRejected; 
  return result;
}

const out = {
  makeRequestQuerable,
  requestInstantMatch,
}

export default out;

/* eslint-enable no-unused-vars */
