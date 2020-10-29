/* ====== IMPORT MODULES ====== */

const SessionModel = require("./database/booking/models/SessionModel");

const Express = require("express");
const Mongoose = require("mongoose");
const BodyParser = require("body-parser");
const CookieParser = require("cookie-parser");
const Path = require("path");
const Enforce = require("express-sslify");
const Passport = require("passport");
const DatabaseConfig = require("./database/config/DatabaseConfig");
const Cors = require("cors");
const initialiseAuthentication = require("./server/auth/configs/index")
  .initialiseAuthentication;
/* ====== DATABASE SETUP ====== */

/* 
//- Mongoose test database setup
var TEST_DB_URI = 'mongodb://127.0.0.1/test-db';
Mongoose.connect(TEST_DB_URI, { useNewUrlParser: true });
*/

//- Mongoose production database setup
Mongoose.connect(DatabaseConfig.DB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
});
Mongoose.set("useFindAndModify", false);

//- Get default Mongoose connection
let DB = Mongoose.connection;

//- Log Mongoose connection upon connected
DB.once("open", function () {
  console.log("Connected to MongoDB.");
});

//- Log Mongoose errors
DB.on("error", function (err) {
  console.log("Mongoose error: ", err);
});

/* ====== APP SETUP ====== */

const app = Express();

//- Force all routes to HTTPS
if (process.env.NODE_ENV === "production") {
  app.use(Enforce.HTTPS({ trustProtoHeader: true }));
}

//- Body parser middleware
app.use(BodyParser.urlencoded({ extended: false }));
app.use(BodyParser.json());

//. Cookie parser middleware
app.use(CookieParser());

//- note:: to be removed
app.use(Cors({ origin: "http://localhost:8080", credentials: true }));

//- Set public folder
app.use(Express.static(Path.join(__dirname, "client/dist/")));

/* ====== AUTHENTICATION SETUP ====== */

//- Passport config
//require("./config/PassportConfig")(Passport);

//- Passport middleware
app.use(Passport.initialize());
initialiseAuthentication(app);

