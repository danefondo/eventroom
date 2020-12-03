const { CalendarMatchController } = require("../database/REDIS/redis");

module.exports = function(CALENDAR_MATCH_NAMESPACE, socket) {

  socket.on("disconnect", (reason) => {
    console.log("a user disconnected from calendar match: ", reason);
  })
};