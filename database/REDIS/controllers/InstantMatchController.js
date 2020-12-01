const IDENTIFIER = "instant_waitlist:";
const EXPIRY_TIME = 10*60;  // 10 min


/**
 * Instant Match Controller
 * @param {redis client} redisClient 
 */
module.exports = function(redisClient) {
  let module = {};

  module.setWaitlistUser = function(userID, socketID) {
    const key = IDENTIFIER+userID;
    redisClient.set(key, socketID, "EX", EXPIRY_TIME, (err, reply) => {
      if (err) {
        console.log("set instant waitlist, error:", err);
      }
      else if (reply) {
        console.log("set instant waitlist, reply:", reply, " key: ", key, " value, ", socketID);
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

  module.printRedis = function() {
    redisClient.keys("*", (err, keys) => {
      if (!err) {
        console.log("PRINTING REDIS, total nr of keys: ", keys.length);
        for (let i=0; i<keys.length; i++) {
          redisClient.get(keys[i], (err, reply) => {
            console.log("key: ", keys[i], " value: ", reply);
          })
        }
      } else {
        console.log("error getting all keys")
      }
    })
  }

  module.delAll = function() {
    redisClient.keys("*", (err, keys) => {
      if (!err) {
        console.log("DELETED ALL REDIS");
        for (let i=0; i<keys.length; i++) {
          redisClient.del(keys[i], (err, reply) => {
            console.log("deleted a key");
          });
        }
      }
    })
  }
  return module;
}