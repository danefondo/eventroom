/* USED */
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

  // Iterate starting from the end;
  for (var i = sessionsArray.length - 1; i > -1; i--) {
    let eachSession = sessionsArray[i];
    firstMatchCompare = eachSession.firstPartnerId == userId;
    secondMatchCompare = eachSession.secondPartnerId == userId;
    if (firstMatchCompare || secondMatchCompare) {
      console.log("found session with own id, removing from array");
      sessionsArray.splice(i, 1);
    }
  }

  // Prepare data to display on client side
  // for which slot of booked sessions
  // already has been booked for that time

  //   let alreadyMatchedForTimeSession = {
  //     sessionTime: eachSession.dateTime,
  //     sessionId: eachSession._id,
  //   };
  //   alreadyMatchedForTime.push(alreadyMatchedForTimeSession);

  //   console.log("array after processing", sessionsArray);

  return sessionsArray;
}

/* USED */
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
  sessionToMatch,
  availableSessions
) {
  let bestPreferenceMatch = null;
  if (preferences && !preferredUserSession && !sessionToMatch) {
    console.log("skip for now", availableSessions);
    // e.g. must have X amount of sessions
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

// Iterate over all sessions and see if
// any match slot time
/* USED */
function filterAvailableSessionsForSlot(availableSessions, slot) {
  let filteredAvailableSessions = [];
  availableSessions.forEach((session) => {
    let sessionDateTime = new Date(session.dateTime);
    let slotDateTime = new Date(slot.dateTime);
    if (sessionDateTime.valueOf() == slotDateTime.valueOf()) {
      filteredAvailableSessions.push(session);
    }
  });
  return filteredAvailableSessions;
}

// PAIR UP BOTH
// Assign a match from available sessions
// This is a filter function essentially dividing slot data into two arrays
function findMatchesForAllPossibleSlots(availableSessions, slotsToBookArray) {
  // Array of objects which contain booked slot data and available session
  let slotsWithFoundMatches = [];

  // Array of booked slots with no matches
  let slotsWithNoFoundMatches = [];

  // Sort through slots and match them against available sessions, pair up any matches
  slotsToBookArray.forEach(function (slot) {
    let sessionToMatch = null;

    /*
      Because current slots contain many times
      and all available sessions also contain 
      many times for the many slots, it is
      necessary to find, per slot, the available
      sessions specifically matching each slot
      */
    let filteredAvailableSessions = filterAvailableSessionsForSlot(
      availableSessions,
      slot
    );

    if (filteredAvailableSessions && filteredAvailableSessions.length) {
      /* ===== CHECK IF MATCH PREFERENCE AVAILABLE ===== */
      let desiredUserId = slot.specificUserPreferenceId;
      let preferredUserSession = checkIfMatchPreferenceAvailable(
        desiredUserId,
        sessionToMatch,
        filteredAvailableSessions
      );

      /* ===== IF PREFERRED MATCH AVAILABLE, SET TO MATCH ===== */
      if (preferredUserSession) {
        sessionToMatch = preferredUserSession;
      }

      /* ===== IF NO MATCH && IF PREFERENCES CHECK FOR BEST AVAILABLE MATCH ===== */
      let preferences = slot.generalPreferences;
      let bestAvailableMatchByPreferences = getBestAvailableMatchByPreferences(
        preferences,
        preferredUserSession,
        sessionToMatch,
        filteredAvailableSessions
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
        filteredAvailableSessions
      );

      /* ===== IF RANDOM BEST MATCH FOUND, SET TO MATCH ===== */
      if (randomBestMatch) {
        sessionToMatch = randomBestMatch;
      }

      if (sessionToMatch) {
        let matchedPair = {
          sessionToMatch: sessionToMatch,
          slotMatched: slot,
        };
        slotsWithFoundMatches.push(matchedPair);
      } else {
        slotsWithNoFoundMatches.push(slot);
      }
    } else {
      /* ===== IF NO FILTERED AVAILABLE SESSIONS, CANCEL FURTHER CHECKS AND PUSH SLOT TO NOT FOUND MATCHES ===== */
      slotsWithNoFoundMatches.push(slot);
    }
  });

  let processedSlots = {
    slotsWithFoundMatches: slotsWithFoundMatches,
    slotsWithNoFoundMatches: slotsWithNoFoundMatches,
  };

  return processedSlots;
}

function getNextSession(userBookedSessions) {
  // Get earliest date from array
  let nextSession = null;

  if (userBookedSessions.length) {
    let bookedSessions = [];
    let bookedSessionTimes = [];
    let nextSessionRef = null;
    userBookedSessions.forEach((session) => {
      let sessionTimeInNum = new Date(session.dateTime).valueOf();
      let sessionData = {
        sessionTimeInNum: sessionTimeInNum,
        sessionId: session._id,
      };
      bookedSessions.push(sessionData);
      bookedSessionTimes.push(sessionTimeInNum);
    });

    let earliestSessionTimeInNum = Math.min(...bookedSessionTimes);
    nextSessionRef = bookedSessions.find(
      (s) => s.sessionTimeInNum.valueOf() === earliestSessionTimeInNum
    );

    nextSession = userBookedSessions.find(
      (s) => s._id === nextSessionRef.sessionId
    );
  }

  return nextSession;
}

function checkIfBookRequestInPast(toBookTime) {
  let hasTimePassed = false;
  let toBookTimeInMS = new Date(toBookTime).valueOf();
  if (toBookTimeInMS < Date.now()) {
    hasTimePassed = true;
  }
  return hasTimePassed;
}

function checkIfDateInArrayOverlaps(datesArray, date) {
  const FIFTEEN_MINUTES = 15 * 60 * 1000; // milliseconds
  let overlaps = false;
  for (let i = 0; i < datesArray.length; i++) {
    arrayDateInMS = new Date("" + datesArray[i]).valueOf();
    dateInMS = new Date("" + date).valueOf();

    const fifteenBefore = arrayDateInMS - FIFTEEN_MINUTES;
    const thirtyBefore = arrayDateInMS - FIFTEEN_MINUTES * 2;
    const fortyFiveBefore = arrayDateInMS - FIFTEEN_MINUTES * 3;

    const fifteenAfter = arrayDateInMS + FIFTEEN_MINUTES;
    const thirtyAfter = arrayDateInMS + FIFTEEN_MINUTES * 2;
    const fortyFiveAfter = arrayDateInMS + FIFTEEN_MINUTES * 3;

    if (
      dateInMS == fifteenBefore ||
      dateInMS == thirtyBefore ||
      dateInMS == fortyFiveBefore ||
      dateInMS == fifteenAfter ||
      dateInMS == thirtyAfter ||
      dateInMS == fortyFiveAfter ||
      dateInMS == arrayDateInMS
    ) {
      overlaps = true;
      break;
    }
  }
  if (!overlaps) {
    return false;
  }
  return true;
}

function removePastDates(datesToUpdate, nowInMS) {
  for (var i = datesToUpdate.length - 1; i > -1; i--) {
    let dateToUpdate = datesToUpdate[i];
    let dateToUpdateInMS = new Date(dateToUpdate.dateTime).valueOf();
    if (dateToUpdateInMS < nowInMS) {
      datesToUpdate.splice(i, 1);
    }
  }
  return datesToUpdate;
}

function removePastDatesFromArray(datesToUpdate, nowInMS) {
  for (var i = datesToUpdate.length - 1; i > -1; i--) {
    let dateToUpdate = datesToUpdate[i];
    let dateToUpdateInMS = new Date(dateToUpdate).valueOf();
    if (dateToUpdateInMS < nowInMS) {
      datesToUpdate.splice(i, 1);
    }
  }
  return datesToUpdate;
}

function removeOverlappingDates(userDates, datesToUpdate) {
  const FORTY_FIVE_MINUTES = 45 * 60 * 1000; // milliseconds
  const newDatesToUpdate = [...datesToUpdate];
  let deletedElementsCount = 0;
  datesToUpdate.forEach((toUpdate, index) => {
    userDates.forEach((date) => {
      let dateInMS = new Date(date).valueOf();
      const fortyFiveBefore = dateInMS - FORTY_FIVE_MINUTES;
      const fortyFiveAfter = dateInMS + FORTY_FIVE_MINUTES;
      let toUpdateInMS = new Date(toUpdate.dateTime).valueOf();
      if (toUpdateInMS >= fortyFiveBefore && toUpdateInMS <= fortyFiveAfter) {
        const newIndex = index - deletedElementsCount;
        newDatesToUpdate.splice(newIndex, 1);
        deletedElementsCount = deletedElementsCount + 1;
      }
    });
  });

  return newDatesToUpdate;
}

function removeOverlappingDatesFromArray(dates, datesToUpdate) {
  console.log("REMOVE OVERLAPS 9: userDates", dates);
  console.log("REMOVE OVERLAPS 10: datesToUpdate", datesToUpdate);
  const FORTY_FIVE_MINUTES = 45 * 60 * 1000; // milliseconds
  dates.forEach((date) => {
    let dateInMS = new Date("" + date).valueOf();
    const fortyFiveBefore = dateInMS - FORTY_FIVE_MINUTES;
    const fortyFiveAfter = dateInMS + FORTY_FIVE_MINUTES;

    // Iterate starting from the end;
    for (var i = datesToUpdate.length - 1; i > -1; i--) {
      let dateToUpdate = datesToUpdate[i];
      let dateToUpdateInMS = new Date(dateToUpdate).valueOf();
      if (
        dateToUpdateInMS >= fortyFiveBefore &&
        dateToUpdateInMS <= fortyFiveAfter
      ) {
        datesToUpdate.splice(i, 1);
      }
    }
  });
  console.log("REMOVE OVERLAPS 11: AFTER SPLICE", datesToUpdate);
  return datesToUpdate;
}

module.exports = {
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

  removePastDates,
  removePastDatesFromArray,
};
