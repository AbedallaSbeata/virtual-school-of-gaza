const { check } = require("express-validator");
const validatorMiddleware = require("../../middlewares/validatorMiddleware");

exports.generateSchedulesValidator = [
  check("class_ids")
    .isArray({ min: 1 })
    .withMessage("يجب إضافة معرفات الفصول"),
  check("teacher_ids")
    .isArray({ min: 1 })
    .withMessage("يجب إضافة أرقام هويات المعلمين"),
  check("subject_ids")
    .isArray({ min: 1 })
    .withMessage("يجب إضافة معرفات المواد"),
  check("available_times.days")
    .isArray({ min: 1 })
    .withMessage("يجب إضافة الأيام المتاحة"),
  check("available_times.times")
    .isArray({ min: 1 })
    .withMessage("يجب إضافة الأوقات المتاحة"),
  validatorMiddleware,
];