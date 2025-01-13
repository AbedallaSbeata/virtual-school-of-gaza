const { check } = require("express-validator");
const validatorMiddleware = require("../../middlewares/validatorMiddleware");
const bcrypt = require("bcrypt");


exports.updateLoggedUserPasswordValidator = [
  check("currentPassword")
    .notEmpty()
    .withMessage("You must enter your current password"),

  check("passwordConfirm")
    .notEmpty()
    .withMessage("You must enter the password confirm"),

  check("newPassword")
    .notEmpty()
    .withMessage("New Password Required")
    .isStrongPassword({ minUppercase: 0, minSymbols: 0 })
    .withMessage(
      "New Password must be at least 8 characters and must be contain at lease 1 number and 1 letter"
    )
    .custom(async (newPassword, { req }) => {
      const isCorrectPassword = await bcrypt.compare(
        req.body.currentPassword,
        req.user.password
      );
      if (!isCorrectPassword) {
        throw new Error("Incorrect current password");
      }
      if (newPassword != req.body.passwordConfirm) {
        throw new Error("New password and Confirm Password Not Match!!");
      }

      return true;
    }),

  validatorMiddleware,
];

