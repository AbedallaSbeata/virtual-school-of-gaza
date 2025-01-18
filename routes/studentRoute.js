const express = require("express");
const authService = require("../services/authService");
const router = express.Router();
const { uploadSubmissionFile } = require("../middlewares/uploadSubmissionMiddleware");
const { submitActivity } = require("../services/studentServices");
const {
  // submitActivityValidator
} = require("../utils/validators/studentValidator");

router.use(authService.protect);
router.use(authService.allowedTo("student"));

// تسليم النشاط
router
  .route("/submitActivity/:activityId")
  .post(uploadSubmissionFile, submitActivity);

module.exports = router;
