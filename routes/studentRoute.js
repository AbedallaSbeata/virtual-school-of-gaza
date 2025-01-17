const express = require("express");
const authService = require("../services/authService");
const router = express.Router();
const uploadSingleFile = require('../middlewares/uploadFileMiddleware')
const {
  submitActivity,
} = require("../services/studentServices");
const {
  submitActivityValidator,
} = require("../utils/validators/studentValidator");

router.use(authService.protect);
router.use(authService.allowedTo("student"));

// تسليم النشاط
router.route('/submitActivity/:activityId').post(uploadSingleFile, submitActivityValidator, submitActivity);


module.exports = router;