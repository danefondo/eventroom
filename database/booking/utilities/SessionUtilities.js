function setTotalTimeInSession(timestamps, session, partner) {
  let totalTimeInMS = 0;
  let sessionStartTimeInMS = new Date(session.dateTime).valueOf();
  let sessionIntervalInMS = session.sessionInterval * 60 * 1000;
  let sessionEndTimeInMS = sessionStartTimeInMS + sessionIntervalInMS;
  let maxTotalTimeInMS = session.sessionInterval * 60 * 1000;

  if (timestamps.length && timestamps.length == 1) {
    let stamp = timestamps[0];
    if (stamp.type == "join") {
      let stampTimeInMS = new Date(stamp.timestamp).valueOf();
      if (
        stampTimeInMS >= sessionStartTimeInMS &&
        stampTimeInMS <= sessionEndTimeInMS
      ) {
        totalTimeInMS = maxTotalTimeInMS - stampTimeInMS;
      } else if (stampTimeInMS <= sessionStartTimeInMS) {
        totalTimeInMS = maxTotalTimeInMS;
      }
    }
  } else if (timestamps.length && timestamps.length > 1) {
    // 1. Sort all by date
    timestamps = sortTimestamps(timestamps);

    let joinLeavePairs = [];
    let joinStampInMS = null;
    let leaveStampInMS = null;
    timestamps.forEach((stamp, stampIndex) => {
      // if two joins or leaves in a row, just re-write previous
      if (stamp.type == "join") {
        joinStampInMS = new Date(stamp.timestamp).valueOf();
        // If last join has no pair, set end of session as leave time
        if (stampIndex === timestamps.length - 1) {
          leaveStampInMS = sessionEndTimeInMS;
        }
      } else if (stamp.type == "leave") {
        leaveStampInMS = new Date(stamp.timestamp).valueOf();
      }

      if (joinStampInMS && leaveStampInMS && joinStampInMS <= leaveStampInMS) {
        let pairComplete = {
          joinStampInMS,
          leaveStampInMS,
          timeBetweenInMS: leaveStampInMS - joinStampInMS,
        };
        joinLeavePairs.push(pairComplete);
        joinStampInMS = null;
        leaveStampInMS = null;
      }
    });

    joinLeavePairs.forEach((eachPair) => {
      totalTimeInMS = totalTimeInMS + eachPair.timeBetweenInMS;
    });

    // Prevent total time being bigger than session total time
    if (totalTimeInMS > maxTotalTimeInMS) {
      totalTimeInMS = maxTotalTimeInMS;
    }

    // Something went haywire...
    if (totalTimeInMS < 0) {
      totalTimeInMS = 0;
    }
  }

  session[partner].partnerTotalTimeInSessionInMS = totalTimeInMS;
  return session;
}

// if partner does not show up, && existing person leaves, handle

// if no partner, handle leave through socket

function setPartnerJoinedDuringSession(timestamps, session, partner) {
  let sessionStartTimeInMS = new Date(session.dateTime).valueOf();
  let sessionIntervalInMS = session.sessionInterval * 60 * 1000;
  let sessionEndTimeInMS = sessionStartTimeInMS + sessionIntervalInMS;

  let joinedDuringSession = false;
  // find one timestamp that is equal to or more than session start time
  // AND equal to or less than session end time
  for (var i = 0; i < timestamps.length; i++) {
    let stamp = timestamps[i];
    let stampInMS = new Date(stamp.timestamp).valueOf();
    if (stampInMS >= sessionStartTimeInMS && stampInMS <= sessionEndTimeInMS) {
      joinedDuringSession = true;
      break;
    }
  }
  session[partner].setPartnerJoinedDuringSession = joinedDuringSession;

  return session;
}

function setPartnerJoinedOnce(timestamps, session, partner) {
  // Check if participant ever joined (e.g. between 10min to start time and end time)
  if (timestamps.length) {
    // If user joined, set as true
    session[partner].partnerJoinedOnce = true;
  } else {
    session[partner].partnerJoinedOnce = false;
  }
  return session;
}

