const express = require("express");
const authService = require("../services/authService");
const router = express.Router();
const { uploadActivityFile } = require("../middlewares/uploadActivityMiddleware");
const { submitActivity } = require("../services/studentServices");
const {
  // submitActivityValidator
} = require("../utils/validators/studentValidator");

router.use(authService.protect);
router.use(authService.allowedTo("student"));

// تسليم النشاط
router
  .route("/submitActivity/:activityId")
  .post(uploadActivityFile, submitActivity);

module.exports = router;
