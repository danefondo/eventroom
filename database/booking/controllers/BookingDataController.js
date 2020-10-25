const SessionModel = require("../models/SessionModel");
const EventroomModel = require("../../eventroom/models/EventroomModel");
const moment = require("moment");

function prepareErrors(error, errors) {
  if (error.errors) {
    errors = error.errors;
  } else {
    errors.error = error;
  }
  return errors;
}

function removeOwnSessionsFromArray(sessionsArray, userId) {
  /* ===== 
  ENSURE USER IS NOT IN THE ARRAY OF AVAILABLE SESSIONS 
  TO PREVENT SELF-MATCHING 
  (prevents having to check per iteration 
    whether matching oneself or not)
  (also prevents double booking,
    as you do not get booked for any
    time slot where you're already booked)
  ===== */

  //   let alreadyMatchedForTime = [];

  sessionsArray.forEach(function (eachSession, index, array) {
    firstMatchCompare = eachSession.firstPartnerId == userId;
    secondMatchCompare = eachSession.secondPartnerId == userId;
    console.log("available BEFORE", sessionsArray);
    // If either partner is equal to user's id, remove from sessionsArray
    if (firstMatchCompare || secondMatchCompare) {
      console.log("found session with own id, removing from array");
      array.splice(index, 1);

      // Prepare data to display on client side
      // for which slot of booked sessions
      // already has been booked for that time

      //   let alreadyMatchedForTimeSession = {
      //     sessionTime: eachSession.queryDateTime,
      //     sessionId: eachSession._id,
      //   };
      //   alreadyMatchedForTime.push(alreadyMatchedForTimeSession);
    }
    console.log("available BEFORE", sessionsArray);
  });

  console.log("array after processing", sessionsArray);

  return sessionsArray;
}

function filterAvailableSessions(existingSessionsArray) {
  let availableSessions = [];

  // Iterate and check if anyone available for session
  // until match is found, if no match, create new session
  existingSessionsArray.forEach(function (session) {
    let firstPartnerSlotAvailable = false;
    let secondPartnerSlotAvailable = false;

    // Check if either partner match slot available
    if (session.firstPartnerId && !session.secondPartnerId) {
      // Set second partner slot as available => indicator of an unmatched session
      secondPartnerSlotAvailable = true;
    } else if (!session.firstPartnerId && session.secondPartnerId) {
      // Set first partner slot as available => indicator of an unmatched session
      firstPartnerSlotAvailable = true;
    }

    if (!firstPartnerSlotAvailable && !secondPartnerSlotAvailable) {
      // TODO, SKIP & DELETE THIS
      // + PERIODIC CLEAN UP OF ANY SIMILAR SESSIONS
      console.log("A session with no one? Skip. Delete.");
    } else if (firstPartnerSlotAvailable || secondPartnerSlotAvailable) {
      availableSessions.push(session);
    }
    console.log("Available sessions: ", availableSessions);
  });

  return availableSessions;
}

/* ===== 
IF SPECIFIC MATCH PREFERENCE EXISTS &&
IF NOT YET MATCHED &&
IF PREFERRED MATCH EXISTS
--> SET MATCH 
===== */
function checkIfMatchPreferenceAvailable(
  desiredUserId,
  sessionToMatch,
  availableSessions
) {
  let preferredSession = null;
  if (desiredUserId && !sessionToMatch) {
    availableSessions.forEach(function (session) {
      let firstId = session.firstPartnerId;
      let secondId = session.secondPartnerId;
      // Check if the session's existing partner is the desired partner
      if (firstId == desiredUserId || secondId == desiredUserId) {
        // If session's existing partner is a match
        // Set it as the preferred user you have found
        preferredSession = session;
      }
    });
  }
  return preferredSession;
}

