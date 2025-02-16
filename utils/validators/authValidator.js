const { check } = require("express-validator");
const validatorMiddleware = require("../../middlewares/validatorMiddleware");



exports.loginValidator = [
  check("identity_number").notEmpty().withMessage("Identity Number Required"),
  check("password").notEmpty().withMessage("Password Required"),
  validatorMiddleware,
];

exports.verifyResetCodeValidator = [
  check("resetCode").notEmpty().withMessage("Reset code Required"),
  validatorMiddleware,
];

exports.forgotPasswordValidator = [
  check("identity_number").notEmpty().withMessage("Identity Number Required"),
  validatorMiddleware,
];

exports.resetPasswordValidator = [
  check("identity_number").notEmpty().withMessage("Identity Number Required"),
  check("newPassword")
    .notEmpty()
    .withMessage("New Password Required")
    .isStrongPassword({ minUppercase: 0, minSymbols: 0 })
    .withMessage(
      "New Password must be at least 8 characters and must be contain at lease 1 number and 1 letter"
    )
    .custom((newPassword, { req }) => {
      if (newPassword != req.body.passwordConfirm) {
        throw new Error("Confirm Password incorrect");
      }
      return true;
    }),
  check("passwordConfirm").notEmpty().withMessage("Confirm Password Required"),
  validatorMiddleware,
];

