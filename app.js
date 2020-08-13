/* ====== IMPORT MODULES ====== */

const Express = require("express");
const Mongoose = require("mongoose");
const BodyParser = require("body-parser");
const Path = require("path");
const Enforce = require("express-sslify");
const Passport = require("passport");
const DatabaseConfig = require("./config/DatabaseConfig");
const Cors = require("cors");

/* ====== DATABASE SETUP ====== */

/* 
//- Mongoose test database setup
var TEST_DB_URI = 'mongodb://127.0.0.1/test-db';
Mongoose.connect(TEST_DB_URI, { useNewUrlParser: true });
*/

//- Mongoose production database setup
Mongoose.connect(DatabaseConfig.DB_URI);
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

//- note:: to be removed
app.use(Cors({ origin: "http://localhost:8080" }));

//- Set public folder
app.use(Express.static(Path.join(__dirname, "client/dist/")));

/* ====== AUTHENTICATION SETUP ====== */

//- Passport config
require("./config/PassportConfig")(Passport);

//- Passport middleware
app.use(Passport.initialize());


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
