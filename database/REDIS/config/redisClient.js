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

async function runMultiCommand(multiCommandArray) {
  return new Promise((resolve, reject) => {
    const multi = client.multi(multiCommandArray);
    multi.exec((err, replies) => {
      if (err) reject(err);
      resolve(replies);
    });
  });
}

async function runBatchCommand(batchCommandArray) {
  return new Promise((resolve, reject) => {
    const batch = client.batch(batchCommandArray);
    batch.exec((err, replies)  => {
      if (err) reject(err);
      resolve(replies);
    });
  });
}

module.exports = {
  redisClient: client,
  runMultiCommand,
  runBatchCommand,
  // hash
  hgetAsync: promisify(client.hget).bind(client),
  hsetAsync: promisify(client.hset).bind(client),
  hdelAsync: promisify(client.hdel).bind(client),
  hgetallAsync: promisify(client.hgetall).bind(client),
  hscanAsync: promisify(client.hscan).bind(client),
  hgetallAsync: promisify(client.hgetall).bind(client),
  hkeysAsync: promisify(client.hkeys).bind(client),
  
  getAsync: promisify(client.get).bind(client),
  delAsync: promisify(client.del).bind(client),

  keysAsync: promisify(client.keys).bind(client),
  expireAsync: promisify(client.expire).bind(client),
}