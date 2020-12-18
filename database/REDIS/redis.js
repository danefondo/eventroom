// const redis = require('redis');
// const { promisify } = require('util');

// const client = redis.createClient({
//   host: "localhost",
//   port: 6379,
//   // password: <password> and advanced options like via tls 
// });

// client.on('ready',function() {
//   console.log("Redis is ready");
// });
// client.on("error", error => {
//   console.log("REDIS ERROR", error);
// });

// const extendedClient = {
//   redisClient: client,
//   hgetAsync: promisify(client.hget).bind(client),
//   hsetAsync: promisify(client.hset).bind(client),
//   hdelAsync: promisify(client.hdel).bind(client),
//   hgetallAsync: promisify(client.hgetall).bind(client),
// }

// const REDIS = {
//   InstantMatchDataController: require("./controllers/InstantMatchDataController")(client),
//   MatchDataController: require("./controllers/MatchDataController")(client),
//   ConnectedUsersController: require("./controllers/ConnectedUsersController")(client),
//   UserDataController: require("./controllers/UserDataController")(client),
//   client, // only for testing
// }

// module.exports = REDIS;

// /**
//  * IDENTIFIERS
//  * mp: -- match pool 
//  * ud: -- user data
//  * 
//  */