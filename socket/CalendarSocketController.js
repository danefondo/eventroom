const { MatchDataController } = require("../database/REDIS/redis");
const { UpcomingSessionsController } = require("../database/mongo");

const parseDateInRequest = date => new Date(Number(date));

/* 
  All dates in this file are milliseconds from Unix epoch of type String.
  That is, all requests from the front end must convert their date object to milliseconds before sending.
  Maybe that's the default behaviour anyway, idk.
*/
module.exports = function(CALENDAR_NAMESPACE, socket) {

  socket.on("disconnect", (reason) => {
    console.log("a user disconnected from calendar match: ", reason);
  });

  /**
   * @param {
   *  ID -- user ID who books books slots 
   *  [datetimes] -- array of datetimes for which to cancel these bookings. 
   *  data -- user data 
   *  preferences -- user preferences
   * }
   */
  socket.on("BOOK_SLOTS", async (data) => {
    // happens asynchronously atm

    MatchDataController.setManyBooking(data.ID, data.datetimes);

    socket.emit("NEW_BOOKINGS", data);
  });

  /**
   * Cancels bookings (not matches!)
   * @param {
   *  ID -- user ID who cancelled 
   *  [datetimes] -- array of datetimes for which to cancel the bookings 
   * } data - 
   */
  socket.on("CANCEL_BOOKINGS", async (data) => {
    try {
      await MatchDataController.delManySlots(data.ID, data.datetimes);
      socket.emit("BOOKINGS_CANCELLED", data);
    } catch (error) {
      // TODO handle to client
      console.log("error at cancel_bookings", error);
    }
  });

  /**
   * 1. Deletes unmatched people from unmatched Redis
   *    Then creates a session for all those unmatched people
   *    Pushing the created sessions to matched Redis is happening when the session is created (handled in UpcomingSessionController)
   * 2. For people who weren't unmatched, checks if they have a matched session 
   *    If not, this session is not created (probs sb else matched faster)
   *    If yes, changes the session (handled in UpcomingSessionController)
   * @param {
   *  ID -- user ID who requested the matches
   *  [matchIDs] -- array of user IDs with whom to match 
   *  [datetimes] -- array of corresponding datetimes
   * } data  
   * matchIDs.length === datetimes.length
   */
  socket.on("REQUEST_MATCHES", async (data) => {
    try {
      let deletedArray = [];
      for (let i=0; i<data.matchIDs.length; i++) {
        deletedArray.push(MatchDataController.delAtSlot(data.matchIDs[i], data.datetimes[i]));
      }
      deletedArray.push(MatchDataController.delManySlots(data.ID, data.datetimes));
      
      const deletionResults = await Promise.all(deletedArray);

      let promiseArray = [];

      for (let i=0; i<data.matchIDs.length; i++) {

        if (deletionResults[i].success) {
          if (deletionResults[i].result === "0") {
            // previously unmatched
            const sessionData = {
              user1_ID: data.ID,
              user2_ID: data.matchIDs[i],
              datetime: new Date(Number(data.datetimes[i]))
            }
            promiseArray.push(UpcomingSessionsController.createOneCalendarSession(sessionData));
          } else if (deletionResults[i].result === "1") {
            // previously matched
            const sessionData = {
              userID: data.ID,
              matchedUserID: data.matchIDs[i],
              datetime: new Date(Number(data.datetimes[i]))
            }
            promiseArray.push(UpcomingSessionsController.replaceOneCalendarSession(sessionData));
          }
        } else {
          MatchDataController.setOneBooking(data.ID, data.datetimes[i], 0);
          console.log("somebody was faster")
        }
      }

      const createdSessions = await Promise.all(promiseArray);

      for (let i=createdSessions.length-1; i >= 0; i--) {
        // if session with i-th person was not created
        if (!createdSessions._id) {
          createdSessions.splice(i, 1);
        }
      }
      
      CALENDAR_NAMESPACE.to(socket.id).emit("MATCH", {
        sessions: createdSessions
      });
      
      // TODO: send data to connected matched users

    } catch (error) {
      console.log("error at REQUEST_MATCHES", error);
    }
    
  });

  /**
   * 1. Remove user from Redis match collection
   * 2. Set all cancelled users as unmatched in Redis (even if they weren't in redis before)
   * 3. Remove all the sessions from Mongo
   * @param {
   *  ID -- user ID
   *  [datetimes] -- array of datetimes in String(date.valueOf()) form
   *  [cancelledIDs] -- array of user IDs for the users who got cancelled
   * } data -- 
   */
  socket.on("CANCEL_MATCHES", (data) => {
    try {
      // asynchronous operations, since we don't really care when they'll finish
      MatchDataController.delManySlots(data.ID, data.datetimes);
      let promiseArray = [];
      for (let i=0; i<data.cancelledIDs.length; i++) {
        MatchDataController.setOneBooking(data.cancelledIDs[i], data.datetimes[i], 0);
        promiseArray.push(MatchDataController.removeOneSession_datetime_userID(
          new Date(Number(data.datetimes[i])), 
          data.ID
        ));
      }

      const deletionResults = Promise.all(promiseArray);

      // TODO emit to others that ID at datetime is not currently matching 
      // TODO emit to cancelled users that their match was cancelled
      // TODO send acknowledgement back to the user

    } catch (error) {
      console.log("Error at CANCEL_MATCHES", error);
    }
  });
};