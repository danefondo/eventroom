const SessionModel = require("../models/SessionModel");
const EventroomModel = require("../../eventroom/models/EventroomModel");
const UserModel = require("../../user/models/UserModel");

const {
  removeOwnSessionsFromArray,
  filterAvailableSessions,
  checkIfMatchPreferenceAvailable,
  getBestAvailableMatchByPreferences,
  getBestRandomMatch,
  filterAvailableSessionsForSlot,
  findMatchesForAllPossibleSlots,
  getNextSession,
  checkIfBookRequestInPast,
  checkIfDateInArrayOverlaps,
  removeOverlappingDatesFromArray,

  removeOverlappingDates,
  removePastDatesFromArray,
  removePastDates,
} = require("../utilities/BookingUtilities");

const { prepareErrors } = require("../../../utilities/errorHandlers");

const BookingDataController = {
  /* USED */
  async getUserNextSession(userData) {
    // let query = { userId: userData.userId };
    let userId = userData.userId;
    let endOfWeekPlusTwoHours = userData.endOfWeekPlusTwoHours;

    // this is milliseconds
    let hourBeforeNow = new Date(Date.now() - 50 * 60 * 1000);

    let query = {
      $and: [
        { $or: [{ firstPartnerId: userId }, { secondPartnerId: userId }] },
        { dateTime: { $gt: hourBeforeNow, $lt: endOfWeekPlusTwoHours } },
      ],
    };

    let errors = {};
    let nextUserSession = null;
    let bookedSessionsThisWeek = null;

    try {
      bookedSessionsThisWeek = await SessionModel.find(query).exec();
      console.log("bookedSessionsThisWeek: ", bookedSessionsThisWeek);
      if (bookedSessionsThisWeek) {
        nextUserSession = getNextSession(bookedSessionsThisWeek);
      } else {
        nextUserSession = {
          NoSessionsThisWeek: true,
        };
      }
    } catch (error) {
      errors = prepareErrors(error, errors);
      throw { errors: errors };
    }
    return nextUserSession;
  },

  /* USED */
  async getBookedSessionsForOneDay(dayData) {
    let userId = dayData.userId;
    let startOfDay = new Date(dayData.startOfDay);
    let endOfDay = new Date(dayData.endOfDay);
    let hourBefore = 50 * 60 * 1000;
    let hourBeforeNow = new Date(Date.now() - hourBefore);
    let hourBeforeStartOfDay = new Date(startOfDay.valueOf() - hourBefore);

    let query = {
      $or: [
        {
          $and: [
            { $or: [{ firstPartnerId: userId }, { secondPartnerId: userId }] },
            {
              dateTime: { $gt: hourBeforeStartOfDay, $lt: endOfDay },
            },
          ],
        },
        { dateTime: { $gt: hourBeforeNow, $lt: endOfDay } },
      ],
    };

    let errors = {};
    let allBookedSessions;
    try {
      allBookedSessions = await SessionModel.find(query).exec();
      // console.log("allBooked", allBookedSessions);
    } catch (error) {
      errors = prepareErrors(error, errors);
      throw { errors: errors };
    }
    return allBookedSessions;
  },

  /* UNUSED */
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

  /* USED */
  async getAllBookedUsersForSpecificWeek(weekData) {
    let startOfWeekDate = new Date(weekData.startOfWeekDate);
    let hourInMS = 60 * 60 * 1000;
    let hourBeforeStartOfWeek = new Date(startOfWeekDate.valueOf() - hourInMS);

    let endOfWeekDate = weekData.endOfWeekDate;
    let currentMoment = new Date();

    let userId = weekData.userId;

    // let query = { dateTime: { $gt: currentMoment, $lt: endOfWeekDate } };

    let query = {
      $or: [
        {
          $and: [
            { $or: [{ firstPartnerId: userId }, { secondPartnerId: userId }] },
            {
              dateTime: { $gt: hourBeforeStartOfWeek, $lt: endOfWeekDate },
            },
          ],
        },
        { dateTime: { $gt: currentMoment, $lt: endOfWeekDate } },
      ],
    };

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

  /* USED */
  async cancelSession(sessionData) {
    // find session
    // remove user id
    // delete eventroom?
    // update for everyone (other match if exists and that it becomes available for others)
    // if no one left, DELETE
    let sessionId = sessionData.sessionId;
    let userId = sessionData.userId;
    let errors = {};
    let canceledSession = null;
    let sessionHasMatch = false;
    let noAccess = false;
    let canceledSessionDate = null;

    try {
      // sessionId = mongoose.Types.ObjectId(sessionId);
      canceledSession = await SessionModel.findById(sessionId).exec();
      console.log("found session to cancel", canceledSession);

      if (!canceledSession) {
        errors.FailedToReturnCanceledSession = true;
        throw { errors: errors };
      }

      // Check if is a matched session
      if (canceledSession.firstPartnerId && canceledSession.secondPartnerId) {
        // Ensure user is one of the matched partners
        if (
          canceledSession.firstPartnerId == userId ||
          canceledSession.secondPartnerId == userId
        ) {
          sessionHasMatch = true;
        } else {
          noAccess = true;
        }
      }

      canceledSessionDate = canceledSession.dateTime;
      console.log("canceledSESSIONDATE", canceledSessionDate);

      // If no match, just delete the session & eventroom
      if (!sessionHasMatch && !noAccess) {
        let eventroomId = canceledSession.eventroomId;
        await EventroomModel.findOneAndDelete({ _id: eventroomId }).exec();
        await canceledSession.deleteOne();
        // set to null to differentiate on front-end
        canceledSession = 1;
      } else if (sessionHasMatch && !noAccess) {
        if (canceledSession.firstPartnerId == userId) {
          canceledSession.firstPartnerId = undefined;
          canceledSession.firstPartnerUsername = undefined;
          canceledSession.sessionThroughMatching = undefined;
          canceledSession.firstPartnerFirstName = undefined;
          canceledSession.firstPartnerLastName = undefined;
          canceledSession.firstPartnerDisplayName = undefined;
          canceledSession.firstPartnerProfileImageUrl = undefined;
        } else if (canceledSession.secondPartnerId == userId) {
          canceledSession.secondPartnerId = undefined;
          canceledSession.secondPartnerUsername = undefined;
          canceledSession.sessionThroughMatching = undefined;
          canceledSession.secondPartnerFirstName = undefined;
          canceledSession.secondPartnerLastName = undefined;
          canceledSession.secondPartnerDisplayName = undefined;
          canceledSession.secondPartnerProfileImageUrl = undefined;
        }

        await canceledSession.save();
      }
      // Update user sessions
      let userQuery = { _id: userId };
      let pull = {
        $pull: {
          sessions: sessionId,
          bookedSessionTimes: canceledSessionDate,
        },
      };
      await UserModel.update(userQuery, pull).exec();
    } catch (error) {
      errors = prepareErrors(error, errors);
      throw { errors: errors };
    }
    return canceledSession;
  },

  // Rather than updating each user individually
  // manage a single central source of truth file
  // for each session, and update data there
  /* USED */
  async bookSessionSlot(sessionData) {
    let userId = sessionData.userId;
    let username = sessionData.username;
    let returnSession = null;
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
      let isPastSession = checkIfBookRequestInPast(sessionData.dateTime);
      if (isPastSession) {
        errors.CannotBookSessionInPast = true;
        throw { errors: errors };
      }

      let user = await UserModel.findById(userId).exec();
      let userAlreadyHasSessionForTime = checkIfDateInArrayOverlaps(
        user.bookedSessionTimes,
        sessionData.dateTime
      );

      if (userAlreadyHasSessionForTime) {
        errors.UserAlreadyHasSessionForTimeError = true;
        throw { errors: errors };
      }

      let query = { dateTime: sessionData.dateTime };

      // Check for whether any sessions exist for the time
      let response = await BookingDataController.findSessionsForSlots(query);

      // If sessions exists, check if anyone's available
      // for matching for that time, then --> match
      if (
        response &&
        response.sessionsExist &&
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
        if (sessionToMatch) {
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

  /* USED */
  async bookManySessionSlots(requestData) {
    let userId = requestData.userId;
    let username = requestData.username;
    let firstName = requestData.firstName;
    let lastName = requestData.lastName;
    let displayName = requestData.displayName;
    let profileImageUrl = requestData.profileImageUrl;
    let slotsToBookArray = requestData.slotsToBookArray;
    let slotsToBookTimesArray = requestData.slotsToBookTimesArray;

    // Prepare data arrays
    let matchedBookedSessions = [];
    let unmatchedBookedSessions = [];
    let matchingResultLeftovers = [];
    let slotsWithFoundMatches = [];
    let slotsWithNoFoundMatches = [];
    let finalUnmatchedSlots = [];

    // Prepare return objects
    let returnData = {};
    let errors = {};

    try {
      let user = await UserModel.findById(userId).exec();

      let nowInMS = Date.now();

      slotsToBookTimesArray = removePastDatesFromArray(
        slotsToBookTimesArray,
        nowInMS
      );

      slotsToBookArray = removePastDates(slotsToBookArray, nowInMS);

      if (!slotsToBookTimesArray.length || !slotsToBookArray.length) {
        errors.AllToBookSessionsAreInThePast = true;
        throw { errors: errors };
      }

      slotsToBookTimesArray = removeOverlappingDatesFromArray(
        user.bookedSessionTimes,
        slotsToBookTimesArray
      );

      slotsToBookArray = removeOverlappingDates(
        user.bookedSessionTimes,
        slotsToBookArray
      );

      if (!slotsToBookTimesArray.length || !slotsToBookArray.length) {
        errors.UserAlreadyHasSessionForTimeError = true;
        throw { errors: errors };
      }

      let query = { dateTime: { $in: slotsToBookTimesArray } };

      // Check for whether any sessions exist for the time
      let response = await BookingDataController.findSessionsForSlots(query);
      console.log("@findSessionsForSlots @2 Response:", response);

      // If there are sessions suiting times
      // then per session, do equivalent checks
      // then prepare data so that multi-update
      // or multi create can be done later

      // Find match for EACH

      // If any sessions exist at all for those times, handle them
      if (
        response &&
        response.sessionsExist &&
        response.existingSessionsArray &&
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

        // Filter sessions to only keep available unmatched sessions
        let availableSessions = filterAvailableSessions(existingSessionsArray);

        // Pair up availableSessions and slotsToBookArray and see if any can match together
        // Divice up slotsToBookArray into two
        let matchCheckResult = findMatchesForAllPossibleSlots(
          availableSessions,
          slotsToBookArray
        );

        slotsWithFoundMatches = matchCheckResult.slotsWithFoundMatches;
        slotsWithNoFoundMatches = matchCheckResult.slotsWithNoFoundMatches;

        // Sessions with found matches will be attempted for matching
        // Leftovers will be lead to other conveyer to create new sessions
        // alongside those which found no matches in the first place

        // Found match means a user's slot has found an existing available session with another's slot
        if (slotsWithFoundMatches.length > 0) {
          let matchingData = {
            slotsWithFoundMatches: slotsWithFoundMatches,
            userId: userId,
            username: username,
          };
          // Match all sessions with found matches
          let matchingResult = await BookingDataController.matchManySessions(
            matchingData
          );

          // 1) sessonis nolonger found when attempt matchiing (match leftovers)
          // 2) had no match to begin with )slotswithnofoundmatches
          matchingResultLeftovers = matchingResult.matchingResultLeftovers;

          matchedBookedSessions = matchingResult.matchedBookedSessions;
        }
      } else {
        slotsWithNoFoundMatches = slotsToBookArray;
        console.log(
          "@findSessionsForSlots @2 No response data, setting slotsWithNoFoundMatches.",
          slotsWithNoFoundMatches
        );
      }

      if (slotsWithNoFoundMatches && slotsWithNoFoundMatches.length) {
        slotsWithNoFoundMatches.forEach((unmatchedSlot) => {
          finalUnmatchedSlots.push(unmatchedSlot);
        });
      }

      if (matchingResultLeftovers && matchingResultLeftovers.length) {
        matchingResultLeftovers.forEach((unmatchedSlot) => {
          finalUnmatchedSlots.push(unmatchedSlot);
        });
      }
      if (finalUnmatchedSlots && finalUnmatchedSlots.length) {
        let userData = {
          userId,
          username,
          firstName,
          lastName,
          displayName,
          profileImageUrl,
        };
        // Create new sessions for all slots remaining that did not find a match
        unmatchedBookedSessions = await BookingDataController.createAndBookManySessions(
          finalUnmatchedSlots,
          userData
        );
      }
      // For all time slots with no match, create new session for slot
    } catch (error) {
      errors = prepareErrors(error, errors);
      throw { errors: errors };
    }

    /* ===== PREPARE FINAL RETURN DATA ===== */
    if (
      matchedBookedSessions &&
      unmatchedBookedSessions &&
      matchedBookedSessions.length &&
      unmatchedBookedSessions.length
    ) {
      // Some sessions were matched, some sessions were not and just booked
      // Merge array sessions ES6 style: https://stackoverflow.com/a/51240518/8010396
      returnData = [...unmatchedBookedSessions, ...matchedBookedSessions];
    } else if (unmatchedBookedSessions && unmatchedBookedSessions.length) {
      // All sessions were unmatched but booked and none matched
      returnData = unmatchedBookedSessions;
    } else if (matchedBookedSessions && matchedBookedSessions.length) {
      // All sessions were matched and none unmatched
      returnData = matchedBookedSessions;
    }

    // Return array of booked sessions, whether matched or unmatched;
    console.log("returndata", returnData);
    return returnData;
  },

  /* USED */
  async matchManySessions(matchingData) {
    let returnData = {};
    let errors = {};
    let userId = matchingData.userId;
    let username = matchingData.username;
    let firstName = matchingData.firstName;
    let lastName = matchingData.lastName;
    let displayName = matchingData.displayName;
    let profileImageUrl = matchingData.profileImageUrl;
    let slotsWithFoundMatches = matchingData.slotsWithFoundMatches;
    let sessionsNoLongerFoundIds = [];
    // let sessionsNoLongerFound = [];
    let slotsWithNoLongerFoundSession = [];
    let matchedBookedSessions = [];
    let sessionIds = [];
    let bookedSessionTimes = [];
    try {
      let sessionIdsArray = [];

      // Populate session id array
      slotsWithFoundMatches.forEach((slotData) => {
        sessionIdsArray.push(slotData.sessionToMatch._id);
      });

      // Get sessions
      let query = { _id: { $in: sessionIdsArray } };
      let response = await BookingDataController.findSessionsForSlots(query);

      if (
        response &&
        response.sessionsExist &&
        response.existingSessionsArray.length &&
        response.existingSessionsArray.length > 0
      ) {
        let sessionsArray = response.existingSessionsArray;

        // Check if all sessions still exist
        // if some missing, add to sessionsNoLongerFoundIds
        // which need creating new sessions for later
        for (let id of sessionIdsArray) {
          /*NB!!! Mongoose ObjectId Comparison, not regular string ids */
          if (!sessionsArray.some((session) => session._id.equals(id))) {
            sessionsNoLongerFoundIds.push(id);
            // console.log("sessionsNoLongerFound IDS", sessionsNoLongerFoundIds);
            // sessionIdsArray = sessionIdsArray.filter((e) => e !== id);
          }
          for (let session of sessionsArray) {
            // console.log("session BEFORE updating data", session);

            if (session.dateTime)
              if (session._id.equals(id)) {
                // Compare mongoose object id's
                // set new partner id
                if (session.firstPartnerId) {
                  session.secondPartnerId = userId;
                  session.secondPartnerUsername = username;
                  session.sessionThroughMatching = true;
                  session.secondPartnerFirstName = firstName;
                  session.secondPartnerLastName = lastName;
                  session.secondPartnerDisplayName = displayName;
                  session.secondPartnerProfileImageUrl = profileImageUrl;
                } else if (session.secondPartnerId) {
                  session.firstPartnerId = userId;
                  session.firstPartnerUsername = username;
                  session.sessionThroughMatching = true;
                  session.firstPartnerFirstName = firstName;
                  session.firstPartnerLastName = lastName;
                  session.firstPartnerDisplayName = displayName;
                  session.firstPartnerProfileImageUrl = profileImageUrl;
                }
                await session.save();
                matchedBookedSessions.push(session);
                sessionIds.push(session._id);
                bookedSessionTimes.push(new Date(session.dateTime));
              }
          }
        }
      } else {
        // None of the sessions exist anymore
        sessionsNoLongerFoundIds = sessionIdsArray;
      }
    } catch (error) {
      errors = prepareErrors(error, errors);
      throw { errors: errors };
    }
    if (sessionsNoLongerFoundIds.length > 0) {
      // get original sessions from ids
      sessionsNoLongerFoundIds.forEach((sessionId) => {
        slotsWithFoundMatches.forEach((slotData) => {
          if (slotData.sessionToMatch._id == sessionId) {
            slotsWithNoLongerFoundSession.push(slotData.slotMatched);
            // sessionsNoLongerFound.push(slotData.sessionToMatch);
          }
        });
      });

      returnData.matchingResultLeftovers = slotsWithNoLongerFoundSession;
    }
    returnData.matchedBookedSessions = matchedBookedSessions;
    if (sessionIds.length) {
      // Update user sessions
      let userQuery = { _id: userId };
      let pushMany = {
        $addToSet: {
          sessions: { $each: sessionIds },
          bookedSessionTimes: { $each: bookedSessionTimes },
        },
      };
      await UserModel.update(userQuery, pushMany).exec();
    }
    return returnData;
  },

  /* USED */
  async matchWithExistingSession(matchingData) {
    let returnSession = null;
    let errors = {};

    try {
      let userId = matchingData.userId;
      let username = matchingData.username;
      let firstName = matchingData.firstName;
      let lastName = matchingData.lastName;
      let displayName = matchingData.displayName;
      let profileImageUrl = matchingData.profileImageUrl;
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

      //   console.log("returnData @matchWithExistingSession: ", returnSession);
      if (returnSession.firstPartnerId == partnerId) {
        // Set yourself as the other partner;
        returnSession.secondPartnerId = userId;
        returnSession.secondPartnerUsername = username;
        returnSession.sessionThroughMatching = true;
        returnSession.secondPartnerFirstName = firstName;
        returnSession.secondPartnerLastName = lastName;
        returnSession.secondPartnerDisplayName = displayName;
        returnSession.secondPartnerProfileImageUrl = profileImageUrl;
      } else if (returnSession.secondPartnerId == partnerId) {
        // Set yourself as the other partner;
        returnSession.firstPartnerId = userId;
        returnSession.firstPartnerUsername = username;
        returnSession.sessionThroughMatching = true;
        returnSession.firstPartnerFirstName = firstName;
        returnSession.firstPartnerLastName = lastName;
        returnSession.firstPartnerDisplayName = displayName;
        returnSession.firstPartnerProfileImageUrl = profileImageUrl;
      } else {
        // Throw error and create new session instead
        returnSession = {
          MatchedPartnerNoLongerThere: true,
        };
      }
      await returnSession.save();
      // Update user sessions
      let userQuery = { _id: userId };
      let push = {
        $push: {
          sessions: returnSession._id,
          bookedSessionTimes: new Date(returnSession.dateTime),
        },
      };
      await UserModel.update(userQuery, push).exec();
    } catch (error) {
      errors = prepareErrors(error, errors);
      throw { errors: errors };
    }

    return returnSession;
  },

  /* USED */
  async createAndBookSessionAndRoom(sessionData) {
    let errors = {};
    let session = null;
    let userId = sessionData.userId;
    let username = sessionData.username;
    let firstName = sessionData.firstName;
    let lastName = sessionData.lastName;
    let displayName = sessionData.displayName;
    let profileImageUrl = sessionData.profileImageUrl;

    // let query = {
    //   $and: [
    //     { $or: [{ firstPartnerId: userId }, { secondPartnerId: userId }] },
    //     { dateTime: sessionData.date },
    //   ],
    // };
    // // Check if already exists
    // let sessionExistsAtTime = await SessionModel.exists(query);

    // if (sessionExistsAtTime) {
    //   errors.SessionAtTimeAlreadyExists = true;
    //   throw { errors: errors };
    // }

    try {
      session = new SessionModel({
        firstPartnerId: userId,
        firstPartnerUsername: username,
        firstPartnerFirstName: firstName,
        firstPartnerLastName: lastName,
        firstPartnerDisplayName: displayName,
        firstPartnerProfileImageUrl: profileImageUrl,
        sessionInterval: sessionData.sessionInterval,
        dateTime: sessionData.dateTime,
      });

      // create eventroom for session
      const eventroom = new EventroomModel({
        eventroomName: session._id,
        cofocusSessionId: session._id,
        dateCreated: new Date(),
        hostId: "cofocus",
        creatorId: "cofocus",
        expireAt: null,
      });

      session.eventroomId = eventroom._id;

      Promise.all([eventroom.save(), session.save()]);
    } catch (error) {
      errors = prepareErrors(error, errors);
      throw { errors: errors };
    }

    // Update user sessions
    let userQuery = { _id: userId };
    let push = {
      $push: {
        sessions: session._id,
        bookedSessionTimes: new Date(sessionData.dateTime),
      },
    };
    await UserModel.update(userQuery, push).exec();

    return session;
  },

  /* USED */
  async createAndBookManySessions(unmatchedSlots, userData) {
    let errors = {};
    let unmatchedBookedSessions = [];
    let sessionIds = [];
    let bookedSessionTimes = [];
    let userId = userData.userId;
    let username = userData.username;
    let firstName = userData.firstName;
    let lastName = userData.lastName;
    let displayName = userData.displayName;
    let profileImageUrl = userData.profileImageUrl;
    try {
      for (let slot of unmatchedSlots) {
        session = new SessionModel({
          firstPartnerId: userId,
          firstPartnerUsername: username,
          firstPartnerFirstName: firstName,
          firstPartnerLastName: lastName,
          firstPartnerDisplayName: displayName,
          firstPartnerProfileImageUrl: profileImageUrl,
          sessionInterval: slot.sessionInterval,
          dateTime: slot.dateTime,
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

        // console.log(
        //   "Prepared Eventroom & Session for Cofocus",
        //   eventroom,
        //   session
        // );
        // await eventroom.save();
        // await session.save();
        Promise.all([eventroom.save(), session.save()]);
        unmatchedBookedSessions.push(session);
        sessionIds.push(session._id);
        bookedSessionTimes.push(new Date(slot.dateTime));
      }
    } catch (error) {
      errors = prepareErrors(error, errors);
      throw { errors: errors };
    }

    // Update user sessions
    let userQuery = { _id: userId };
    let pushMany = {
      $addToSet: {
        sessions: { $each: sessionIds },
        bookedSessionTimes: { $each: bookedSessionTimes },
      },
    };
    await UserModel.update(userQuery, pushMany).exec();

    return unmatchedBookedSessions;
  },

  /* UNUSED */
  async checkIfAlreadyHaveSessionAtTime(sessionData) {
    let userId = sessionData.userId;

    let query = {
      $and: [
        { $or: [{ firstPartnerId: userId }, { secondPartnerId: userId }] },
        { dateTime: sessionData.dateTime },
      ],
    };
    let errors = {};
    let existingSessions = null;
    try {
      existingSessions = await SessionModel.find(query).exec();
      //   console.log("existingSessions", existingSessions);
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

  /* USED */
  async findSessionsForSlots(slotsQuery) {
    let responseData = { sessionsExist: false };
    let errors = {};

    try {
      let sessions = await SessionModel.find(slotsQuery).exec();

      if (sessions.length) {
        responseData.sessionsExist = true;
        responseData.existingSessionsArray = sessions;
      }
    } catch (error) {
      errors.FailedToCheckSessionsExist = true;
      errors.error = error;
      throw { errors: errors };
    }

    return responseData;
  },
};

module.exports = BookingDataController;
