const redis = require("redis");

// var scope allows creating var inside if block

if (process.env.REDISGREEN_URL) {
  var client = redis.createClient(process.env.REDISGREEN_URL);
} else {
  var client = redis.createClient({
    host: "localhost",
    port: 6379,
    // password: <password> and advanced options like via tls
  });
}

client.on("ready", function () {
  console.log("Redis is ready");
});
client.on("error", (error) => {
  console.log("REDIS ERROR", error);
});

const REDIS = {
  InstantMatchController: require("./controllers/InstantMatchController")(
    client
  ),
};

module.exports = REDIS;
