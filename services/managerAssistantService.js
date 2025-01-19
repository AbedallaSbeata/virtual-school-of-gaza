const Schedule = require("../models/scheduleModel");
const Class = require("../models/classModel");
const Teacher = require("../models/teacherModel");
const Subject = require("../models/subjectModel");
const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/apiError");

exports.generateSchedules = asyncHandler(async (req, res, next) => {
  const { class_ids, teacher_ids, subject_ids, available_times } = req.body;

  // التحقق من وجود الفصول والمعلمين والمواد
  const classes = await Class.find({ _id: { $in: class_ids } });
  const teachers = await Teacher.find({ user_identity_number: { $in: teacher_ids } });
  const subjects = await Subject.find({ _id: { $in: subject_ids } });

  if (classes.length !== class_ids.length || teachers.length !== teacher_ids.length || subjects.length !== subject_ids.length) {
    return next(new ApiError('بعض المدخلات غير صالحة', 400));
  }

  // إنشاء جداول الفصول والمعلمين
  const classSchedules = [];
  const teacherSchedules = [];

  for (const classRoom of classes) {
    const classSchedule = {
      class_id: classRoom._id,
      schedule: [],
    };

    for (const day of available_times.days) {
      const periods = [];

      for (const timeSlot of available_times.times) {
        const randomSubject = subjects[Math.floor(Math.random() * subjects.length)];
        const randomTeacher = teachers[Math.floor(Math.random() * teachers.length)];

        periods.push({
          subject_id: randomSubject._id,
          start_time: timeSlot.start_time,
          end_time: timeSlot.end_time,
        });

        // تحديث جدول المعلم
        const teacherSchedule = teacherSchedules.find((t) => t.teacher_id === randomTeacher.user_identity_number);
        if (teacherSchedule) {
          teacherSchedule.schedule.push({
            day,
            subject_id: randomSubject._id,
            class_id: classRoom._id,
            start_time: timeSlot.start_time,
            end_time: timeSlot.end_time,
          });
        } else {
          teacherSchedules.push({
            teacher_id: randomTeacher.user_identity_number,
            schedule: [
              {
                day,
                subject_id: randomSubject._id,
                class_id: classRoom._id,
                start_time: timeSlot.start_time,
                end_time: timeSlot.end_time,
              },
            ],
          });
        }
      }

      classSchedule.schedule.push({
        day,
        periods,
      });
    }

    classSchedules.push(classSchedule);
  }

  // حفظ جداول الفصول
  for (const classSchedule of classSchedules) {
    await Schedule.create(classSchedule);
  }

  // حفظ جداول المعلمين
  for (const teacherSchedule of teacherSchedules) {
    await Schedule.create({
      teacher_id: teacherSchedule.teacher_id,
      schedule: teacherSchedule.schedule,
    });
  }

  res.status(201).json({
    message: 'تم إنشاء الجداول الدراسية بنجاح',
    data: {
      classSchedules,
      teacherSchedules,
    },
  });
});