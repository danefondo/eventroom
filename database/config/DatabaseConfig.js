const Dotenv = require('dotenv');
Dotenv.config();

module.exports = {
  DB_URI: process.env.DB_URI,
  SECRET: process.env.SECRET,
  PORT: process.env.PORT,
  DB_NAME: "oveno-production"
};