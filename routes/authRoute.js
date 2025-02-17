const express = require("express");
const router = express.Router();
const authService = require("../services/authService");

const {
  login,
  forgotPassword,
  verifyPassResetCode,
  resetPassword,
  refreshToken
} = require("../services/authService");
const {
  loginValidator,
  forgotPasswordValidator,
  verifyResetCodeValidator,
  resetPasswordValidator,
} = require("../utils/validators/authValidator");

router.route("/login").post(loginValidator, login);
router.post("/forgotPassword", forgotPasswordValidator, forgotPassword);
router.post("/verifyResetCode", verifyResetCodeValidator, verifyPassResetCode);
router.put("/resetPassword", resetPasswordValidator, resetPassword);
router.get('/refresh', refreshToken)

module.exports = router;
