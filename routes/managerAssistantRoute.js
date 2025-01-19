const express = require("express");
const router = express.Router();
const authService = require("../services/authService");

const { createSchedule } = require("../services/managerAssistantService");
const { createScheduleValidator } = require("../utils/validators/managerAssistantValidator");

router.use(authService.protect);
router.use(authService.allowedTo("manager assistant"));

router
  .route("/createSchedule")
  .post(createScheduleValidator, createSchedule);

module.exports = router;