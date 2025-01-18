// teacherValidator.js
const validatorMiddleware = require('../../middlewares/validatorMiddleware');
const { check } = require("express-validator");

exports.addNewRecordedLectureValidator = [
  check("title").notEmpty().withMessage("Title Required"),
  check("class_id").notEmpty().withMessage("Class ID Required"),
  check("subject_id").notEmpty().withMessage("Subject ID Required"),
  check("description").notEmpty().withMessage("Description Required"),
  check("video_url").notEmpty().withMessage("Video URL Required"),
  check("views").optional(),
  check("rating").optional(),
  check("size").optional(),
  validatorMiddleware,
];

exports.addNewAnnouncementValidator = [
  check("content").notEmpty().withMessage("Content Required"),
  check("class_id").notEmpty().withMessage("Class ID Required"),
  check("subject_id").notEmpty().withMessage("Subject ID Required"),
  validatorMiddleware,
];

exports.addMaterialValidator = [
  check("name").notEmpty().withMessage("Name Required"),
  check("class_id").notEmpty().withMessage("Class ID Required"),
  check("subject_id").notEmpty().withMessage("Subject ID Required"),
  validatorMiddleware,
];

// إضافة تحقق للبيانات المرسلة عند الانضمام إلى المحاضرة
exports.enrollStudentToRecordedLectureValidator = [
  check("studentId").notEmpty().withMessage("Student ID Required"),
  validatorMiddleware,
];


exports.createActivityValidator = [
  check("title").notEmpty().withMessage("عنوان النشاط مطلوب"),
  check("description").notEmpty().withMessage("وصف النشاط مطلوب"),
  check("class_id").notEmpty().withMessage("معرف الفصل مطلوب"),
  check("subject_id").notEmpty().withMessage("معرف المادة مطلوب"),
  check("typeActivity").notEmpty().withMessage("نوع النشاط مطلوب"),
  check("full_grade").notEmpty().withMessage("الدرجة الكاملة مطلوبة"),
  check("available_at").notEmpty().withMessage("تاريخ البدء مطلوب"),
  check("deadline").notEmpty().withMessage("تاريخ الانتهاء مطلوب"),
  validatorMiddleware,
];

exports.updateSubmissionGradeAndFeedbackValidator = [
  check("grade")
    .optional()
    .isNumeric()
    .withMessage("يجب أن تكون الدرجة رقمية")
    .isFloat({ min: 0, max: 100 })
    .withMessage("يجب أن تكون الدرجة بين 0 و 100"),
  check("feedback")
    .optional()
    .isString()
    .withMessage("يجب أن يكون الفيد باك نصيًا")
    .isLength({ max: 500 })
    .withMessage("يجب ألا يتجاوز الفيد باك 500 حرف"),
  validatorMiddleware,
];