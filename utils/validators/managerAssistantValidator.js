const { check } = require("express-validator");
const validatorMiddleware = require("../../middlewares/validatorMiddleware");

exports.createScheduleValidator = [
  check("class_id")
    .notEmpty()
    .withMessage("معرف الفصل مطلوب"),
  check("schedule")
    .isArray({ min: 1 })
    .withMessage("يجب إضافة جدول يحتوي على أيام وفترات"),
  check("schedule.*.day")
    .notEmpty()
    .withMessage("اليوم مطلوب")
    .isIn(["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"])
    .withMessage("اليوم غير صحيح"),
  check("schedule.*.periods")
    .isArray({ min: 1 })
    .withMessage("يجب إضافة فترات لهذا اليوم"),
  check("schedule.*.periods.*.subject_id")
    .notEmpty()
    .withMessage("معرف المادة مطلوب"),
  check("schedule.*.periods.*.teacher_id")
    .notEmpty()
    .withMessage("معرف المعلم مطلوب"),
  check("schedule.*.periods.*.start_time")
    .notEmpty()
    .withMessage("وقت البداية مطلوب"),
  check("schedule.*.periods.*.end_time")
    .notEmpty()
    .withMessage("وقت النهاية مطلوب"),
  validatorMiddleware,
];