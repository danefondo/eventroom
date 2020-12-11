/**
 * MUST BE EXPORTED JUST ONCE from mongo.js AND FROM NOWHERE ELSE
 * 
 * 
 * This file contains definition and initialization for PastSessions collection. 
 * 
 * Methods:
 * init() -- initialization. Ensures that proper indexes are set. Returns the controller
 * 
 * Potentially might also include validation etc general methods
 */


/* This is not used (atm), just for reference */ 
const SCHEMA = {
  
  // REQUIRED FIELDS
  datetime: String,

  user1_ID: String,
  user2_ID: String,

  // OTHER STUFF
  user1Data: {
    username: String,
    firstName: String,
    lastName: String,
    displayName: String,
    profileImageURL: String,
    profileImageURLSmall: String,
    customTitle: String,
  },

  user2Data: {
    username: String,
    firstName: String,
    lastName: String,
    displayName: String,
    profileImageURL: String,
    profileImageURLSmall: String,
    customTitle: String,
  },

  user1Timestamps: Array,
  user2Timestamps: Array,
  user1Attendance: {
    joinedOnce: Boolean, 
    joinedDuringSession: Boolean,
    wasLate: Boolean,
    wasEarly: Boolean,
    latenessInMS: Number,
    earlinessInMS: Number,
    attendanceSuccessful: Number, 
  },

  user2Attendance: {
    joinedOnce: Boolean, 
    joinedDuringSession: Boolean,
    wasLate: Boolean,
    wasEarly: Boolean,
    latenessInMS: Number,
    earlinessInMS: Number,
    attendanceSuccessful: Number, 
  },
}


const INDEXED_KEYS = [["datetime",1], ["user1_ID",1], ["user2_ID",1]];
const INDEX_OPTIONS = [{ unique: false }, { unique: false }, { unique: false }];
class PastSessions {
  constructor (db) {
    this.collection = db.collection("pastsessions");
    this.controller = require("../controllers/PastSessionsController")(this.collection);
  }

  async init() {
    const self = this;
    return new Promise( async (resolve, reject) => {
      try {
        const indexes = await self.collection.indexes();
        // console.log("indexes before:", indexes);
        if (indexes.length <= 1) {
          console.log("creating indexes....")
          for (let i=0; i<INDEXED_KEYS.length; i++) {
            await self.collection.createIndex([INDEXED_KEYS[i]], INDEX_OPTIONS[i]);
          }
        }
        // const newIndexes = await this.collection.indexes();
        // console.log("indexes after: ", newIndexes);
        resolve(self.controller);
      } catch (error) {
        console.log("Error at initialization of past session: ", error);
        reject();
      }
    })
  }

  
}

function createPastSessionsCollection(db) {
  let collection = new PastSessions(db);
  return collection.init();
}

module.exports = createPastSessionsCollection;