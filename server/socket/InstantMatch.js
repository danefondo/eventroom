const { InstantMatchDataController } = require("../../database/REDIS/redis");

/**
 * Handles instant match socket connections
 * @param {Namespace} INSTANT_MATCH_NAMESPACE -- INSTANT_MATCH_NAMESPACE, prefix "/instant_match"
 * @param {Socket} socket 
 */
module.exports = function(INSTANT_MATCH_NAMESPACE, socket) {
  console.log("instant_match connection");

  socket.on("disconnect", (reason) => {
    console.log("a user disconnected from instant_match!", reason);
  }); 

  socket.on("USER_DISCONNECT", (userID) => {
    console.log("User with following ID disconnected", userID);
    InstantMatchDataController.delWaitlistUser(userID);
  })

  socket.on("REQUEST_INSTANT_MATCH", (data) => {
    console.log("REQUEST_INSANT_MATCH: ", data);
    
    // add to redis
    InstantMatchDataController.setWaitlistUser(data.ID, socket.id);
    console.log("Broadcasting to waitlist");
    socket.broadcast.emit("INSTANT_MATCH_WAITLIST", data);
  });

  socket.on("INSTANT_MATCH", data => {
    console.log("found instant match: ", data);
    // BUG 
    // remove users from redis 
    InstantMatchDataController.delWaitlistUser(data.user1_ID);
    InstantMatchDataController.delWaitlistUser(data.user2_ID);
    // create new session TODO
    const event1 = "INSTANT_MATCH_"+data.user1_ID;
    const event2 = "INSTANT_MATCH_"+data.user2_ID;
    console.log("these are events: ", event1, event2);
    const sessionData = {
      user1: data.user1_ID,
      user2: data.user2_ID
    };
    console.log("This is sessionData: ", sessionData);
    INSTANT_MATCH_NAMESPACE.emit(event1, sessionData);
    INSTANT_MATCH_NAMESPACE.emit(event2, sessionData);
  });


  socket.on("PRINT_REDIS", data => {
    InstantMatchDataController.printRedis();
  })
  socket.on("DELETE_REDIS", data => {
    InstantMatchDataController.delAll();
  })
}