const { MongoClient } = require('mongodb');

const DatabaseConfig = require("./config/DatabaseConfig");

const createSessionsCollection = require("./session/models/Sessions");

// https://stackoverflow.com/questions/24621940/how-to-properly-reuse-connection-to-mongodb-across-nodejs-application-and-module
// const Users = require('./Users');

class Mongo {
  constructor() {
    const url = DatabaseConfig.DB_URI;
    const config = {
      useUnifiedTopology: true
    }
    this.client = new MongoClient(url, config);
  }
  async init() {
    try {
      await this.client.connect();
    } catch (error) {
      console.log("error connecting mongodb: ", error);
    }
    
    console.log('connected');

    this.db = this.client.db(DatabaseConfig.DB_NAME);

    this.SessionsController = await createSessionsCollection(this.db);
  }
}


module.exports = new Mongo();