const { promisify } = require('util');

const redisClient = require("../database/REDIS/redis").client;

const printRedis = async function(identifier="", hash=false) {
  const keysAsync = promisify(redisClient.keys).bind(redisClient);
  const hgetallAsync = promisify(redisClient.hgetall).bind(redisClient);
  const getAsync = promisify(redisClient.get).bind(redisClient);

  try {
    let values = [];
    const keys = await keysAsync(identifier+"*")
    console.log("@printredis keys: ", keys);
    console.log("@printredis, keys.length: ", keys.length);
    
    if (hash) {
      for (let i=0; i<keys.length; i++) {
        values.push("hashed");
        values.push(await hgetallAsync(keys[i]));
      }
    } else {
      for (let i=0; i<keys.length; i++) {
        values.push("nonhashed");
        values.push(await getAsync(keys[i]));
      }
    }
    console.log("@printredis, values.length: ", values.length);
    console.log("identifier: ", identifier);
    console.log("******************* PRINTING REDIS *********************");
    for (let i=0; i<keys.length; i++) {
      console.log(values[2*i]);
      console.log(keys[i], ":", values[2*i+1]);
    }
    console.log("******************* REDIS PRINTED *********************");
  } catch (error) {
    console.log("ERROR AT printredis: ", error);
  }
}

const deleteRedis = async function() {
  const keysAsync = promisify(redisClient.keys).bind(redisClient);
  const delAsync = promisify(redisClient.del).bind(redisClient);

  try {
    const keys = await keysAsync("*")
    console.log("@deleteredis keys: ", keys);
    
    for (let i=0; i<keys.length; i++) {
      delAsync(keys[i]);
    }
  } catch (error) {
    console.log("error @ delete redis", error);
  }
}


module.exports = {
  printRedis,
  deleteRedis
}