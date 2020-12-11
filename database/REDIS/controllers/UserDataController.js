const { promisify } = require('util');

const IDENTIFIER = "user:";

/* returns key from userID */
const parseToKey = userID => IDENTIFIER+userID;

/* returns userID from key */
const parseKey = key => key.slice(IDENTIFIER.length);

const parseUser = function(userData, userPreferences) {
  const returnObject = {};
  Object.keys(userData).forEach((k,i) => {
    let key = "data:" + k;
    returnObject[key] = i;
  });
  Object.keys(userPreferences).forEach((k,i) => {
    let key = "pref:" + k;
    returnObject[key] = i;
  })
  returnObject.dateInserted = (new Date()).valueOf();
  return returnObject;
}

const unParseUser = function(result) {
  const returnObject = {
    data: {},
    preferences: {}
  };
  for (let i=1; i<result.length; i++) {
    if (i%2 == 0) continue;
    if (result[i-1].slice(0, 5) == "data:") {
      returnObject.data[result[i-1].slice(5)] = result[i];
    } else if (result[i-1].slice(0, 5) == "pref:") {
      returnObject.preferences[result[i-1].slice(5)] = result[i];
    }
  }
  return returnObject;
}

// TODO get user pref etc data from mongo

module.exports = function(redisClient) {
  let module = {};

  const hgetAsync = promisify(redisClient.hget).bind(redisClient);
  const hdelAsync = promisify(redisClient.hdel).bind(redisClient); 
  const hgetallAsync = promisify(redisClient.hgetall).bind(redisClient);
  const hsetAsync = promisify(redisClient.hset).bind(redisClient);

  module.addUser = async function(userID, userData=null, userPreferences=null) {
    const key = parseToKey(userID);
    let setObject = {};
    if (userData && userPreferences) {
      setObject = parseUser(userData, userPreferences);
    } else {
      // haha fucked TODO
    }
    return hsetAsync(key, setObject);
  };

  module.getUser = async function(userID) {
    
    const key = parseToKey(userID);
    console.log("@getuser: ", userID, key);
    try {
      const data = await hgetallAsync(key);
      if (data && data.length != 0) {
        return unParseUser(data);
      } else {
        // get from mongo TODO
        // set from mongo TODO
      }

    } catch (error) {
      console.log("error at getuser", error);
    }
    return null;
  };

  module.removeUser = async function(userID) {

  };

  module.modifyField = async function(userID, fieldName, newValue) {

  };

  return module;
}