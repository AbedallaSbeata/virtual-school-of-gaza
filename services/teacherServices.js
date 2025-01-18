const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/apiError");
const RecordedLecture = require('../models/recordedLectureModel');
const Teacher = require('../models/teacherModel')
const Class = require('../models/classModel')
const User = require('../models/userModel')
const Announcement = require('../models/announcementModel')
const Material = require('../models/materialModel');
const Activity = require('../models/activityModel')


exports.addNewRecordedLecture = asyncHandler(async (req, res, next) => {
    const { class_id, subject_id, title, description, video_url } = req.body;
  
    const recordedLecture = await RecordedLecture.create({
      class_id,
      subject_id,
      title,
      description,
      video_url,
      uploaded_by: req.user.identity_number, // المعلم الذي قام بإنشاء المحاضرة
      enrolled_students: [], // قائمة فارغة للطلاب الذين سينضمون لاحقًا
    });
  
    res.status(201).json({ message: 'تم انشاء محاضرة جديدة', data: recordedLecture });
  });

exports.enrollStudentToRecordedLecture = asyncHandler(async (req, res, next) => {
    const { lectureId } = req.params;
    const { studentId } = req.body;
  
    const recordedLecture = await RecordedLecture.findById(lectureId);
    if (!recordedLecture) {
      return next(new ApiError('المحاضرة غير موجودة', 404));
    }
  
    // التحقق من أن الطالب ليس مسجلًا بالفعل في المحاضرة
    if (recordedLecture.enrolled_students.includes(studentId)) {
      return next(new ApiError('الطالب مسجل بالفعل في هذه المحاضرة', 400));
    }
  
    // إضافة الطالب إلى قائمة الطلاب المسجلين
    recordedLecture.enrolled_students.push(studentId);
    await recordedLecture.save();
  
    res.status(200).json({ message: 'تم تسجيل الطالب في المحاضرة بنجاح', data: recordedLecture });
  });

exports.addNewAnnouncement = asyncHandler(async (req, res, next) => {
    await Announcement.create(
        {
            class_id: req.body.class_id,
            content: req.body.content,
            subject_id: req.body.subject_id,
            user_identity_number: req.user.identity_number   
        }
    );
    res.status(201).send({message: 'تم انشاء اعلان جديد'})
});

exports.getMyClasses = asyncHandler(async (req, res, next) => {
    const teacher = await Teacher.find({user_identity_number: req.user.identity_number})
    const teachers = []
    for(let i = 0; i < teacher[0].classes_ids.length; i++) {
        teachers.push(await Class.findById(teacher[0].classes_ids[i]))
    }
    res.status(200).json({data: teachers})
});

exports.getMyData = asyncHandler(async (req, res, next) => {
    const myData = await User.findById(req.user._id)
    res.status(200).json({data: myData})
});

exports.addMaterial = asyncHandler(async (req,res,next) => {
    if (!req.file) {
        return next(new ApiError('لم يتم رفع أي ملف', 400));
    }
    const file_url = `${req.protocol}://${req.get('host')}/uploads/materials/${req.file.filename}`;

    await Material.create({
        class_id: req.body.class_id,
        subject_id: req.body.class_id,
        file_url: file_url,
        type_file: req.file.mimetype,
        name: req.body.name,
        uploaded_by: req.user.identity_number
    });
    res.status(201).send({message: 'تم رفع ملف جديد'})
});


exports.createActivity = asyncHandler(async (req, res, next) => {
  const { title, description, class_id, subject_id, typeActivity, full_grade, available_at, deadline } = req.body;

  let file_url = null;
  if (req.file) {
    file_url = `${req.protocol}://${req.get('host')}/uploads/activities/${req.file.filename}`;
  }

  const activity = await Activity.create({
    title,
    description,
    class_id,
    subject_id,
    typeActivity,
    full_grade,
    file_url, // الملف الذي يرفعه المعلم (إن وجد)
    available_at,
    deadline,
    posted_by: req.user.identity_number,
    submissions: [] // قائمة فارغة للتسليمات
  });

  res.status(201).json({ message: 'تم إنشاء النشاط بنجاح', data: activity });
});

exports.getSubmissionsForActivity = asyncHandler(async (req, res, next) => {
  const { activityId } = req.params;

  // البحث عن النشاط مع تضمين التسليمات المرتبطة به
  const activity = await Activity.findById(activityId).populate({
    path: 'submissions',
    select: 'user_identity_number file_url grade feedback', // تحديد الحقول المطلوبة
  });

  if (!activity) {
    return next(new ApiError('النشاط غير موجود', 404));
  }

  // إرسال البيانات المطلوبة
  res.status(200).json({
    message: 'تم استرجاع التسليمات بنجاح',
    data: activity.submissions,
  });
});

exports.updateSubmissionGradeAndFeedback = asyncHandler(async (req, res, next) => {
  const { submissionId } = req.params;
  const { grade, feedback } = req.body;

  // البحث عن التسليم المطلوب
  const submission = await Submission.findById(submissionId);

  if (!submission) {
    return next(new ApiError('التسليم غير موجود', 404));
  }

  // تحديث الدرجة والفيد باك
  submission.grade = grade;
  submission.feedback = feedback;

  await submission.save();

  res.status(200).json({
    message: 'تم تحديث الدرجة والفيد باك بنجاح',
    data: submission,
  });
});
