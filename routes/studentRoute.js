const express = require("express");
const authService = require("../services/authService");
const router = express.Router();
const {
  uploadSubmissionFile,
} = require("../middlewares/uploadSubmissionMiddleware");
const {
  submitActivity,
  getMyData,
  getMyEnrolledClass,
  getExamQuestions,
  submitExamAnswers,
  getStudentAnswersExam,
} = require("../services/studentServices");
const {
  submitExamAnswersValidator,
} = require("../utils/validators/studentValidator");

router.use(authService.protect);
router.use(authService.allowedTo("student"));

// تسليم النشاط
router
  .route("/submitActivity/:activityId")
  .post(uploadSubmissionFile, submitActivity);

router.route("/getMyData").get(getMyData);
router.route("/getMyEnrolledClass").get(getMyEnrolledClass);
router.route("/getExamQuestions/:examId").get(getExamQuestions);

// تسجيل إجابات الطالب
router
  .route("/submitExamAnswers/:examId")
  .post(submitExamAnswersValidator, submitExamAnswers);

router
  .route("/getStudentAnswersExam/:examId/:studentId")
  .get(getStudentAnswersExam);

module.exports = router;
