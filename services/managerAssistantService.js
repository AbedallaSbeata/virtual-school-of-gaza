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

  // البحث عن الجداول الدراسية التي تحتوي على هذا المعلم
  const schedules = await Schedule.find({});

  if (!schedules || schedules.length === 0) {
    return next(new ApiError('لم يتم العثور على جداول دراسية', 404));
  }

  // تصفية الجداول الدراسية للمعلم المحدد
  const teacherSchedule = schedules
    .map((schedule) => {
      return {
        class_id: schedule.class_id,
        schedule: schedule.schedule
          .map((day) => {
            return {
              day: day.day,
              periods: day.periods.filter((period) => period.teacher_id === teacherId),
            };
          })
          .filter((day) => day.periods.length > 0), // إزالة الأيام التي لا تحتوي على فترات للمعلم
      };
    })
    .filter((schedule) => schedule.schedule.length > 0); // إزالة الجداول التي لا تحتوي على فترات للمعلم

  if (teacherSchedule.length === 0) {
    return next(new ApiError('لم يتم العثور على جدول لهذا المعلم', 404));
  }

  res.status(200).json({
    message: 'تم استرجاع الجدول الدراسي بنجاح',
    data: teacherSchedule,
  });
});