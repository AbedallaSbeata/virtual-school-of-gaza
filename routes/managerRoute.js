const express = require("express");
const authService = require("../services/authService");
const router = express.Router();
const { uploadFields } = require("../middlewares/uploadImageMiddleware");

const {
  addLevel,
  addNewClass,
  addStudentsToSpecificClass,
  deleteClass,
  addTeachersToSpecificClass,
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
  addMaterial
} = require("../services/managerService");
const {
  deleteClassValidator,
  addLevelValidator,
  addNewClassValidator,
  addStudentsToSpecificClassValidator,
  addTeachersToSpecificClassValidator,
  assignSpecificSubjectToTeachersValidator,
  addUserValidator,
  disActiveUserValidator,
  addMaterialValidator
} = require("../utils/validators/managerValidator");

router.use(authService.protect);
router.use(authService.allowedTo("manager"));
router.route("/addUser").post(uploadFields, addUserValidator, addUser);
router.route("/addNewLevel").post(addLevelValidator, addLevel);
router.route("/addNewClass").post(addNewClassValidator, addNewClass);
router
  .route("/addTeachersToSpecificClass")
  .post(addTeachersToSpecificClassValidator, addTeachersToSpecificClass);
router
  .route("/addStudentsToSpecificClass")
  .post(addStudentsToSpecificClassValidator, addStudentsToSpecificClass);
router.route("/levels").get(getLevels);
router.route("/classes").get(getClasses);
router
  .route("/getClassesInSpecificLevel/:level_number")
  .get(getClassesForSpecificLevel);
router
  .route("/assignSpecificSubjectToTeachers/:subjectID")
  .post(assignSpecificSubjectToTeachersValidator, assignSpecificSubjectToTeachers);
router.route("/assignTeacherToClassSubject/:classSubjectID").post(assignTeacherToClassSubject)
router
  .route("/getTeachersFromSpecificSubject/:subjectID")
  .get(getTeachersFromSpecificSubject);
router.route("/subjects").get(getSubjects);
router.route("/disActiveUser").put(disActiveUserValidator, disActiveUser);
router.route("/deleteClass").delete(deleteClassValidator, deleteClass);
router.route("/deleteLevel").delete(deleteLevel);
router.route("/getSpecificStudent/:identity_number").get(getSpecificStudent);
router.route("/getSpecificTeacher/:identity_number").get(getSpecificTeacher);
// router.route('/getClassSubjectsByClassId/:classId').get(getClassSubjectsByClassId)
// router.route("/getSubjectForSpecificClass/:level_number/:class_number").get(getSubjectsForSpecificClass)
router.route("/getSpecificClass/:level_number/:class_number").get(getSpecificClass)
router.route("/students").get(getStudents);
router.route("/teachers").get(getTeachers);
router.route("/getMyData").get(getMyData);
router.route('/addMaterial/:ClassSubject_id').post(addMaterialValidator, addMaterial)


module.exports = router;
