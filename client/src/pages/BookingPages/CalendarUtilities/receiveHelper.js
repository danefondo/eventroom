import {
  checkIfInArrayById,
  isUserEitherPartnerInSession,
} from "./compareHelpers";

/* ====== POST SOCKET BOOKING RECEIVE UPDATE CALENDAR ====== */

// THIS COVERS:
// 1. EMPTY OTHER PEOPLES SESSIONS
// 2. RECEIVER AFFECTED SESSIONS (LOST MATCH / REMATCHED)
// 3. UPDATE A PEOPLE SESSION (REMOVE FROM ONE, PUSH TO OTHER, e.g. they rematched or got rematched)

export const prepNewReceivedSessionsToPush = (dataFromReceive) => {
  let preppedData = {
    userSessionsToUpdate: [],
    peopleSessionsToUpdate: [],
    peopleSessionsToPush: [],
  };

  let sessions = dataFromReceive.sessions;
  let userId = dataFromReceive.userId;
  let calendarData = dataFromReceive.calendarData;

  console.log("@Receive1", sessions);

  // Filter out users sessions
  //   sessions.forEach((session, sessionIndex) => {
  //     console.log("@Receive2", session);
  //     if (isUserEitherPartnerInSession(session, userId)) {
  //       console.log("@Receive3", session);
  //       preppedData.userSessionsToUpdate.push(session);
  //       sessions.splice(sessionIndex, 1);
  //       console.log("@Receive4", sessions);
  //     }
  //   });

  // Sort people sessions for updating and pushing
  sessions.forEach((session) => {
    console.log("session", session);
    console.log("userId", userId);
    if (session.session) {
      session = session.session;
    }
    if (isUserEitherPartnerInSession(session, userId)) {
      console.log("@Receive3", session);
      preppedData.userSessionsToUpdate.push(session);

      //   sessions.splice(sessionIndex, 1);
      console.log("@Receive4", sessions);
      console.log("@Receive4", preppedData.userSessionsToUpdate);
    } else {
      calendarData.forEach((hourRow, hourRowIndex) => {
        hourRow.hourRowDays.forEach((slot, slotIndex) => {
          let sessionDateTime = new Date(session.dateTime);
          if (slot.dateTime.valueOf() == sessionDateTime.valueOf()) {
            let inArray = checkIfInArrayById(
              slot.peopleSessionsForSlot,
              session._id
            );
            if (inArray) {
              let updateObject = {
                session,
                indexes: [hourRowIndex, slotIndex],
              };
              preppedData.peopleSessionsToUpdate.push(updateObject);
            } else {
              preppedData.peopleSessionsToPush.push(session);
            }
          }
        });
      });
    }
  });
  console.log("preppedData", preppedData);
  return preppedData;
};

/* ====== POST SOCKET CANCEL RECEIVE UPDATE CALENDAR ====== */

// function oldVersion() {
//   sessions.forEach((session) => {
//     calendarData.forEach((hourRow, hourRowIndex) => {
//       hourRow.hourRowDays.forEach((slot, slotIndex) => {
//         let sessionDateTime = new Date(session.dateTime);
//         if (slot.dateTime.valueOf() == sessionDateTime.valueOf()) {
//           if (session.sessionThroughRematching) {
//             let rematchObject = setSessionsToUpdateFromRematching(
//               session,
//               slot,
//               userId
//             );
//             let newPersonSession = rematchObject.newPersonSession;
//             let rematchedSession = rematchObject.rematchedSession;
//             if (newPersonSession) {
//               preppedPeopleSessionsToPush.push(newPersonSession);
//             }

//             if (rematchedSession) {
//               preppedUserSessionsForUpdate.push(rematchedSession);
//             }
//           } else if (session.sessionThroughMatching) {
//             if (isUserEitherPartnerInSession(session, userId)) {
//               let sessionObject = setUserSessionsToUpdateFromMatching(
//                 session,
//                 userId
//               );
//               sessionObject.slot = slot;
//               sessionObject.indexes = [hourRowIndex, slotIndex];
//               preppedUserSessionsForUpdate.push(sessionObject);
//             } else {
//               // X initially unmatched gets matched with Y (not-user)
//               // purpose is to hide matched session for others
//               let sessionObject = setPeopleSessionsToUpdateFromMatching(
//                 session,
//                 userId
//               );
//               sessionObject.slot = slot;
//               sessionObject.indexes = [hourRowIndex, slotIndex];
//               preppedPeopleSessionsToUpdate.push(sessionObject);
//             }
//           } else {
//             let pushObject = setSessionsToPushFromReceiving(session, userId);

//             pushObject.slot = slot;
//             pushObject.indexes = [hourRowIndex, slotIndex];
//             preppedPeopleSessionsToPush.push(pushObject);
//           }
//         }
//       });
//     });
//   });
//   preppedData.preppedUserSessionsForUpdate = preppedUserSessionsForUpdate;
//   preppedData.preppedPeopleSessionsToPush = preppedPeopleSessionsToPush;
//   preppedData.preppedPeopleSessionsToUpdate = preppedPeopleSessionsToUpdate;
//   return preppedData;
// };

// function setPeopleSessionsToUpdateFromMatching(session, userId) {
//   if (session.firstPartnerId && session.secondPartnerId) {
//     let preppedSessionObject = {
//       session,
//       userId,
//       movePersonFromUnmatchedToMatched: true,
//       movePersonFromMatchedToUnmatched: false,
//       pushTo: "peopleMatchedSessionsForSlot",
//       removeFrom: "peopleUnmatchedSessionsForSlot",
//       updateIn: "peopleSessionsForSlot",
//     };

//     return preppedSessionObject;
//   }
// }

// function setSessionsToUpdateFromRematching(session, slot, userId) {
//   // compare old and new session

//   if (isUserEitherPartnerInSession(session, userId)) {
//     // if new session DOES have userId, then it means user's existing partner has been swapped out, here simply check which partner is user, and then set the other one as the one to be updated,
//   } else {
//     // if new session does not have userId, then rematch means user lost partner (and if user was rematched here, then there should be another session packed here session.userRematchedSession) and an update should be done immediately for that

//     if (session.userNewRematchedSession) {
//       // set new rematched session's other partner that is not user as new partner locally
//     } else {
//       // remove partner data from user's local session
//     }
//   }
//   console.log(slot);
//   return 0;
// }

// function setSessionsToPushFromReceiving(session, userId) {
//   // X person books session in empty slot --> just push to people
//   let pushObject = {
//     session,
//     slot,
//     arraysToPushTo: [
//       "peopleUnmatchedSessionsForSlot",
//       "peopleMatchedSessionsForSlot",
//     ],
//   };
//   // X person books session in empty slot --> just push to people

//   //   pushObject.moveFromMatchedToUnmatched = true;

//   pushObject.moveFromUnmatchedToMatched = true;
// }
