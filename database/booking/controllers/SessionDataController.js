const SessionModel = require("../models/SessionModel");
const UserModel = require("../../user/models/UserModel");

const {
  setTotalTimeInSession,
  setPartnerJoinedStates,
  setPartnerLateness,
  setPartnerEarliness,
  setSessionToFinished,
} = require("../utilities/SessionUtilities");

const { prepareErrors } = require("../../../utilities/errorHandlers");

const SessionDataController = {
  /* ====== DURING SESSION ======*/
  async requestRematch(sessionData) {},

  async rematchSession(sessionData) {
    // update field: sessionHasBeenRematched
  },

  async getSessionById(sessionId) {
    let errors = {};
    let session = null;

    try {
      let query = { _id: sessionId };
      session = await SessionModel.findById(query).exec();
    } catch (error) {
      errors = prepareErrors(error, errors);
      throw { errors: errors };
    }
    return session;
  },

  async getLastTwentyUserSessions(userId) {
    let errors = {};
    let sessions = null;

    // store user's sessions ids in user's model and
    try {
      let query = {
        $or: [{ firstPartnerId: userId }, { secondPartnerId: userId }],
      };
      sessions = await SessionModel.find(query).sort("-date").limit(20).exec();
    } catch (error) {
      errors = prepareErrors(error, errors);
      throw { errors: errors };
    }
    return sessions;
  },

  async getLatestSessionData(sessionData) {
    // Used to check if session still exists
    // Used to check if both partners still exist && current next session is still same as one running in timer
  },

  async updateSessionMeta(sessionData) {
    let fieldsToUpdate = sessionData.fieldsToUpdate;
    fieldsToUpdate.forEach((fieldObject) => {
      let fieldToUpdate = fieldObject.fieldToUpdate;
      let newFieldState = fieldObject.newFieldState;
    });

    try {
      currentSession = await SessionModel.find(query).exec();
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

    /* 
    ====== FIELDS TO UPDATE ====== 
    - partnerJoinedFiveMinFromStart
    - partnerWasLate

    - sessionHasStarted
    - sessionHasFinished

    - partnerHasCanceled
    
    */
  },

  /* ====== TIMESTAMP LOGGING ======*/

  async registerJoinTimestamp(joinTimestamp) {
    console.log("WO I JOINED! MADE THIS FAR!");
    let sessionId = joinTimestamp.sessionId;
    let userId = joinTimestamp.participantId;

    let session = await SessionDataController.getSessionById(sessionId);

    let timestampInMS = new Date(joinTimestamp.timestamp).valueOf();

    let sessionStartInMS = new Date(session.dateTime).valueOf();
    let tenBeforeStartInMS = sessionStartInMS - 10 * 60 * 1000;

    let sessionIntervalInMS = session.sessionInterval * 60 * 1000;
    let sessionEndInMS = sessionStartInMS + sessionIntervalInMS;

    let joinedDuring = false;
    let joinedBefore = false;

    if (timestampInMS >= sessionStartInMS && timestampInMS < sessionEndInMS) {
      joinedDuring = true;
    } else if (
      timestampInMS < sessionStartInMS &&
      timestampInMS >= tenBeforeStartInMS
    ) {
      joinedBefore = true;
    }

    let partner = "";
    if (session.firstPartnerId == userId) {
      partner = "firstPartnerSessionData";
    } else if (session.secondPartnerId == userId) {
      partner = "secondPartnerSessionData";
    }

    let partnerData = session[partner];
    partnerData.partnerTimestamps.push(joinTimestamp);

    if (!partnerData.hasJoinedDuringSession && joinedDuring) {
      partnerData.hasJoinedDuringSession = true;
    }

    if (!partnerData.hasJoinedBeforeSession && joinedBefore) {
      partnerData.hasJoinedBeforeSession = true;
    }

    partnerData.isCurrentlyInSession = true;

    await session.save();

    return session;
  },

  async registerLeaveTimestamp(leaveTimestamp) {
    let sessionId = leaveTimestamp.sessionId;
    let userId = leaveTimestamp.participantId;

    let session = await SessionDataController.getSessionById(sessionId);

    let partner = "";
    if (session.firstPartnerId == userId) {
      partner = "firstPartnerSessionData";
    } else if (session.secondPartnerId == userId) {
      partner = "secondPartnerSessionData";
    }

    let partnerData = session[partner];

    partnerData.partnerTimestamps.push(leaveTimestamp);

    partnerData.isCurrentlyInSession = false;

    await session.save();

    return session;
  },

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

  /* ====== AFTER SESSION HAS ENDED ======*/
  async computeSessionConclusion(sessionData) {
    let sessionId = sessionData.sessionId;
    let userId = sessionData.userId;

    let session = await SessionDataController.getSessionById(sessionId);
    if (!session) return;

    // Set session has finished
    session = setSessionToFinished(session);
    if (!session.sessionHasFinished) return console.log("Session unfinished.");

    // Set which partner data is being updated
    let partner = "";
    if (session.firstPartnerId == userId) {
      partner = "firstPartnerSessionData";
    } else if (session.secondPartnerId == userId) {
      partner = "secondPartnerSessionData";
    }

    // Set timestamps
    let timestamps = session[partner].partnerTimestamps;

    session = setPartnerJoinedStates(timestamps, session, partner);

    session = setTotalTimeInSession(timestamps, session, partner);

    session = setPartnerLateness(timestamps, session, partner);

    session = setPartnerEarliness(timestamps, session, partner);

    let thirtyMinInMS = 30 * 60 * 1000;

    if (session[partner].partnerTotalTimeInSessionInMS >= thirtyMinInMS) {
      session[partner].partnerAttendanceSuccessful = true;
    } else {
      session[partner].partnerAttendanceSuccessful = false;
    }

    let twoMinutes = 2 * 60 * 1000;
    if (session[partner].partnerLatenessInMS > twoMinutes) {
      session[partner].partnerWasLate = true;
    }

    if (session[partner].partnerEarlinessInMS > 0) {
      session[partner].partnerWasEarly = true;
    }

    await SessionDataController.updateAttendanceScore(userId, partner);

    if (!session[partner].hasJoinedDuringSession) {
      // Partner never joined, cancel their next 3 sessions
      await SessionDataController.cancelNextThreeUserSessions(userId);
    }

    await session.save();

    // get all user sessions where partnerAttendanceSuccessful is true

    let user = null;
    if (session[partner].partnerAttendanceSuccessful) {
      // Update user sessions
      let userQuery = { _id: userId };
      let push = { $push: { completedSessions: session._id } };
      user = await UserModel.findOneAndUpdate(userQuery, push).exec();
    }

    let conclusion = {
      session,
    };
    if (user) {
      conclusion.user = user;
    }

    return session;
  },

  //   async awardBadges(userData) {},

  async cancelNextThreeUserSessions(userId) {
    console.log("Canceling next 3 sessions: ", userId);
  },

  async updateAttendanceScore(userId, partner) {
    let sessions = getLastTwentyUserSessions(userId);
    let successfulSessionsCount = 0;
    let thirtyMinInMS = 30 * 60 * 1000;

    sessions.forEach((session) => {
      if (session[partner].partnerTotalTimeInSessionInMS >= thirtyMinInMS) {
        successfulSessionsCount = successfulSessionsCount + 1;
      }
    });

    let user = await UserModel.findById(userId).exec();
    user.attendanceScore = Math.floor(
      (successfulSessionsCount / sessions.length) * 100
    );
    await user.save();
  },

  async updateLatenessScore(userData, sessionData) {},
};

module.exports = SessionDataController;
