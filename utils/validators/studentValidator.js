// studentValidator.js
const validatorMiddleware = require('../../middlewares/validatorMiddleware');
const { check } = require("express-validator");

// exports.submitActivityValidator = [
//   check("file_url").notEmpty().withMessage("رابط الملف مطلوب"),
//   validatorMiddleware,
// ];