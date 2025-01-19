const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/apiError");
const Submission = require('../models/submissionModel');
const Activity = require('../models/activityModel');
const Student = require('../models/studentModel')
const Class = require('../models/classModel')
const User = require('../models/userModel')

exports.submitActivity = asyncHandler(async (req, res, next) => {
  if (!req.file) {
    return next(new ApiError('يرجى رفع ملف للتسليم', 400));
  }

  const { activityId } = req.params;

  const activity = await Activity.findById(activityId);
  if (!activity) {
    return next(new ApiError('النشاط غير موجود', 404));
  }

  const file_url = `${req.protocol}://${req.get('host')}/uploads/submissions/${req.file.filename}`;

  const submission = await Submission.create({
    user_identity_number: req.user.identity_number, // رقم هوية الطالب
    activity_id: activityId,
    file_url, // الملف الذي يرفعه الطالب
  });

  activity.submissions.push(submission._id);
  await activity.save();

  res.status(201).json({ message: 'تم تسليم النشاط بنجاح', data: submission });
});

exports.getMyEnrolledClass = asyncHandler(async (req, res, next) => {
  const student = await Student.find({user_identity_number: req.user.identity_number})
  const enrolledClass = await Class.find({_id: student[0].class_id})
  res.status(200).json({data: enrolledClass})
});

exports.getMyData = asyncHandler(async (req, res, next) => {
  const myData = await User.findById(req.user._id)
  res.status(200).json({data: myData})
});