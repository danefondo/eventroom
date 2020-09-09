/* ====== IMPORT MODULES ====== */

const Express = require("express");
const Mongoose = require("mongoose");
const BodyParser = require("body-parser");
const CookieParser = require("cookie-parser");
const Path = require("path");
const Enforce = require("express-sslify");
const Passport = require("passport");
const DatabaseConfig = require("./config/DatabaseConfig");
const Cors = require("cors");

const initialiseAuthentication = require('./auth/index').initialiseAuthentication;
/* ====== DATABASE SETUP ====== */

/* 
//- Mongoose test database setup
var TEST_DB_URI = 'mongodb://127.0.0.1/test-db';
Mongoose.connect(TEST_DB_URI, { useNewUrlParser: true });
*/

//- Mongoose production database setup
Mongoose.connect(DatabaseConfig.DB_URI, {useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true});
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

//- Prepare HTTP server for Socket.io
let HTTP = require("http").createServer(app);
let IO = require("socket.io")(HTTP);

//- Use MomentJS
app.locals.moment = require("moment");

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

/* ====== SOCKET.IO SETUP ====== */

IO.on("connection", function (socket) {
  console.log('this user is connected')
  // io.emit('test', 'lsdkfja');
  // socket.broadcast.emit("message", "whadaaaaap");
  // socket.on('message', function(msg){
  //   io.emit('message', msg);
  // });
  socket.on("joinRoom", function(data) {
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
    socket.broadcast.to(data.room_id).emit("updateStuff", freshBakedFromDatabase);
  });

  // socket.on("ended", function (data) {
  //   console.log("yo made ended");
  //   socket.broadcast.emit("endedVideo", "end");
  // });
});


/* ====== ROUTES SETUP ====== */
const AccountRoutes = require("./routes/API/AccountRoutes");
const EventRoutes = require("./routes/API/EventRoutes");
app.use("/api/accounts", AccountRoutes);
app.use("/api/events", EventRoutes);


/* ====== REQUESTS HANDLING ====== */


app.get("*", function (req, res) {
  res.sendFile(Path.join(__dirname, "client/dist/index.html"));
});


/* ====== SERVER SETUP ====== */

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

/* ====== START SETUP ====== */
HTTP.listen(port, function () {
  console.log("Server started on port " + port);
});

