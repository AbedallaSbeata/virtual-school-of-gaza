const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/apiError");
const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail");
const createToken = require("../utils/createToken");
const createRefereshToken = require('../utils/createToken')

// exports.login = asyncHandler(async (req, res, next) => {
//   const user = await User.findOne(
//     { identity_number: req.body.identity_number },
//     { __v: false, resetPasswordAt: false, _id: false }
//   );
//   if (!user || !(await bcrypt.compare(req.body.password, user.password))) {
//     return next(new ApiError("خطأ في رقم الهوية أو كلمة المرور", 401));
//   }
//   if (user.active == false) {
//     return next(new ApiError("عذرا.. هذا الحساب غير فعال", 401));
//   }

//   const userWithId = await User.findOne({ identity_number: req.body.identity_number });

//   // إنشاء توكن جديد
//   const token = createToken(userWithId._id);
//   const refreshToken = createRefereshToken(userWithId._id);

//   // حفظ الريفرش توكن في قاعدة البيانات
//   userWithId.refreshToken = refreshToken;
//   await userWithId.save();

//   // **حفظ الريفرش توكن في الكوكيز**
//   res.cookie("refreshToken", refreshToken, {
//     httpOnly: true,
//     secure: process.env.NODE_ENV === "production", // تأكد من هذه الإعدادات
//     sameSite: "Strict",
//     maxAge: 7 * 24 * 60 * 60 * 1000,
//   });
  

//   delete user._doc.password;
//   res.status(200).json({ data: user, token });
// });


exports.login = async (req, res) => {
  const { identity_number, password } = req.body;
  if (!identity_number || !password) return res.status(400).json({ 'message': 'Identity number and password are required.' });

  const foundUser = await User.findOne({ identity_number: identity_number }).exec();
  if (!foundUser) return res.sendStatus(401); //Unauthorized 
  // evaluate password 
  const match = await bcrypt.compare(password, foundUser.password);
  if (match) {
      const role = Object.values(foundUser.role).filter(Boolean);
      // create JWTs
      const accessToken = jwt.sign(
          {
              "UserInfo": {
                  "identity_number": foundUser.identity_number,
                  "role": role
              }
          },
          process.env.JWT_SECRET,
          { expiresIn: '90d' }
      );
      const refreshToken = jwt.sign(
          { "identity_number": foundUser.identity_number },
          process.env.REFRESH_TOKEN_SECRET,
          { expiresIn: '90d' }
      );
      // Saving refreshToken with current user
      foundUser.refreshToken = refreshToken;
      await foundUser.save();


      // Creates Secure Cookie with refresh token
      res.cookie('jwt', refreshToken, { httpOnly: true, secure: true, sameSite: 'None', maxAge: 24 * 60 * 60 * 1000 });

      // Send authorization roles and access token to user
      res.json({ foundUser});

  } else {
      res.sendStatus(401);
  }
}

exports.protect = asyncHandler(async (req, res, next) => {
  // 1) Check if token exist, if exist get
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }
  if (!token) {
    return next(new ApiError("يحب عليك تسجيل الدخول أولا", 401));
  }

  // 2) Verify token (no change happens, expired token)
  const decoded = jwt.verify(token, process.env.JWT_SECRET); // return id of user

  // 3) Check if user exists
  const currentUser = await User.findById(decoded.userId);

  if (!currentUser) {
    return next(new ApiError("No user of this token", 401));
  }

  // 4) Check if user change his password after token created

  if (currentUser.resetPasswordAt) {
    const resetPasswordTimestamp = parseInt(
      currentUser.resetPasswordAt.getTime() / 1000,
      10
    ); // تحويل الديت لتايم ستامب
    if (resetPasswordTimestamp > decoded.iat) {
      // تاريخ التعديل اكبر من تاريخ انشاء التوكن يعني انه حصل تعديل للباسورد بعد انشاء التوكن
      return next(
        new ApiError(
          "هذا المستخدم قام بتغيير كلمة المرور.. يرجى تسجيل الدخول مجددا",
          401
        )
      );
    }
  }
  req.user = currentUser;
  next();
});
// exports.protect = asyncHandler(async (req, res, next) => {
//   let token;
//   if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
//     token = req.headers.authorization.split(" ")[1];
//   } else {
//     const user = await User.findOne({ identity_number: req.body.identity_number });
//     if (user) token = user.token;
//   }