/* ===== 
IF GENERAL MATCH PREFERENCE EXISTS &&
IF NOT YET MATCHED &&
IF NO PREFERRED USER SESSION &&
ITERATE OVER DETAILS OF SESSIONS
IF SESSION WITH PREFERENCE MATCH EXISTS
--> SET MATCH 
===== */
function getBestAvailableMatchByPreferences(
  preferences,
  preferredUserSession,
  sessionToMatch
) {
  let bestPreferenceMatch = null;
  if (preferences && !preferredUserSession && !sessionToMatch) {
    console.log("skip for now");
    // e.g. must have X amount of sessions
    // must be male/female
    // must have x anonymous rating
    // must have x show up rate
    // must have x cancellation rate
    // must have profile picture
    // must be elysium one connected
    // must be a friend

    // also filter to only see by these details

    // Check for best match:
    // iterate over each preference
    // push to choiceList array if qualifies
    // then push the rest to another list (if booking is enabled when no good match found)
    // then later run function to determine best fit
  }
  return bestPreferenceMatch;
}

/* ===== 
IF NO GENERAL PREFERENCES &&
IF NO PREFERRED USER SESSION &&
IF NOT YET MATCHED &&
PICK RANDOM SESSION FROM LIST
--> SET MATCH 
===== */
function getBestRandomMatch(
  preferences,
  preferredUserSession,
  sessionToMatch,
  availableSessions
) {
  let randomGoodMatch = null;
  if (!preferences && !preferredUserSession && !sessionToMatch) {
    // Match for random available session
    randomGoodMatch =
      availableSessions[Math.floor(Math.random() * availableSessions.length)];
  }
  return randomGoodMatch;
}

