const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/apiError");
const Submission = require('../models/submissionModel');
const Activity = require('../models/activityModel');
const Student = require('../models/studentModel')
const Class = require('../models/classModel')
const User = require('../models/userModel')
const Exam = require('../models/examModel')
const StudentAnswer = require('../models/studentAnswerModel')

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

exports.getExamQuestions = asyncHandler(async (req, res, next) => {
  const { examId } = req.params;

  // البحث عن الاختبار
  const exam = await Exam.findById(examId).select('questions');

  if (!exam) {
    return next(new ApiError('الاختبار غير موجود', 404));
  }

  const questionsWithoutAnswers = exam.questions.map((question) => {
    return {
      _id: question._id,
      questionText: question.questionText,
      options: question.options,
      questionGrade: question.questionGrade,
    };
  });


  res.status(200).json({
    message: 'تم استرجاع أسئلة الاختبار بنجاح',
    data: questionsWithoutAnswers,
  });
});

exports.submitExamAnswers = asyncHandler(async (req, res, next) => {
  const { examId } = req.params;
  const { answers } = req.body; // إجابات الطالب
  const studentId = req.user.identity_number; // رقم هوية الطالب

  // البحث عن الاختبار
  const exam = await Exam.findById(examId);

  if (!exam) {
    return next(new ApiError('الاختبار غير موجود', 404));
  }

  // حساب الدرجة
  let totalGrade = 0;
  exam.questions.forEach((question, index) => {
    if (answers[index] === question.correctAnswer) {
      totalGrade += question.questionGrade;
    }
  });

  // حفظ إجابات الطالب
  const studentAnswer = await StudentAnswer.create({
    exam_id: examId,
    student_id: studentId,
    answers: answers.map((answer, index) => ({
      question_id: exam.questions[index]._id,
      answer: answer,
    })),
    total_grade: totalGrade,
  });

  res.status(201).json({
    message: 'تم تسليم إجابات الامتحان بنجاح',
    data: studentAnswer,
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