//   if (!token) {
//     return next(new ApiError("يجب عليك تسجيل الدخول أولا", 401));
//   }

//   const decoded = jwt.verify(token, process.env.JWT_SECRET);
//   const currentUser = await User.findById(decoded.userId);

//   if (!currentUser) {
//     return next(new ApiError("No user of this token", 401));
//   }

//   req.user = currentUser;
//   next();
// });

exports.allowedTo = (...roles) =>
  asyncHandler(async (req, res, next) => {
    // 1) access roles
    // 2) access registered user (req.user.role)
    if (!roles.includes(req.user.role)) {
      return next(
        new ApiError("هذا المستخدم غير مخول له الوصول الى هذه الصفحة", 403)
      );
    }
    next();
  });

exports.forgotPassword = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ identity_number: req.body.identity_number });
  if (!user) {
    return next(
      new ApiError(`لا يوجد مستخدم برقم الهوية هذا: ${req.body.identity_number}`, 404)
    );
  }
  const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
  const hashedResetCode = crypto
    .createHash("sha256")
    .update(resetCode)
    .digest("hex");

  user.passwordResetCode = hashedResetCode;
  user.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  user.passwordResetVerified = false;

  await user.save();

  const message = `Hi ${user.first_name},\n We received a request to reset the password on your School Account. \n The reset code: ${resetCode} \n Enter this code to complete the reset. \n Thanks for helping us keep your account secure.\n Virsual School Team`;
  try {
    await sendEmail({
      email: user.email,
      subject: "Your password reset code (valid for 10 min)",
      message,
    });
  } catch (err) {
    user.passwordResetCode = undefined;
    user.passwordResetExpires = undefined;
    user.passwordResetVerified = undefined;
    await user.save();
    return next(
      new ApiError("هناك مشكلة في ارسال الرمز الى البريد الالكتروني", 500)
    );
  }
  res
    .status(200)
    .json({ message: "تم ارسال الرمز الى البريد الالكتروني بنجاح", identity_number: user.identity_number, role: user.role});
});

exports.verifyPassResetCode = asyncHandler(async (req, res, next) => {
  const hashedResetCode = crypto
    .createHash("sha256")
    .update(req.body.resetCode)
    .digest("hex");

  const user = await User.findOne({
    passwordResetCode: hashedResetCode,
    passwordResetExpires: { $gt: Date.now() },
  });
  if (!user) {
    return next(new ApiError("الرمز خاطئ او منتهي الصلاحية"));
  }

  user.passwordResetVerified = true;
  await user.save();

  res.status(200).json({
    message: "تم تأكيد الرمز بنجاح",
  });
});

exports.resetPassword = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ identity_number: req.body.identity_number });
  if (!user) {
    return next(
      new ApiError(`There is no user with ID:  ${req.body.identity_number}`, 404)
    );
  }

  if (!user.passwordResetVerified) {
    return next(new ApiError("لم يتم تأكيد الرمز", 400));
  }

  user.password = req.body.newPassword;
  user.passwordResetCode = undefined;
  user.passwordResetExpires = undefined;
  user.passwordResetVerified = undefined;
  user.resetPasswordAt = Date.now();

  await user.save();

  const token = createToken(user._id);
  res.status(200).json({ message: "تم تحديث كلمة المرور بنجاح", token});
});

exports.handleRefreshToken = async (req, res) => {
  const cookies = req.cookies;
  if (!cookies?.jwt) return res.sendStatus(401);
  const refreshToken = cookies.jwt;

  const foundUser = await User.findOne({ refreshToken }).exec();
  if (!foundUser) return res.sendStatus(403); //Forbidden 
  // evaluate jwt 
  jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET,
      (err, decoded) => {
          if (err || foundUser.identity_number !== decoded.identity_number) return res.sendStatus(403);
          const role = Object.values(foundUser.role);
          const accessToken = jwt.sign(
              {
                  "UserInfo": {
                      "identity_number": decoded.identity_number,
                      "role": role
                  }
              },
              process.env.JWT_SECRET,
              { expiresIn: '90d' }
          );
          res.json({ role, accessToken })
      }
  );
}
