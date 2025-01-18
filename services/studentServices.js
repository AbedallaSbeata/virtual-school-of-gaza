const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/apiError");
const Submission = require('../models/submissionModel');
const Activity = require('../models/activityModel');


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
    user_identity_number: req.user.identity_number,
    activity_id: activityId,
    file_url, // الملف الذي يرفعه الطالب
  });

  activity.submissions.push(submission._id);
  await activity.save();

  res.status(201).json({ message: 'تم تسليم النشاط بنجاح', data: submission });
});