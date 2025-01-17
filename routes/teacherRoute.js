const express = require("express");
const authService = require("../services/authService");
const router = express.Router();
const { uploadActivityFile } = require("../middlewares/uploadActivityMiddleware");
const { uploadMaterialFile } = require("../middlewares/uploadMaterialMiddleware");
const {
  addNewRecordedLecture,
  addNewAnnouncement,
  getMyClasses,
  getMyData,
  addMaterial,
  enrollStudentToRecordedLecture,
  createActivity,
  getSubmissionsForActivity,
} = require("../services/teacherServices");
const {
  addNewRecordedLectureValidator,
  addNewAnnouncementValidator,
  addMaterialValidator,
  createActivityValidator,
  enrollStudentToRecordedLectureValidator,
} = require("../utils/validators/teacherValidator");

router.use(authService.protect);
router.use(authService.allowedTo("teacher"));

router
  .route("/addNewRecordedLecture")
  .post(addNewRecordedLectureValidator, addNewRecordedLecture);
router
  .route("/addNewAnnouncement")
  .post(addNewAnnouncementValidator, addNewAnnouncement);
router
  .route("/addMaterial")
  .post(uploadMaterialFile, addMaterialValidator, addMaterial);
router.route("/getMyClasses").get(getMyClasses);
router.route("/getMyData").get(getMyData);
router
  .route("/enrollStudentToRecordedLecture/:lectureId")
  .post(
    enrollStudentToRecordedLectureValidator,
    enrollStudentToRecordedLecture
  );
router
  .route("/getSubmissionsForActivity/:activityId")
  .get(getSubmissionsForActivity);
router
  .route("/createActivity")
  .post(uploadActivityFile, createActivityValidator, createActivity);

module.exports = router;
