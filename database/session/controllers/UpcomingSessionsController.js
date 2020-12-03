
const printError = function(message, error) {
  console.log("Error at UpcomingSessionsController: ", message, error);
}

module.exports = async function(UpcomingSessions) {
  let module = {};

  module.addSession = async function(session) {
    try {
      await UpcomingSessions.insertOne(session);
      session.success = true;
      return session;
    } catch (error) {
      printError("at addSession: ", error);
      
    }
  }

  module.removeSession = async function(session) {
    
  }


  return module;
}
