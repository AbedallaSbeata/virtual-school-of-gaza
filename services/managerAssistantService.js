const Schedule = require("../models/scheduleModel");
const asyncHandler = require('express-async-handler')
const ApiError = require('../utils/apiError')

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


exports.getClassSchedule = asyncHandler(async (req, res, next) => {
  const { classId } = req.params;

  // البحث عن الجدول الدراسي لهذا الصف
  const classSchedule = await Schedule.findOne({ class_id: classId });

  if (!classSchedule) {
    return next(new ApiError('لم يتم العثور على جدول لهذا الصف', 404));
  }

  res.status(200).json({
    message: 'تم استرجاع الجدول الدراسي بنجاح',
    data: classSchedule,
  });
});


exports.getTeacherSchedule = asyncHandler(async (req, res, next) => {
  const { teacherId } = req.params;

  // البحث عن الجدول الدراسي لهذا المعلم
  const teacherSchedule = await Schedule.findOne({ teacher_id: teacherId });

  if (!teacherSchedule) {
    return next(new ApiError('لم يتم العثور على جدول لهذا المعلم', 404));
  }

  res.status(200).json({
    message: 'تم استرجاع الجدول الدراسي بنجاح',
    data: teacherSchedule,
  });
});