let twilio = require("twilio")(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

/* ====== ROUTES SETUP ====== */
const AccountRoutes = require("./routes/API/AccountRoutes");
const AccountSettings = require("./routes/API/AccountSettingsRoutes");
const ProfileRoutes = require("./routes/API/ProfileRoutes");
const EventRoutes = require("./routes/API/EventRoutes");
const UserActionRoutes = require("./routes/API/UserActionRoutes");
const EventroomRoutes = require("./routes/API/EventroomRoutes");
const BookingRoutes = require("./routes/API/BookingRoutes");
app.use("/api/accounts", AccountRoutes);
app.use("/api/settings", AccountSettings);
app.use("/api/profiles", ProfileRoutes);
app.use("/api/events", EventRoutes);
app.use("/api/userActions", UserActionRoutes);
app.use("/api/eventroom", EventroomRoutes);
app.use("/api/booking", BookingRoutes);

/* ====== REQUESTS HANDLING ====== */

app.get("*", function (req, res) {
  res.sendFile(Path.join(__dirname, "client/dist/index.html"));
});

// SessionModel.deleteMany({}).exec();



/* ====== SERVER SETUP ====== */

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

/* ====== START SERVER SETUP ====== */
let server = app.listen(port, function () {
  console.log("Server started on port " + port);
});





/* ====== SOCKET.IO SETUP ====== */
var io = require('socket.io').listen(server);


/* ====== SOCKET.IO FUNCTIONS ====== */

io.on("connection", function (socket) {
  console.log("this user is connected");
  // io.emit('test', 'lsdkfja');
  // socket.broadcast.emit("message", "whadaaaaap");
  // socket.on('message', function(msg){
  //   io.emit('message', msg);
  // });
  socket.on("joinRoom", function (data) {
    console.log("roomId: ", data.roomId);
    socket.join(data.roomId);
  });

  // socket.on("message", function (data) {
  //   console.log('news data', data);
  //   var message = data + " world";
  //   io.emit("test", message);
  // });

  socket.on("play", function (data) {
    console.log("yo made here", data);
    socket.broadcast.to(data.room_id).emit("playVideo", data);
  });

  socket.on("pause", function (data) {
    console.log("yo made pause");
    socket.broadcast.to(data.room_id).emit("pauseVideo", "pause");
  });

  socket.on("reset", function (data) {
    console.log("yo made reset");
    socket.broadcast.to(data.room_id).emit("resetVideo", "reset");
  });

  socket.on("setTime", function (data) {
    console.log("yo made time", data);
    socket.broadcast.to(data.room_id).emit("setVideoTime", data);
  });

  // socket.on("buffering", function (data) {
  //   console.log("yo made buffer");
  //   socket.broadcast.emit("bufferingVideo", "buffer");
  // });

  socket.on("updateUrl", function (data) {
    console.log("yo made updatevid");
    socket.broadcast.to(data.room_id).emit("reloadVideo", "reload");
  });

  socket.on("emitTag", function (data) {
    console.log("data from vonage");
    //- Update data in database and when done, emit signal back to session
    let freshBakedFromDatabase;
    socket.broadcast
      .to(data.room_id)
      .emit("updateStuff", freshBakedFromDatabase);
  });

  // socket.on("ended", function (data) {
  //   console.log("yo made ended");
  //   socket.broadcast.emit("endedVideo", "end");
  // });

  // When a client tries to join a room, only allow them if they are first or
  // second in the room. Otherwise it is full.
  socket.on("join", function (room) {
    console.log("A client joined");
    var clients = io.sockets.adapter.rooms[room];
    var numClients = typeof clients !== "undefined" ? clients.length : 0;
    if (numClients == 0) {
      socket.join(room);
    } else if (numClients == 1) {
      socket.join(room);
      // When the client is second to join the room, both clients are ready.
      console.log("Broadcasting ready message");
      socket.emit("ready", room);
      socket.broadcast.emit("ready", room);
    } else {
      socket.emit("full", room);
    }
  });

  // Relay candidate messages
  socket.on("peerJoin", function () {
    console.log("Received candidate. Broadcasting...");
    let peer = "peer";
    socket.broadcast.emit("peerJoined", peer);
  });

  // When receiving the token message, use the Twilio REST API to request an
  // token to get ephemeral credentials to use the TURN server.
  socket.on("token", function () {
    console.log("Received token request");
    twilio.tokens.create(function (err, response) {
      if (err) {
        console.log(err);
      } else {
        // Return the token to the browser.
        console.log("Token generated. Returning it to the client");
        socket.emit("token", response);
      }
    });
  });

  socket.on("tokenAgain", function () {
    console.log("Received token request");
    twilio.tokens.create(function (err, response) {
      if (err) {
        console.log(err);
      } else {
        // Return the token to the browser.
        console.log("Token generated. Returning it to the client");
        socket.emit("tokenAgain", response);
      }
    });
  });

  // Relay candidate messages
  socket.on("candidate", function (candidate) {
    console.log("Received candidate. Broadcasting...");
    socket.broadcast.emit("candidate", candidate);
  });

  // Relay offers
  socket.on("offer", function (offer) {
    console.log("Received offer. Broadcasting...");
    socket.broadcast.emit("offer", offer);
  });

  // Relay answers
  socket.on("answer", function (answer) {
    console.log("Received answer. Broadcasting...");
    socket.broadcast.emit("answer", answer);
  });

  // Relay answers
  socket.on("newEventroomName", function (eventroomName) {
    console.log("Received new Eventroom name. Broadcasting...");
    socket.broadcast.emit("eventroomNameChange", eventroomName);
  });

  socket.on("joinChat", function (data) {
    let eventroomId = data.eventroomId;
    if (!eventroomId) {
      let response = "EventroomId missing, cannot join chat.";
      return socket.emit("joinChatFail", response);
    }

    socket.join(eventroomId);
    console.log("User joined Eventroom with id: ", eventroomId);
    io.to(eventroomId).emit("userJoinedChat", data);
  });

  socket.on("sendChatMessage", function (data) {
    if (!data || !data.eventroomId || !data.userId) {
      let response = "Message data missing";
      return socket.emit("messageSendFailed", response);
    }
    console.log("User sent message", data);
    // io.in(data.eventroomId).emit("messageReceived", data);
    socket.to(data.eventroomId).emit("messageReceived", data);
    // io.removeAllListeners();
  });

  socket.on("leaveChat", function (eventroomId) {
    // socket.removeAllListeners(true);
    // socket.disconnect();
    // io.removeAllListeners();
    // socket.removeListener(eventroomId);
    // socket.leave(eventroomId);

    console.log("LEAVING THE FUCKING CHAT", eventroomId);

    io.of("/").adapter.clients((err, clients) => {
      console.log(clients); // an array containing all connected socket ids
    });
    // socket.removeAllListeners();

    // socket.removeAllListeners(eventroomId);
    socket.leave(eventroomId);

    // socket.disconnect();

    // socket.leave(roomId, () => {
    //   io.to('room 237').emit(`user ${socket.id} has left the room`);
    // });
  });

  // socket.on("disconnect", function () {
  //   socket.removeAllListeners();
  // });

  /** COFOCUS */
  socket.on("joinCofocusCalendar", function (data) {
    console.log("User joined room type: ", data);
    socket.join(data);
  });

  socket.on("pushSessionsToOthers", function (data) {
    if (!data || ! data.userId || !data.roomType || !data.sessions) {
      // let response = "Session data missing";
      return;
      // return socket.emit("messageSendFailed", response);
    }
    // console.log("Session:", data.session);
    socket.to(data.roomType).emit("receivePushedSessions", data.sessions);
    // io.removeAllListeners();
  });

  socket.on("pushCanceledSessionsToOthers", function(data) {
    if (!data || ! data.userId || !data.roomType || !data.sessions) {
      // let response = "Session data missing";
      return;
      // return socket.emit("messageSendFailed", response);
    }
    socket.to(data.roomType).emit("receiveCanceledSessions", data.sessions);

  })
});