const BookingDataController = {
  async getBookedSessionsForOneDay(dayData) {
    let endOfDay = dayData.endOfDay;
    let currentMoment = new Date();

    let query = { rawDateTime: { $gt: currentMoment, $lt: endOfDay } };

    let errors = {};
    let allBookedSessions;
    try {
      allBookedSessions = await SessionModel.find(query).exec();
    } catch (error) {
      errors = prepareErrors(error, errors);
      throw { errors: errors };
    }
    return allBookedSessions;
  },

  async getUserBookedSessionsForThisWeek(userData) {
    // let query = { userId: userData.userId };
    let userId = userData.userId;
    let query = {
      $or: [{ firstPartnerId: userId }, { secondPartnerId: userId }],
    };
    let errors = {};
    let bookedSessions;
    try {
      bookedSessions = await SessionModel.find(query).exec();
      //   console.log("bookedSessions", bookedSessions);
    } catch (error) {
      errors = prepareErrors(error, errors);
      throw { errors: errors };
    }
    return bookedSessions;
  },

  async getAllBookedUsersForSpecificWeek(weekData) {
    let endOfWeekDate = weekData.endOfWeekDate;
    let currentMoment = new Date();

    let query = { rawDateTime: { $gt: currentMoment, $lt: endOfWeekDate } };

    let errors = {};
    let allBookedSessions;
    try {
      allBookedSessions = await SessionModel.find(query).exec();
      //console.log("allBookedSessions", allBookedSessions);
    } catch (error) {
      errors = prepareErrors(error, errors);
      throw { errors: errors };
    }
    return allBookedSessions;
  },

  // Rather than updating each user individually
  // manage a single central source of truth file
  // for each session, and update data there
  async bookSessionSlot(sessionData) {
    let returnSession = null;
    let userId = sessionData.userId;
    let username = sessionData.username;
    let errors = {};
    /**
     * Scenarios you must take care of based on info at the time of booking:
     
     - Someone books a sessions where there is no one else booked --> create new session
     - Someone books a session but all booked people are matched / otherwise unavailable --> create new session
     - Someone books a session specifying a specific person to match with --> check if still available, then --> match, else --> choose another on the calendar if any, else --> create new session
     - Someone Quickbooks a session with no specification when people available --> match random
     - Someone books a session and they have specific preferences & people are available --> match session
     */

    // Perform check through user filters which should be passed
    // Later a DB check should also be performed
    // If not, then create one

    // If someone has a session that is unmatched and they cancel it, delete the session from DB
    // Push update-load to Calendar to remove that session for everyone

    // If existing sessions --> if == 1 --> match, else if > 1 --> perform filtered checks & match w/best match
    // filters include having selected a set of preferred matches in drag&drop list

    try {
      let query = { queryDateTime: sessionData.queryDate };

      // Check for whether any sessions exist for the time
      let response = await BookingDataController.findSessionsForSlots(query);

      let alreadyMatchedForTime = [];

      // If sessions exists, check if anyone's available
      // for matching for that time, then --> match
      if (
        response &&
        response.sessionsExistForTimes &&
        response.existingSessionsArray.length
      ) {
        // Check response
        console.log("@bookSessionSlot, sessions exist!", response);

        // Remove any sessions with user to prevent self-matching
        // and prevent double booking
        let existingSessionsArray = removeOwnSessionsFromArray(
          response.existingSessionsArray,
          userId
        );

        // Prepare container for a chosen match
        let sessionToMatch = null;

        // Prepare found preferred user session container
        let preferredUserSession = null;

        // Prepare container for any available sessions
        let availableSessions = filterAvailableSessions(existingSessionsArray);

        /* ===== 
         IF ONLY ONE SESSION AVAILABLE, SET TO MATCH 
        (optimization to not waste time on further iteration if only one option)
        ===== */
        if (availableSessions.length == 1) {
          sessionToMatch = availableSessions[0];
        }

        /* ===== CHECK IF MATCH PREFERENCE AVAILABLE ===== */
        let desiredUserId = sessionData.specificUserPreferenceId;
        preferredUserSession = checkIfMatchPreferenceAvailable(
          desiredUserId,
          sessionToMatch,
          availableSessions
        );

        /* ===== IF PREFERRED MATCH AVAILABLE, SET TO MATCH ===== */
        if (preferredUserSession) {
          sessionToMatch = preferredUserSession;
        }

        /* ===== IF NO MATCH && IF PREFERENCES CHECK FOR BEST AVAILABLE MATCH ===== */
        let preferences = sessionData.generalPreferences;
        let bestAvailableMatchByPreferences = getBestAvailableMatchByPreferences(
          preferences,
          preferredUserSession,
          sessionToMatch
        );

        /* ===== IF BEST MATCH FOUND, SET TO MATCH ===== */
        if (bestAvailableMatchByPreferences) {
          sessionToMatch = bestAvailableMatchByPreferences;
        }

        /* ===== IF NO MATCH && NO PREFERENCES, PICK AT RANDOM / SELECT BEST ===== */
        let randomBestMatch = getBestRandomMatch(
          preferences,
          preferredUserSession,
          sessionToMatch,
          availableSessions
        );

        /* ===== IF RANDOM BEST MATCH FOUND, SET TO MATCH ===== */
        if (randomBestMatch) {
          sessionToMatch = randomBestMatch;
        }

        // If session to match has been found, set up match
        if (sessionToMatch && !alreadyMatchedForTime.length) {
          // If preference is to not be booked when no desired match
          // or close enough preference available, then do not book and return
          // Optionally do not show up
          // OR book session but do not show up for anyone not matching criteria??
          // Create new session

          let partnerId = null;
          if (sessionToMatch.firstPartnerId) {
            partnerId = sessionToMatch.firstPartnerId;
          } else if (sessionToMatch.secondPartnerId) {
            partnerId = sessionToMatch.secondPartnerId;
          }

          let matchingData = {
            sessionToMatch,
            userId,
            username,
            partnerId,
          };
          returnSession = await BookingDataController.matchWithExistingSession(
            matchingData
          );

          if (
            returnSession.MatchedPartnerNoLongerThere ||
            returnSession.SessionNotFoundAnymore
          ) {
            // If matched partner no longer part of session, or session no longer found,
            // create new session
            returnSession = await BookingDataController.createAndBookSessionAndRoom(
              sessionData
            );
          }
        } else if (!sessionToMatch && alreadyMatchedForTime.length > 0) {
          // send info back that user is already has a session at that time
          console.log("already matched for time");
        } else {
          // Create new session
          returnSession = await BookingDataController.createAndBookSessionAndRoom(
            sessionData
          );
        }
      } else {
        // Create new session
        returnSession = await BookingDataController.createAndBookSessionAndRoom(
          sessionData
        );
      }
    } catch (error) {
      errors = prepareErrors(error, errors);
      throw { errors: errors };
    }

    return returnSession;
  },

  async bookManySessionSlots(requestData) {
    let userId = requestData.userId;
    let username = requestData.username;
    let slotsToBookArray = requestData.slotsToBookArray;
    let returnData = null;
    let errors = {};

    try {
      let query = { queryDateTime: { $in: slotsToBookArray } };

      // Check for whether any sessions exist for the time
      let response = await BookingDataController.findSessionsForSlots(query);

      let alreadyMatchedForTime = [];

      // If sessions exists, check if anyone's available
      // for matching for that time, then --> match
      if (
        response &&
        response.sessionsExistForTimes &&
        response.existingSessionsArray.length
      ) {
        // Check response
        console.log("@bookSessionSlot, sessions exist!", response);

        /*
            1. Response contains ALL sessions for ALL the selected time slots
        */

        // Prepare container for any available sessions
        let availableSessions = [];

        // Prepare container for a chosen match
        let sessionToMatch = null;

        // Prepare found preferred user session container
        let preferredUserSession = null;

        // Iterate and check if anyone available for session
        // until match is found, if no match, create new session
        response.existingSessionsArray.forEach(function (session) {
          let firstPartnerSlotAvailable = false;
          let secondPartnerSlotAvailable = false;

          // Check if either partner match slot available
          if (session.firstPartnerId && !session.secondPartnerId) {
            // Set second partner slot as available => indicator of an unmatched session
            secondPartnerSlotAvailable = true;
          } else if (!session.firstPartnerId && session.secondPartnerId) {
            // Set first partner slot as available => indicator of an unmatched session
            firstPartnerSlotAvailable = true;
          }

          if (!firstPartnerSlotAvailable && !secondPartnerSlotAvailable) {
            // TODO, SKIP & DELETE THIS
            // + PERIODIC CLEAN UP OF ANY SIMILAR SESSIONS
            console.log("A session with no one? Skip. Delete.");
          } else if (firstPartnerSlotAvailable || secondPartnerSlotAvailable) {
            availableSessions.push(session);
          }
          console.log("Available sessions: ", availableSessions);
        });

        /* ===== 
        ENSURE USER IS NOT IN THE ARRAY OF AVAILABLE SESSIONS 
        TO PREVENT SELF-MATCHING 
        (prevents having to check per iteration 
            whether matching oneself or not)
        ===== */

        availableSessions.forEach(function (eachSession, index, array) {
          firstMatchCompare = eachSession.firstPartnerId == userId;
          secondMatchCompare = eachSession.secondPartnerId == userId;
          console.log("available BEFORE", availableSessions);
          // If either partner is equal to user's id, remove from availableSessions
          if (firstMatchCompare || secondMatchCompare) {
            console.log("found session with own id, removing from array");
            array.splice(index, 1);

            // Prevent no double booking for time
            // and prepare data to display on client side
            // for which session of booked sessions
            // already has been booked for that time
            let alreadyMatchedForTimeSession = {
              sessionTime: eachSession.queryDateTime,
              sessionId: eachSession._id,
            };
            alreadyMatchedForTime.push(alreadyMatchedForTimeSession);
          }
          console.log("available BEFORE", availableSessions);
        });

        console.log("array after processing", availableSessions);

        /* ===== 
         IF ONLY ONE SESSION AVAILABLE
        --> SET MATCH 
        (optimization to not waste time on further iteration if only one option)
        ===== */
        if (availableSessions.length == 1) {
          sessionToMatch = availableSessions[0];
        }

        /* ===== 
        IF SPECIFIC MATCH PREFERENCE EXISTS &&
        IF NOT YET MATCHED &&
        IF PREFERRED MATCH EXISTS
        --> SET MATCH 
        ===== */
        if (sessionData.specificUserPreferenceId && !sessionToMatch) {
          let desiredUserId = sessionData.specificUserPreferenceId;

          availableSessions.forEach(function (session) {
            let firstId = session.firstPartnerId;
            let secondId = session.secondPartnerId;
            // Check if the session's existing partner is the desired partner
            if (firstId == desiredUserId || secondId == desiredUserId) {
              // If session's existing partner is a match
              // Set it as the preferred user you have found
              preferredUserSession = session;
            }
          });

          // If session with preferred user has been found, set as session to match
          if (preferredUserSession) {
            sessionToMatch = preferredUserSession;
          }
        }

        /* ===== 
        IF GENERAL MATCH PREFERENCE EXISTS &&
        IF NOT YET MATCHED &&
        IF NO PREFERRED USER SESSION &&
        ITERATE OVER DETAILS OF SESSIONS
        IF SESSION WITH PREFERENCE MATCH EXISTS
        --> SET MATCH 
        ===== */
        if (
          sessionData.generalPreferences &&
          !preferredUserSession &&
          !sessionToMatch
        ) {
          console.log("skip for now");
          // e.g. must have X amount of sessions
          // must be male/female
          // must have x anonymous rating
          // must have x show up rate
          // must have x cancellation rate
          // must have profile picture
          // must be elysium one connected
          // must be a friend

          // also filter to only see by these details

          // Check for best match:
          // iterate over each preference
          // push to choiceList array if qualifies
          // then push the rest to another list (if booking is enabled when no good match found)
          // then later run function to determine best fit
        }

        /* ===== 
        IF NO GENERAL PREFERENCES &&
        IF NO PREFERRED USER SESSION &&
        IF NOT YET MATCHED &&
        PICK RANDOM SESSION FROM LIST
        --> SET MATCH 
        ===== */
        if (
          !sessionData.generalPreferences &&
          !preferredUserSession &&
          !sessionToMatch
        ) {
          // Match for random available session
          sessionToMatch =
            availableSessions[
              Math.floor(Math.random() * availableSessions.length)
            ];
        }

        // If session to match has been found, set up match
        if (sessionToMatch && !alreadyMatchedForTime.length) {
          // if no, if preference to not be booked when not desired match or generalPreference match, do not book and return
          // OR book session but do not show up for anyone not matching criteria??
          // Create new session

          let partnerId = null;
          if (sessionToMatch.firstPartnerId) {
            partnerId = sessionToMatch.firstPartnerId;
          } else if (sessionToMatch.secondPartnerId) {
            partnerId = sessionToMatch.secondPartnerId;
          }

          let matchingData = {
            sessionToMatch,
            userId,
            username,
            partnerId,
          };
          returnSession = await BookingDataController.matchWithExistingSession(
            matchingData
          );

          if (
            returnSession.MatchedPartnerNoLongerThere ||
            returnSession.SessionNotFoundAnymore
          ) {
            // If matched partner no longer part of session, or session no longer found,
            // create new session
            returnSession = await BookingDataController.createAndBookSessionAndRoom(
              sessionData
            );
          }
        } else if (!sessionToMatch && alreadyMatchedForTime.length > 0) {
          // send info back that user is already has a session at that time
          console.log("already matched for time");
        } else {
          // Create new session
          returnSession = await BookingDataController.createAndBookSessionAndRoom(
            sessionData
          );
        }
      } else {
        // Create new session
        returnSession = await BookingDataController.createAndBookSessionAndRoom(
          sessionData
        );
      }
    } catch (error) {
      errors = prepareErrors(error, errors);
      throw { errors: errors };
    }

    return returnData;
  },

  async matchWithExistingSession(matchingData) {
    let returnSession = null;
    let errors = {};
    try {
      let userId = matchingData.userId;
      let username = matchingData.username;
      let partnerId = matchingData.partnerId;
      let sessionToMatch = matchingData.sessionToMatch;
      let sessionId = sessionToMatch._id;
      let query = { _id: sessionId };

      returnSession = await SessionModel.findById(query).exec();
      if (!returnSession) {
        returnSession = {
          SessionNotFoundAnymore: true,
        };
      }

      console.log("returnData @matchWithExistingSession: ", returnSession);
      if (returnSession.firstPartnerId == partnerId) {
        // Set yourself as the other partner;
        returnSession.secondPartnerId = userId;
        returnSession.secondPartnerUsername = username;
        returnSession.sessionThroughMatching = true;
      } else if (returnSession.secondPartnerId == partnerId) {
        // Set yourself as the other partner;
        returnSession.firstPartnerId = userId;
        returnSession.firstPartnerUsername = username;
        returnSession.sessionThroughMatching = true;
      } else {
        // Throw error and create new session instead
        returnSession = {
          MatchedPartnerNoLongerThere: true,
        };
      }
    } catch (error) {
      errors = prepareErrors(error, errors);
      throw { errors: errors };
    }
    await returnSession.save();
    return returnSession;
  },

  async createAndBookSessionAndRoom(sessionData) {
    let errors = {};
    let userId = sessionData.userId;
    let session = null;
    let existingSessions = await BookingDataController.checkIfAlreadyHaveSessionAtTime(
      sessionData
    );

    let query = {
      $and: [
        { $or: [{ firstPartnerId: userId }, { secondPartnerId: userId }] },
        { queryDateTime: sessionData.date },
      ],
    };
    // Check if already exists
    let sessionExistsAtTime = await SessionModel.exists(query);

    if (sessionExistsAtTime) {
      errors.SessionAtTimeAlreadyExists = true;
      throw { errors: errors };
    }

    try {
      session = new SessionModel({
        firstPartnerId: sessionData.userId,
        firstPartnerUsername: sessionData.username,
        scheduledDate: sessionData.date,
        scheduledStartTime: sessionData.startTime,
        scheduledEndTime: sessionData.endTime,
        queryDateTime: sessionData.queryDate,
        rawDateTime: sessionData.rawDateTime,
      });

      // create eventroom for session
      let eventroom = new EventroomModel({
        eventroomName: session._id,
        cofocusSessionId: session._id,
        dateCreated: new Date(),
        hostId: "cofocus",
        creatorId: "cofocus",
        expireAt: null,
      });

      session.eventroomId = eventroom._id;

      console.log(
        "Prepared Eventroom & Session for Cofocus",
        eventroom,
        session
      );
      await eventroom.save();
      await session.save();
    } catch (error) {
      errors = prepareErrors(error, errors);
      throw { errors: errors };
    }
    return session;
  },

  async checkIfAlreadyHaveSessionAtTime(sessionData) {
    // let query = { userId: userData.userId };
    let userId = sessionData.userId;
    let date = sessionData.queryDate;

    let query = {
      $and: [
        { $or: [{ firstPartnerId: userId }, { secondPartnerId: userId }] },
        { queryDateTime: date },
      ],
    };
    let errors = {};
    let existingSessions = null;
    try {
      existingSessions = await SessionModel.find(query).exec();
      console.log("existingSessions", existingSessions);
      if (existingSessions && existingSessions.length) {
        errors.SessionAtTimeAlreadyExists = true;
        throw { errors: errors };
      }
      //   console.log("bookedSessions", bookedSessions);
    } catch (error) {
      errors = prepareErrors(error, errors);
      throw { errors: errors };
    }
    return existingSessions;
  },

  async findSessionsForSlots(slotsQuery) {
    let responseData = { sessionsExistForTimes: false };
    let errors = {};

    try {
      let response = await SessionModel.find(slotsQuery).exec();

      if (response) {
        responseData.sessionsExistForTimes = true;
        responseData.existingSessionsArray = response;
      }
      console.log("WOW", response);
    } catch (error) {
      errors.FailedToCheckSessionsExist = true;
      errors.error = error;
      throw { errors: errors };
    }

    return responseData;
  },

  async bookManySessionSlots(sessionsData) {},

  /**
   * Creates a room with given data.
   * @param {*} roomData
   */
  async createRoom(roomData) {
    console.log("@createroomutil, roomdata", roomData);
    const room = new Room({
      eventId: roomData.eventId,
      hostId: roomData.hostId,
      dateCreated: new Date(),
      sessionId: roomData.sessionId,
    });
    return room.save();
  },

  async updateProfileByUserId() {},

  async getProfileByUserId(userId) {
    // By userId, not Profile._id
    return Profile.findOne({ userId: userId }).exec();
  },

  async getManyProfilesByUserIds(participantIds) {
    let participants = {};
    let tempUsers = await TempUser.find({ _id: { $in: participantIds } });
    console.log("TEMP USERS LIST", tempUsers);

    let users = await Profile.find({ userId: { $in: participantIds } });
    console.log("USERS LIST", users);

    if (tempUsers) {
      participants.tempUsers = tempUsers;
    }

    if (users) {
      participants.users = users;
    }

    // IF NOTHING IN EITHER, THROW OR RETURN EMPTY
    // OTHERWISE COMBINE
    // Get profiles by ids
    console.log("PARTICIPANTS", participants);
    return participants;
  },

  async saveProfileImageReference(imageData) {
    // save profile image data
    console.log("imageData", imageData);
    let setData = {
      "profileImage.fileName": imageData.fileName,
      "profileImage.fileUrl": imageData.fileUrl,
    };
    let query = { userId: imageData.userId };
    let options = { upsert: true, new: true, setDefaultsOnInsert: true };

    // $set used to update multiple fields
    // https://stackoverflow.com/questions/37267042/mongoose-findoneandupdate-updating-multiple-fields
    let update = { $set: setData };
    console.log("update", update);

    await AccountSettings.findOneAndUpdate(query, update, options).exec();

    let profile = await Profile.findOneAndUpdate(query, update, options).exec();
    return profile;
  },

  async createProfile(profileData) {
    const newProfile = new Profile({
      userId: profileData.userId,
      displayName: profileData.displayName,
      email: profileData.email,
      username: profileData.username,
      firstName: profileData.firstName,
      lastName: profileData.firstName,
    });
    return newProfile.save();
  },

  /**
   * Creates a room with given data.
   * @param {*} roomData
   */
  async createRoom(roomData) {
    console.log("@createroomutil, roomdata", roomData);
    const room = new Room({
      eventId: roomData.eventId,
      hostId: roomData.hostId,
      dateCreated: new Date(),
      sessionId: roomData.sessionId,
    });
    return room.save();
  },

  /**
   * Sets Vonage session id for the room
   * @param {*} roomId
   * @param {*} sessionId
   */
  async setSessionId(roomId, sessionId) {
    let room;
    try {
      room = Room.findById(roomId).exec();
      if (!room) throw Error("no room found");
    } catch (err) {
      console.log("@addsessionid error:", err);
      return Promise.reject("problem while adding session id");
    }

    room.sessionId = sessionId;
    return room.save();
  },

  /**
   * Adds a session token to the room
   * @param {*} roomId
   * @param {*} sessionToken
   */
  async addSessionToken(roomId, sessionToken) {
    let room;
    try {
      room = Room.findById(roomId).exec();
      if (!room) throw Error("no room found");
    } catch (err) {
      console.log("@addsessiontoken error", err);
      return Promise.reject("error while adding session token");
    }

    if (room.sessionTokens) {
      room.sessionTokens.push(sessionToken);
    } else {
      room.sessionTokens = [sessionToken];
    }

    return room.save();
  },

  async getRoomById(roomId) {
    return Room.findById(roomId).exec();
  },

  async deleteAll() {
    try {
      await Room.remove({}).exec();
      await TempUser.remove({}).exec();
    } catch (err) {
      console.log("err");
      return Promise.reject("error");
    }
    return { success: true };
  },
};

module.exports = BookingDataController;
