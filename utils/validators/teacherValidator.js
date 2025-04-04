// teacherValidator.js
const validatorMiddleware = require("../../middlewares/validatorMiddleware");
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

exports.addSubmissionGradeAndFeedbackValidator = [
  check("grade")
    .isNumeric()
    .withMessage("يجب أن تكون الدرجة رقمية")
    .notEmpty()
    .withMessage("يجب ان تضع درجة لهذا التسليم"),
  check("feedback")
    .isString()
    .withMessage("يجب أن يكون الفيد باك نصيًا")
    .notEmpty()
    .withMessage("يجب ان تضع فيدباك لهذا التسليم"),
  validatorMiddleware,
];

exports.createExamValidator = [
  check("title")
    .notEmpty()
    .withMessage("عنوان الكويز مطلوب"),
  check("description")
    .notEmpty()
    .withMessage("وصف الكويز مطلوب"),
  check("class_id")
    .notEmpty()
    .withMessage("معرف الفصل مطلوب"),
  check("subject_id")
    .notEmpty()
    .withMessage("معرف المادة مطلوب"),
  check("questions")
    .isArray({ min: 1 })
    .withMessage("يجب إضافة أسئلة للكويز"),
  check("questions.*.questionText")
    .notEmpty()
    .withMessage("نص السؤال مطلوب"),
  check("questions.*.options")
    .isArray({ min: 2 })
    .withMessage("يجب إضافة خيارات للسؤال"),
  check("questions.*.correctAnswer")
    .notEmpty()
    .withMessage("الإجابة الصحيحة مطلوبة"),
  check("questions.*.questionGrade")
    .notEmpty()
    .withMessage("درجة السؤال مطلوبة")
    .isNumeric()
    .withMessage("يجب أن تكون درجة السؤال رقمية"),
  check("available_at")
    .notEmpty()
    .withMessage("تاريخ البدء مطلوب")
    .isISO8601() // استخدام isISO8601 للتحقق من تنسيق التاريخ
    .withMessage("يجب أن يكون التاريخ بتنسيق صحيح (مثال: 2023-10-10T00:00:00.000Z)"),
  check("deadline")
    .notEmpty()
    .withMessage("تاريخ الانتهاء مطلوب")
    .isISO8601() // استخدام isISO8601 للتحقق من تنسيق التاريخ
    .withMessage("يجب أن يكون التاريخ بتنسيق صحيح (مثال: 2023-10-20T23:59:59.000Z)"),
  validatorMiddleware,
];


exports.addStudentGradeValidator = [
  check("student_id")
    .notEmpty()
    .withMessage("رقم هوية الطالب مطلوب"),
  check("subject_id")
    .notEmpty()
    .withMessage("معرف المادة مطلوب"),
  check("class_id")
    .notEmpty()
    .withMessage("معرف الفصل مطلوب"),
  check("grade")
    .notEmpty()
    .withMessage("الدرجة مطلوبة")
    .isNumeric()
    .withMessage("يجب أن تكون الدرجة رقمية"),
  validatorMiddleware,
];


exports.updateStudentGradeValidator = [
  check("grade")
    .notEmpty()
    .withMessage("الدرجة مطلوبة")
    .isNumeric()
    .withMessage("يجب أن تكون الدرجة رقمية")
    .isFloat({ min: 0, max: 100 })
    .withMessage("يجب أن تكون الدرجة بين 0 و 100"),
  validatorMiddleware,
];