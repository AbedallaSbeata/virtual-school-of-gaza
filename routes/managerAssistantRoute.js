const express = require("express");
const router = express.Router();
const { generateSchedules } = require("../services/managerAssistantService");
const { generateSchedulesValidator } = require("../utils/validators/managerAssistantValidator");

router
  .route("/generateSchedules")
  .post(generateSchedulesValidator, generateSchedules);

module.exports = router;