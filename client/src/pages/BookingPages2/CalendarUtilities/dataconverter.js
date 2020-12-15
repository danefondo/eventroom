

export const upcomingSessionToVuex = function(upcomingSession) {
  return upcomingSession;
}

export const convertBookSession = function(session, user) {
  const returnSession = {
    // session data
    _id: session._id,
    eventroomId: session._id,
    dateTime: new Date(Number(session.datetime)),
    sessionInterval: 50,
    // user data
    firstPartnerId: user._id,
    firstPartnerUsername: user.username,
    firstPartnerProfileImageUrl: user.profileImageUrl,
  };
  return returnSession;
}

export const convertBooker = function(sessions, user) {
  console.log("user: ", user);
  let returnSessions = sessions;
  return returnSessions;
}