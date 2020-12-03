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
export const requestInstantMatch = function(socket, user) {
  return new Promise ((resolve, reject) => {
    if (!socket) {
      reject("no socket")
    }
    socket.removeAllListeners("INSTANT_MATCH_WAITLIST");  // safety I guess
    console.log("emitting request...")
    socket.emit("REQUEST_INSTANT_MATCH", user);
    console.log("request emitted: ", user);
    const personalEvent = "INSTANT_MATCH_"+user.ID;
    console.log("personale event: ", personalEvent);

    socket.on("INSTANT_MATCH_WAITLIST", (secondUser) => {
      if (secondUser.ID != user.ID) {
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
      }
    });


    socket.on("disconnect", (reason) => {
      console.log("disconnected", reason);
      reject("disconnected");
    });

    socket.once(personalEvent, (sessionData) => {
      console.log("received personalEvent!", sessionData);
      socket.removeAllListeners("INSTANT_MATCH_WAITLIST");
      if (validateSessionData(sessionData)) {
        console.log("resolveD!!!")
        resolve(sessionData);
      } else {
        console.log("@instantMatch error");
        reject("Session data didnt pass validation"); 
      }
    });
    console.log("socket: ", socket);
    
  })
}

export const cancelRequest = function(socket, user) {
  socket.emit("USER_DISCONNECT", user.ID);
}


/* eslint-enable no-unused-vars */