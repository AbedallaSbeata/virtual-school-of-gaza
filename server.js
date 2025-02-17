const express = require("express");
const server = express();
const ApiError = require("./utils/apiError");
const globalError = require("./middlewares/errorMiddleware");
const dotenv = require("dotenv");
dotenv.config();
const dbConnection = require("./config/database");
const PORT = process.env.PORT || 8000;
const authRoute = require("./routes/authRoute");
const managerRoute = require("./routes/managerRoute");
const managerAssistantRoute = require('./routes/managerAssistantRoute')
const teacherRoute = require('./routes/teacherRoute')
const studentRoute = require('./routes/studentRoute')
const cookieParser = require("cookie-parser");

const cors = require("cors");
const path = require('path')


dbConnection();

server.use(express.json());
server.use('/uploads', express.static(path.join(__dirname, 'uploads')));


server.use(cors({
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
server.use(cookieParser());


server.use("/auth", authRoute);
server.use("/manager", managerRoute);
server.use("/managerAssistant", managerAssistantRoute);
server.use("/teacher", teacherRoute);
server.use("/student", studentRoute);

server.all("*", (req, res, next) => {d
  next(new ApiError(`can't find this route: ${req.originalUrl}`, 400));
});

server.use(globalError);

const app = server.listen(PORT, () => {
  console.log(`Server Running on Port ${PORT}`);
});

process.on("unhandledRejection", (error) => {
  console.log(`unhandledRejection Errors: ${error.name} | ${error.message}`);
  app.close(() => {
    console.log("Shutting down..");
    process.exit(1);
  });
});
