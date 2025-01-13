const mongoose = require("mongoose");

const dbConnection = () => {
  mongoose.connect(process.env.DB_URL).then(() => {
    console.log("Connect to DB Successfully!");
  });
};

module.exports = dbConnection;
