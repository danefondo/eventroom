const { promisify } = require('util');

const IDENTIFIER = "connected:";
const EXPIRY_TIME = 10*60;  // 10 min
const MAX_CONNECTIONS = 10; // will not return more than this many connected clients at the same time 

/**
 * Instant Match Controller
 * @param {redis client} redisClient 
 */
module.exports = function(redisClient) {
  let module = {};

  const sremAsync = promisify(redisClient.srem).bind(redisClient);

  module.addConnectedUser = function(userID, socketID) {
    // not sure how to promisify multi.exec() :(
    return new Promise((resolve, reject) => {
      const key = IDENTIFIER+userID;
      const multi = redisClient.multi([
        ["sadd", key, socketID],
        ["expire", key, EXPIRY_TIME]
      ]);
      multi.exec((error, replies) => {
        if (error) {
          reject(error);
        }
        resolve(replies);
      });
    });
  } 

  module.removeConnectedUser = async function(userID, socketID) {
    const key = IDENTIFIER+userID;
    return sremAsync(key, socketID);
  }

  //module.getUsersConnections = async function

  // module.printRedis = function() {
  //   redisClient.keys("*", (err, keys) => {
  //     if (!err) {
  //       console.log("PRINTING REDIS, total nr of keys: ", keys.length);
  //       for (let i=0; i<keys.length; i++) {
  //         redisClient.get(keys[i], (err, reply) => {
  //           console.log("key: ", keys[i], " value: ", reply);
  //         })
  //       }
  //     } else {
  //       console.log("error getting all keys")
  //     }
  //   })
  // }

  // module.delAll = function() {
  //   redisClient.keys("*", (err, keys) => {
  //     if (!err) {
  //       console.log("DELETED ALL REDIS");
  //       for (let i=0; i<keys.length; i++) {
  //         redisClient.del(keys[i], (err, reply) => {
  //           console.log("deleted a key");
  //         });
  //       }
  //     }
  //   })
  // }
  return module;
}