const express = require("express");
const authService = require("../services/authService");
const router = express.Router();
const { uploadSingleFile } = require('../middlewares/uploadFileMiddleware');
const {
  addNewRecordedLecture,
  addNewAnnouncement,
  getMyClasses,
  getMyData,
  addMaterial,
  enrollStudentToRecordedLecture, // إضافة الدالة الجديدة
} = require("../services/teacherServices");
const {
  addNewRecordedLectureValidator,
  addNewAnnouncementValidator,
  addMaterialValidator
} = require("../utils/validators/teacherValidator");

router.use(authService.protect);
router.use(authService.allowedTo("teacher"));

router.route('/addNewRecordedLecture').post(addNewRecordedLectureValidator, addNewRecordedLecture);
router.route('/addNewAnnouncement').post(addNewAnnouncementValidator, addNewAnnouncement);
router.route('/addMaterial').post(uploadSingleFile, addMaterialValidator, addMaterial);
router.route('/getMyClasses').get(getMyClasses);
router.route('/getMyData').get(getMyData);

// إضافة مسار جديد للانضمام إلى المحاضرة
router.route('/enrollStudentToRecordedLecture/:lectureId').post(enrollStudentToRecordedLecture);

module.exports = router;
