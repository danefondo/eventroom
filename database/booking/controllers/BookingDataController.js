const SessionModel = require("../models/SessionModel");
const EventroomModel = require("../../eventroom/models/EventroomModel");
const moment = require('moment')

const BookingDataController = {
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
      console.log("bookedSessions", bookedSessions);
    } catch (error) {
      if (error.errors) {
        errors = error.errors;
      } else {
        errors.error = error;
      }
      throw { errors: errors };
    }
    return bookedSessions;
  },

  async getAllBookedUsersForSpecificWeek(weekData) {
    console.log("weekData", weekData);
    let currentWeek = weekData.currentWeek;
    let endOfWeekDate = weekData.endOfWeekDate;
    console.log("endOfWeekDate", endOfWeekDate);
    let currentMoment = new Date();

    // let query = { "rawDateTime": { $gt: currentWeek, $lt: endOfWeekDate }};
    let query = {};

    // Filter by current week somehow (queryDate?)
    // And then moment

    // let query = {
    //   $or: [{ firstPartnerId: userId }, { secondPartnerId: userId }],
    // };
    let errors = {};
    let allBookedSessions;
    try {
      allBookedSessions = await SessionModel.find(query).exec();
      console.log("allBookedSessions", allBookedSessions);
    } catch (error) {
      if (error.errors) {
        errors = error.errors;
      } else {
        errors.error = error;
      }
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
    let errors = {};
    // Is a preferred user specified?
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

    // Create room & attach room id or name
    // Room must perform check if user is one of the matched candidates

    // If no existing sessions, --> create session --> create room --> associate room

    // If existing sessions --> if == 1 --> match, else if > 1 --> perform filtered checks & match w/best match
    // filters include having selected a set of preferred matches in drag&drop list

    try {
      let queryDate = sessionData.queryDate;

      // Check for whether any sessions exist for the time
      let response = await BookingDataController.checkIfAnySessionsForSlot(
        queryDate
      );

      // If sessions exists, check if anyone's available
      // for matching for that time, then --> match
      if (
        response &&
        response.sessionsExistForTime &&
        response.existingSessionsArray.length
      ) {
        console.log("response", response);

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
            secondPartnerSlotAvailable = true;
          } else if (!session.firstPartnerId && session.secondPartnerId) {
            firstPartnerSlotAvailable = true;
          }

          if (firstPartnerSlotAvailable && secondPartnerSlotAvailable) {
            // TODO, SKIP & DELETE THIS
            // + PERIODIC CLEAN UP OF ANY SIMILAR SESSIONS
            console.log("A session with no one? Skip. Delete.");
          } else if (firstPartnerSlotAvailable || secondPartnerSlotAvailable) {
            availableSessions.push(session);
          }
          console.log("Available sessions: ", availableSessions);
        });

        // Check if user has any preferences, then perform match or create new session
        if (availableSessions.length == 1) {
          // Optimization to not waste time on further iteration if only 1 option.
          sessionToMatch = availableSessions[0];
        }

        // If session has not yet been matched & specific user preference exists
        if (sessionData.specificUserPreferenceId && !sessionToMatch) {
          let desiredUserId = sessionData.specificUserPreferenceId;

          availableSessions.forEach(function (session) {
            // Check if the session's existing partner is the desired partner
            if (
              session.firstPartnerId == desiredUserId ||
              session.secondPartnerId == desiredUserId
            ) {
              // If session's existing partner is a match
              // Set it as the preferred user you have found
              preferredUserSession = session;
            }
          });

          if (preferredUserSession) {
            // If preferred user has been found, set them as the session to match
            sessionToMatch = preferredUserSession;
          }
        }

        // If preferred user not found, attempt find based on preferences if any
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

        // If no preferences & selected preferred user not found, pick random
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
        if (sessionToMatch) {
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
      if (error.errors) {
        errors = error.errors;
      } else {
        errors.error = error;
      }
      throw { errors: errors };
    }

    return returnSession;
  },

  async matchWithExistingSession(matchingData) {
    let returnSession = null;
    let errors = {};
    try {
      let userId = matchingData.userId;
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
      } else if (returnSession.secondPartnerId == partnerId) {
        // Set yourself as the other partner;
        returnSession.firstPartnerId = userId;
      } else {
        // Throw error and create new session instead
        returnSession = {
          MatchedPartnerNoLongerThere: true,
        };
      }
    } catch (error) {
      if (error.errors) {
        errors = error.errors;
      } else {
        errors.error = error;
      }
      throw { errors: errors };
    }
    await returnSession.save();
    return returnSession;
  },

  async createAndBookSessionAndRoom(sessionData) {
    let errors = {};
    let session = null;
    try {
      session = new SessionModel({
        firstPartnerId: sessionData.userId,
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
      if (error.errors) {
        errors = error.errors;
      } else {
        errors.error = error;
      }
      throw { errors: errors };
    }
    return session;
  },

  async checkIfAnySessionsForSlot(sessionDateTime) {
    let responseData = { sessionsExistForTime: false };
    let errors = {};

    try {
      let query = { queryDate: sessionDateTime };
      let response = await SessionModel.find(query).exec();

      if (response) {
        responseData.sessionsExistForTime = true;
        responseData.existingSessionsArray = response;
      }
    } catch (error) {
      errors.FailedToCheckSessionsExist = true;
      errors.error = error;
      throw { errors: errors };
    }

    return responseData;
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