function setPartnerLateness(timestamps, session, partner) {
  let sessionStartTimeInMS = new Date(session.dateTime).valueOf();
  let tenMinToStartTimeInMS = sessionStartTimeInMS - 10 * 60 * 1000;
  let sessionIntervalInMS = session.sessionInterval * 60 * 1000;
  let sessionEndTimeInMS = sessionStartTimeInMS + sessionIntervalInMS;
  let sessionEndTimeInMSBuffer = sessionEndTimeInMS + 10 * 1000; // 10 sec buffer
  timestamps = sortTimestamps(timestamps);

  let latenessInMS = 0;
  let lateJoinStamp = null;
  let earlyJoinStamp = null;
  for (var i = 0; i < timestamps.length; i++) {
    let stamp = timestamps[i];
    let timestampInMS = new Date(stamp.timestamp).valueOf();
    let stampType = stamp.type;

    if (!earlyJoinStamp) {
      if (
        timestampInMS <= sessionStartTimeInMS &&
        timestampInMS >= tenMinToStartTimeInMS &&
        stampType == "join"
      ) {
        earlyJoinStamp = timestampInMS;
      }
    }

    if (
      timestampInMS <= sessionStartTimeInMS &&
      timestampInMS >= tenMinToStartTimeInMS &&
      stampType == "leave"
    ) {
      earlyJoinStamp = null;
    }

    if (
      timestampInMS > sessionStartTimeInMS &&
      timestampInMS <= sessionEndTimeInMSBuffer &&
      earlyJoinStamp == null &&
      stampType == "join"
    ) {
      lateJoinStamp = timestampInMS;
    }
  }

  if (lateJoinStamp !== null) {
    latenessInMS = lateJoinStamp - sessionStartTimeInMS;
  }

  session[partner].partnerLatenessInMS = latenessInMS;
  return session;
}

function setPartnerEarliness(timestamps, session, partner) {
  let sessionStartTimeInMS = new Date(session.dateTime).valueOf();
  let tenMinToStartTimeInMS = sessionStartTimeInMS - 10 * 60 * 1000;

  // if there is a leave later than join that is before session start, null join
  // then look for next join
  timestamps = sortTimestamps(timestamps);

  let earlinessInMS = 0;
  let earlyJoinStamp = null;
  let earlyLeaveStamp = null;
  for (var i = 0; i < timestamps.length; i++) {
    let stamp = timestamps[i];
    let timestampInMS = new Date(stamp.timestamp).valueOf();
    let stampType = stamp.type;

    if (!earlyJoinStamp) {
      if (
        timestampInMS <= sessionStartTimeInMS &&
        timestampInMS >= tenMinToStartTimeInMS &&
        stampType == "join"
      ) {
        earlyJoinStamp = timestampInMS;
      }
    }

    if (
      timestampInMS <= sessionStartTimeInMS &&
      timestampInMS >= tenMinToStartTimeInMS &&
      stampType == "leave"
    ) {
      earlyLeaveStamp = timestampInMS;
      earlyJoinStamp = null;
    }
  }

  if (earlyJoinStamp !== null) {
    earlinessInMS = earlyJoinStamp;
  }

  session[partner].partnerEarlinessInMS = earlinessInMS;
  return session;
}

function sortTimestamps(timestamps) {
  let sorted = timestamps.sort((a, b) => {
    return new Date(a.timestamp) - new Date(b.timestamp);
  });
  return sorted;
}

function setSessionToFinished(session) {
  let sessionStartTimeInMS = new Date(session.dateTime).valueOf();
  let sessionIntervalInMS = session.sessionInterval * 60 * 1000;
  let sessionEndTimeInMS = sessionStartTimeInMS + sessionIntervalInMS;

  if (Date.now() >= sessionEndTimeInMS) {
    session.sessionHasStarted = true;
    session.sessionHasFinished = true;
  }
  return session;
}

module.exports = {
  setTotalTimeInSession,
  setPartnerJoinedDuringSession,
  setPartnerJoinedOnce,
  setPartnerLateness,
  setPartnerEarliness,
  sortTimestamps,
  setSessionToFinished,
};
