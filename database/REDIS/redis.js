const redis = require('redis');

const client = redis.createClient({
  host: "localhost",
  port: 6379,
  // password: <password> and advanced options like via tls 
});

client.on('ready',function() {
  console.log("Redis is ready");
});
client.on("error", error => {
  console.log("REDIS ERROR", error);
});

const REDIS = {
  InstantMatchController: require("./controllers/InstantMatchController")(client)
}

module.exports = REDIS;