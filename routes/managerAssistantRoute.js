const express = require("express");
const router = express.Router();
const authService = require("../services/authService");


const { generateSchedules } = require("../services/managerAssistantService");
const { generateSchedulesValidator } = require("../utils/validators/managerAssistantValidator");


router.use(authService.protect);
router.use(authService.allowedTo("manager assistant"));

router
  .route("/generateSchedules")
  .post(generateSchedulesValidator, generateSchedules);

module.exports = router;