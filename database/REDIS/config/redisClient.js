const redis = require('redis');
const { promisify } = require('util');

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

module.exports = {
  redisClient: client,
  hgetAsync: promisify(client.hget).bind(client),
  hsetAsync: promisify(client.hset).bind(client),
  hdelAsync: promisify(client.hdel).bind(client),
  hgetallAsync: promisify(client.hgetall).bind(client),
  keysAsync: promisify(client.keys).bind(client),
  hgetallAsync: promisify(client.hgetall).bind(client),
  getAsync: promisify(client.get).bind(client),
  delAsync: promisify(client.del).bind(client),
  hscanAsync: promisify(client.hscan).bind(client),
}