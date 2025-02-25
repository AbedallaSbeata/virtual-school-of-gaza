const { check } = require("express-validator");
const validatorMiddleware = require("../../middlewares/validatorMiddleware");

exports.addUserValidator = [
  check("identity_number").notEmpty().withMessage("Identity Number Required"),
  check("email").notEmpty().withMessage("Email Required"),
  check("first_name").notEmpty().withMessage("First Name Required"),
  check("second_name").notEmpty().withMessage("Second Name Required"),
  check("third_name").notEmpty().withMessage("Third Name Required"),
  check("last_name").notEmpty().withMessage("Last Name Required"),
  check("basic_phone_number")
    .notEmpty()
    .withMessage("Basic Phone Number Required"),
  check("second_phone_number").optional(),
  check("whatsapp_number").notEmpty().withMessage("Whatsapp Number Required"),
  check("health_status").notEmpty().withMessage("Health Status Required"),
  check("password").notEmpty().withMessage("Password Required"),
  check("current_country").notEmpty().withMessage("Current Country Required"),
  check("current_city").notEmpty().withMessage("Current City Required"),
  check("current_neighborhood")
    .notEmpty()
    .withMessage("Current Neighborhood Required"),
  check("current_street").notEmpty().withMessage("Current Street Required"),
  check("birth_country").notEmpty().withMessage("Birth Country Required"),
  check("birth_date").notEmpty().withMessage("Birth Date Required"),
  check("role").notEmpty().withMessage("Role Required"),
  check("active").optional(),
  check("gender").notEmpty().withMessage("Gender Required"),
  check("enrolled_classes").optional(),
  check("passwordResetCode").optional(),
  check("passwordResetExpires").optional(),
  check("resetPasswordAt").optional(),
  check("passwordResetVerified").optional(),
  validatorMiddleware,
];

exports.disActiveUserValidator = [
  check("identity_number").notEmpty().withMessage("Identity Number Required"),
  validatorMiddleware,
];

exports.addLevelValidator = [
  check("level_number").notEmpty().withMessage("Level Number Required"),
  check("level_name").notEmpty().withMessage("Level Name Required"),
  check("classes")
    .optional()
    .isArray()
    .withMessage("Classes Must Be Array Of Classes"),
  validatorMiddleware,
];
exports.addNewClassValidator = [
  check("level_number").notEmpty().withMessage("Level Number Required"),
  check("class_number").notEmpty().withMessage("Class Number Required"),
  validatorMiddleware,
];

exports.addTeachersToSpecificClassValidator = [
  check("level_number").notEmpty().withMessage("Level Number Required"),
  check("class_number").notEmpty().withMessage("Class Number Required"),
  check("teachersIDs")
    .notEmpty()
    .withMessage("Teachers IDs Required")
    .isArray()
    .withMessage("Teachers IDs Must Be Array Of Teachers"),
  validatorMiddleware,
];

exports.addStudentsToSpecificClassValidator = [
  check("level_number").notEmpty().withMessage("Level Number Required"),
  check("class_number").notEmpty().withMessage("Class Number Required"),
  check("studentsIDs")
    .notEmpty()
    .withMessage("Students IDs Required")
    .isArray()
    .withMessage("Students IDs Must Be Array Of Students"),
  validatorMiddleware,
];

exports.assignSpecificSubjectToTeachersValidator = [
  check("teachersIDs")
    .notEmpty()
    .withMessage("Teachers IDs Required")
    .isArray()
    .withMessage("Teachers IDs Must Be Array Of Teachers"),
  validatorMiddleware,
];

exports.deleteClassValidator = [
  check("level_number").notEmpty().withMessage("Level Number Required"),
  check("class_number").notEmpty().withMessage("Class Number Required"),
  validatorMiddleware,
];

exports.addMaterialValidator = [
  check("name").notEmpty().withMessage("Name Required"),
];


