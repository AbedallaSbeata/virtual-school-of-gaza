const express = require("express");
const authService = require("../services/authService");
const router = express.Router();
const { uploadSubmissionFile } = require("../middlewares/uploadSubmissionMiddleware");
const { submitActivity, getMyData, getMyEnrolledClass } = require("../services/studentServices");
const {
  // submitActivityValidator
} = require("../utils/validators/studentValidator");

router.use(authService.protect);
router.use(authService.allowedTo("student"));

// تسليم النشاط
router
  .route("/submitActivity/:activityId")
  .post(uploadSubmissionFile, submitActivity);

router.route('/getMyData').get(getMyData)
router.route('/getMyEnrolledClass').get(getMyEnrolledClass)

module.exports = router;
