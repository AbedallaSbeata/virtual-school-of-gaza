const express = require("express");
const authService = require("../services/authService");
const router = express.Router();
const { uploadFields } = require("../middlewares/uploadImageMiddleware");

const {
  addLevel,
  addNewClass,
  deleteClass,
  addUser,
  getClasses,
  getClassesForSpecificLevel,
  getLevels,
  getSubjects,
  getTeachersFromSpecificSubject,
  disActiveUser,
  getSpecificStudent,
  getSpecificTeacher,
  getStudents,
  getTeachers,
  getMyData,
  deleteLevel,
  getSpecificClass,
  assignSpecificSubjectToTeachers,
  assignTeacherToClassSubject,
  addMaterial,
  getMaterials,
  deleteMaterials,
  addRecordedLecture,
  getRecordedLectures,
  deleteRecordedLectures,
  updateMaterial,
  updateRecordedLecture,
  getRecordedLectureById,
  addRecordedLectureComment,
  deleteRecordedLectureComment,
  getRecordedLectureComments,
  updateRecordedLectureComment,
  addReplyToComment,
  updateReply,
  deleteReply,
  getCommentReplies,
  getClassStudents,
  assignStudentsToSpecificClass,
  getLevelStudents,
  getTeacherAnnouncements,
  deleteAnnouncements,
  updateAnnouncement,
  getClassAnnouncements,
  addClassSubjectAnnouncement,
  addClassAnnouncement,
  getSchoolStudents,
  getSchoolStaff,
  addActivity,
  getActivitiesByClassSubject,
  updateActivity,
  deleteActivity,
  addGradeToSubmission,
  addSubmissionToActivity,
  deleteSubmission,
  getSubmissionsByActivity,
  updateSubmission, 
  updateSubmissionGradeOrFeedback
} = require("../services/managerService");
const {
  deleteClassValidator,
  addLevelValidator,
  addNewClassValidator,
  assignSpecificSubjectToTeachersValidator,
  addUserValidator,
  disActiveUserValidator,
} = require("../utils/validators/managerValidator");

router.use(authService.protect);
router.use(authService.allowedTo("manager"));
router.route("/addUser").post(uploadFields, addUserValidator, addUser);
router.route("/addNewLevel").post(addLevelValidator, addLevel);
router.route("/addNewClass").post(addNewClassValidator, addNewClass);
router.route("/levels").get(getLevels);
router.route("/classes").get(getClasses);
router
  .route("/getClassesInSpecificLevel/:level_number")
  .get(getClassesForSpecificLevel);
router
  .route("/assignSpecificSubjectToTeachers/:subjectID")
  .post(
    assignSpecificSubjectToTeachersValidator,
    assignSpecificSubjectToTeachers
  );
router
  .route("/assignTeacherToClassSubject/:classSubjectID")
  .post(assignTeacherToClassSubject);
router
  .route("/getTeachersFromSpecificSubject/:subjectID")
  .get(getTeachersFromSpecificSubject);
router.route("/subjects").get(getSubjects);
router.route("/disActiveUser").put(disActiveUserValidator, disActiveUser);
router.route("/deleteClass").delete(deleteClassValidator, deleteClass);
router.route("/deleteLevel").delete(deleteLevel);
router.route("/getSpecificStudent/:identity_number").get(getSpecificStudent);
router.route("/getSpecificTeacher/:identity_number").get(getSpecificTeacher);
router
  .route("/getSpecificClass/:level_number/:class_number")
  .get(getSpecificClass);
router.route("/students").get(getStudents);
router.route("/teachers").get(getTeachers);
router.route("/getMyData").get(getMyData);
router.route("/addMaterial").post(addMaterial);
router.route("/getMaterials/:classId").get(getMaterials);
router.route("/deleteMaterials").delete(deleteMaterials);
router.route("/addRecordedLecture").post(addRecordedLecture);
router.route("/getRecordedLectures/:classId").get(getRecordedLectures);
router.route("/deleteRecordedLectures").delete(deleteRecordedLectures);
router.route("/updateMaterial/:materialId").put(updateMaterial);
router
  .route("/updateRecordedLecture/:recordedLecturesId")
  .put(updateRecordedLecture);
router
  .route("/getRecordedLectureById/:recordedLectureId")
  .get(getRecordedLectureById);
router.route("/addRecordedLectureComment").post(addRecordedLectureComment);
router
  .route("/getRecordedLectureComments/:recorded_lecture_id")
  .get(getRecordedLectureComments);
router
  .route("/updateRecordedLectureComment/:comment_id")
  .put(updateRecordedLectureComment);
router
  .route("/deleteRecordedLectureComment")
  .delete(deleteRecordedLectureComment);
router.route("/addReplyToComment").post(addReplyToComment);
router.route("/getCommentReplies/:comment_id").get(getCommentReplies);
router.route("/updateReply/:reply_id").put(updateReply);
router.route("/deleteReply/:reply_id").delete(deleteReply);
router.route("/getClassStudents/:class_id").get(getClassStudents);
router
  .route("/assignStudentsToSpecificClass")
  .post(assignStudentsToSpecificClass);
router.route("/getLevelStudents/:level_number").get(getLevelStudents);
router.route("/getTeacherAnnouncements/:user_id").get(getTeacherAnnouncements);
router.route("/addClassAnnouncement").post(addClassAnnouncement);
router.route("/addClassSubjectAnnouncement").post(addClassSubjectAnnouncement);
router.route("/getClassAnnouncements/:class_id").get(getClassAnnouncements);
router.route("/updateAnnouncement/:announcement_id").put(updateAnnouncement);
router.route("/deleteAnnouncements").delete(deleteAnnouncements);
router.route('/getSchoolStudents').get(getSchoolStudents)
router.route('/getSchoolStaff').get(getSchoolStaff)
router.route("/addActivity").post(addActivity);
router.route('/getActivitiesByClassSubject/:classSubject_id').get(getActivitiesByClassSubject)
router.route("/updateActivity/:activity_id").put(updateActivity)
router.route("/deleteActivity/:activity_id").delete(deleteActivity);
router.route('/addSubmissionToActivity').post(addSubmissionToActivity)
router.route('/addGradeToSubmission/:submission_id').put(addGradeToSubmission)
router.route('/getSubmissionsByActivity/:activity_id').get(getSubmissionsByActivity)
router.route('/updateSubmission/:submission_id').put(updateSubmission)
router.route('/updateSubmissionGradeOrFeedback/:submission_id').put(updateSubmissionGradeOrFeedback)
router.route('/deleteSubmission/:submission_id').delete(deleteSubmission)


module.exports = router;
