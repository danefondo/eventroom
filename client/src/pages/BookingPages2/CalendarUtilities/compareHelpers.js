export const isEitherPartner = (firstPartnerId, secondPartnerId, userId) => {
  let firstPartnerCompare = firstPartnerId == userId;
  let secondPartnerCompare = secondPartnerId == userId;
  if (firstPartnerCompare || secondPartnerCompare) {
    return true;
  }
  return false;
};

export const isUserEitherPartnerInSession = (session, userId) => {
  let firstPartnerCompare = session.firstPartnerId == userId;
  let secondPartnerCompare = session.secondPartnerId == userId;
  if (firstPartnerCompare || secondPartnerCompare) {
    return true;
  }
  return false;
};


export const isUserPartnerStillSame = (oldSession, newSession) => {
  let partnerIsSame = false;
  // This cover lack of partner
  if (
    oldSession.firstPartnerId == newSession.firstPartnerId &&
    oldSession.secondPartnerId == newSession.secondPartnerId
  ) {
    partnerIsSame = true;
  }

  return partnerIsSame;
};

export const checkIfInArrayById = (sessionsArray, sessionId) => {
  let found = false;
  for (let i = 0; i < sessionsArray.length; i++) {
    if (sessionsArray[i]._id == sessionId) {
      found = true;
      break;
    }
  }
  return found;
};

export const checkIfInArray = (sessionsArray, session) => {
  let found = false;
  for (let i = 0; i < sessionsArray.length; i++) {
    if (sessionsArray[i]._id == session._id) {
      found = true;
      break;
    }
  }
  if (!found) {
    return false;
  }
  return true;
};

export const checkIfInArrayAndReturnIndex = (sessionsArray, session) => {
  let returnObject = {
    isFound: false,
    index: null,
  };
  for (let i = 0; i < sessionsArray.length; i++) {
    if (sessionsArray[i]._id == session._id) {
      returnObject.isFound = true;
      returnObject.index = i;
      break;
    }
  }
  return returnObject;
};

export const checkIfInArrayByIdAndReturnIndex = (sessionsArray, sessionId) => {
  let returnObject = {
    isFound: false,
    index: null,
  };
  for (let i = 0; i < sessionsArray.length; i++) {
    if (sessionsArray[i]._id == sessionId) {
      returnObject.isFound = true;
      returnObject.index = i;
      break;
    }
  }
  return returnObject;
};

// NB! Also checks already if in array
export const isSessionMatched = (session, slot) => {
  let isMatched = 2;
  let canBePushed = false;
  if (session.firstPartnerId && session.secondPartnerId) {
    isMatched = 0;
    let matchedPeople = slot.peopleMatchedSessions;
    let inMatchedPeopleArray = checkIfInArray(matchedPeople, session);
    if (!inMatchedPeopleArray) {
      canBePushed = true;
    }
  } else {
    isMatched = 1;
    let unmatchedPeople = slot.peopleUnmatchedSessions;
    let inUnmatchedPeopleArray = checkIfInArray(unmatchedPeople, session);
    if (!inUnmatchedPeopleArray) {
      canBePushed = true;
    }
  }
  if (!canBePushed) {
    isMatched = 2;
  }
  return isMatched;
};

export default {
  isEitherPartner,
  isUserEitherPartnerInSession,
  isUserPartnerStillSame,
  checkIfInArray,
  checkIfInArrayById,
  checkIfInArrayAndReturnIndex,
  checkIfInArrayByIdAndReturnIndex,
  isSessionMatched,
};
