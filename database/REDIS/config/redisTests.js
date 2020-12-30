const { keysAsync, delAsync, hgetallAsync } = require("./redisClient");
const { unparseMatched, unparseUnmatched } = require("./KeyValueParsers");

async function printMatchPool() {
  try {
    const matchedKeys = await keysAsync("matched:*");
    const unmatchedKeys = await keysAsync("unmatched:*");

    console.log("*******************************************")
    console.log("PRINTING REDIS STATE");

    let matchedValues = [];
    for (let i=0; i<matchedKeys.length; i++) {
      matchedValues.push(await hgetallAsync(matchedKeys[i]));
    }
    let unmatchedValues = [];
    for (let i=0; i<unmatchedKeys.length; i++) {
      unmatchedValues.push(await hgetallAsync(unmatchedKeys[i]));
    }

    for (let i=0; i<matchedKeys.length; i++) {
      console.log("Key: ", matchedKeys[i], " parsed: ", unparseMatched(matchedKeys[i]), new Date(unparseMatched(matchedKeys[i])));
      console.log("Value: ", matchedValues[i]);
    }
    for (let i=0; i<unmatchedKeys.length; i++) {
      console.log("Key: ", unmatchedKeys[i], " parsed: ", unparseUnmatched(unmatchedKeys[i]), new Date(unparseUnmatched(unmatchedKeys[i])));
      console.log("Value: ", unmatchedValues[i]);
    }

    console.log("REDIS PRINTED");
    console.log("*******************************************")

  } catch (error) {
    console.log("@printredis", error);
  }
}

async function printUsers() {
  try {
    const userKeys = keysAsync("user:*");
    console.log("*******************************************")
    console.log("PRINTING REDIS USERS");

    let userValues = [];
    for (let i=0; i<userKeys.length; i++) {
      userValues.push(await hgetallAsync(userKeys[i]));
    }
    for (let i=0; i<userKeys.length; i++) {
      console.log("Key: ", userKeys[i], " parsed: ", unparseMatched(userKeys[i]));
      console.log("Value: ", userValues[i]);
    }

    console.log("REDIS PRINTED");
    console.log("*******************************************")
  } catch (error) {
    console.log("@printusers, error:", error);
  }
}

async function deleteRedis() {
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
  printMatchPool,
  deleteRedis,
  printUsers
}