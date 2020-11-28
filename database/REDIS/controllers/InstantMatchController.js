
const IDENTIFIER = "instant_waitlist:";
/**
 * Instant Match Controller
 * @param {redis client} redisClient 
 */
module.exports = function(redisClient) {
  let module = {};

  module.setWaitlistUser = function(userID) {
    const key = IDENTIFIER+userID;
    redisClient.set(key, 1, (err, reply) => {
      if (err) {
        console.log("set instant waitlist, error:", err);
      }
      else if (reply) {
        console.log("set instant waitlist, reply:", reply);
        console.log("replyvalue == 'OK':", reply=="OK")
      }
    })
  } 

  module.checkWaitlistUser = function(userID) {
    const key = IDENTIFIER+userID;
    redisClient.exists(key, (err, reply) => {
      if (!err) {
        if (reply == 1) {
          console.log(key, " exists");
        } else {
          console.log("does not exist:", reply, reply===0);
        }
      }
    })
  }

  module.delWaitlistUser = function(userID) {
    const key = IDENTIFIER+userID;
    redisClient.del(key, (err, reply) => {
      if (!err) {
        if (reply == 1) {
          console.log("key deleted");
        } else {
          console.log("key does not exist ", reply, reply === 0)
        }
      }
    })
  }

  module.getWaitlistUser = function(userID) {
    const key = IDENTIFIER+userID;
    redisClient.get(key, (err, reply) => {
      if (!err) {
        console.log("key: ", key, " value:", reply, "value==null: ", reply===null);
      }
      else {
        console.log("error at redis")
      }
    })
  }
  return module;
}