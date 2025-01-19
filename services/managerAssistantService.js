const Schedule = require("../models/scheduleModel");
const asyncHandler = require('express-async-handler')

exports.createSchedule = asyncHandler(async (req, res, next) => {
  const { class_id, schedule } = req.body;

  // التحقق من أن الجدول غير موجود مسبقًا لهذا الصف
  const existingSchedule = await Schedule.findOne({ class_id });

  if (existingSchedule) {
    return next(new ApiError('تم إنشاء جدول لهذا الصف مسبقًا', 400));
  }

  // إنشاء الجدول
  const newSchedule = await Schedule.create({
    class_id,
    schedule,
  });

  res.status(201).json({
    message: 'تم إنشاء الجدول المدرسي بنجاح',
    data: newSchedule,
  });
});