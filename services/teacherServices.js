const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/apiError");
const RecordedLecture = require('../models/recordedLectureModel');
const Class = require('../models/classModel')
const User = require('../models/userModel')
const Announcement = require('../models/announcementModel')
const Material = require('../models/materialModel');
const Activity = require('../models/activityModel')
const Submission = require('../models/submissionModel')
const Exam = require('../models/examModel')
const Grade = require("../models/gradeModel");
const Student = require('../models/studentModel')
const Subject = require('../models/subjectModel')
const StudentAnswer = require('../models/studentAnswerModel')

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

exports.addSubmissionGradeAndFeedback = asyncHandler(async (req, res, next) => {
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
  submission.gradedBy = req.user.identity_number
  await submission.save();
  

  res.status(200).json({
    message: 'تم اضافة الدرجة والفيد باك بنجاح',
    data: submission,
  });
});


exports.createExam = asyncHandler(async (req, res, next) => {
  const { title, description, class_id, subject_id, questions, available_at, deadline } = req.body;

  // حساب الدرجة الكاملة للكويز
  const full_grade = questions.reduce((total, question) => total + question.questionGrade, 0);

  // إنشاء الكويز
  const exam = await Exam.create({
    title,
    description,
    class_id,
    subject_id,
    questions,
    full_grade, // الدرجة الكاملة المحسوبة
    available_at,
    deadline,
    posted_by: req.user.identity_number, // المعلم الذي قام بإنشاء الكويز
  });

  res.status(201).json({
    message: 'تم إنشاء الكويز بنجاح',
    data: exam,
  });
});




exports.addStudentGrade = asyncHandler(async (req, res, next) => {
  const { student_id, subject_id, class_id, grade } = req.body;
  const teacher_id = req.user.identity_number; // رقم هوية المعلم

  // التحقق من أن الطالب موجود
  const student = await Student.findOne({ user_identity_number: student_id });

  if (!student) {
    return next(new ApiError('الطالب غير موجود', 404));
  }

  // التحقق من أن المادة موجودة
  const subject = await Subject.findById(subject_id);

  if (!subject) {
    return next(new ApiError('المادة غير موجودة', 404));
  }

  // التحقق من أن الفصل موجود
  const classRoom = await Class.findById(class_id);

  if (!classRoom) {
    return next(new ApiError('الفصل غير موجود', 404));
  }

  // إضافة الدرجة
  const newGrade = await Grade.create({
    student_id,
    subject_id,
    class_id,
    grade,
    teacher_id,
  });

  res.status(201).json({
    message: 'تم إضافة الدرجة بنجاح',
    data: newGrade,
  });
});

exports.getGradesForSubjectByTeacher = asyncHandler(async (req, res, next) => {
  const { subjectId } = req.params;
  const teacherId = req.user.identity_number; // رقم هوية المعلم

  // البحث عن الدرجات لهذه المادة والتي رصدها هذا المعلم
  const grades = await Grade.find({ subject_id: subjectId, teacher_id: teacherId });

  if (!grades || grades.length === 0) {
    return next(new ApiError('لم يتم العثور على درجات لهذه المادة', 404));
  }

  res.status(200).json({
    message: 'تم استرجاع الدرجات بنجاح',
    data: grades,
  });
});

exports.updateStudentGrade = asyncHandler(async (req, res, next) => {
  const { gradeId } = req.params;
  const { grade } = req.body;

  // البحث عن الدرجة
  const studentGrade = await Grade.findById(gradeId);

  if (!studentGrade) {
    return next(new ApiError('الدرجة غير موجودة', 404));
  }

  // تحديث الدرجة
  studentGrade.grade = grade;
  await studentGrade.save();

  res.status(200).json({
    message: 'تم تحديث الدرجة بنجاح',
    data: studentGrade,
  });
});


exports.getStudentAnswersExam = asyncHandler(async (req, res, next) => {
  const { examId, studentId } = req.params;

  // البحث عن إجابات الطالب لهذا الكويز
  const studentAnswer = await StudentAnswer.findOne({ exam_id: examId, student_id: studentId })
    .populate({
      path: 'exam_id',
      select: 'questions', // تضمين الأسئلة من الكويز
    });

  if (!studentAnswer) {
    return next(new ApiError('لم يتم العثور على إجابات لهذا الطالب', 404));
  }

  // إضافة إجابات الطالب فقط
  const exam = studentAnswer.exam_id;
  const studentAnswersWithDetails = studentAnswer.answers.map((answer) => {
    const question = exam.questions.find((q) => q._id.toString() === answer.question_id.toString());
    return {
      questionText: question.questionText,
      options: question.options,
      studentAnswer: answer.answer,
      questionGrade: question.questionGrade,
    };
  });

  res.status(200).json({
    message: 'تم استرجاع إجابات الطالب بنجاح',
    data: {
      student_id: studentAnswer.student_id,
      exam_id: studentAnswer.exam_id,
      total_grade: studentAnswer.total_grade,
      answers: studentAnswersWithDetails,
    },
  });
});