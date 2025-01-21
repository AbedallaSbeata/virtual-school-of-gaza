const validatorMiddleware = require('../../middlewares/validatorMiddleware');
const { check } = require("express-validator");

exports.submitExamAnswersValidator = [
    check("examId")
      .notEmpty()
      .withMessage("معرف الاختبار مطلوب")
      .isMongoId()
      .withMessage("معرف الاختبار غير صالح"),
    check("answers")
      .isArray({ min: 1 })
      .withMessage("يجب إرسال إجابات للأسئلة"),
    check("answers.*")
      .notEmpty()
      .withMessage("الإجابة مطلوبة"),
    validatorMiddleware,
  ];
  
