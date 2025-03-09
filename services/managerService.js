const User = require("../models/userModel");
const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/apiError");
const Level = require("../models/levelModel");
const Subject = require("../models/subjectModel");
const Class = require("../models/classModel");
const Student = require("../models/studentModel");
const ApiFeatures = require("../utils/apiFeatures");
const createToken = require("../utils/createToken");
const ClassSubject = require("../models/classSubject");
const Material = require("../models/materialModel");
const RecordedLecture = require("../models/recordedLectureModel");
const RecordedLectureComments = require("../models/recordedLectureCommentModel");
const RecordedLectureReplies = require("../models/recordedLectureReplieModel");
const Announcement = require("../models/announcementModel");
const Activity = require('../models/activityModel')
const Submission = require('../models/submissionModel')
const multer = require("multer");
const path = require("path");


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let uploadPath = "uploads/activities/"; // افتراضي للنشاطات
    if (req.baseUrl.includes("submissions")) {
      uploadPath = "uploads/submissions/"; // إذا كان المسار للسبمشنز
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); // إنشاء اسم عشوائي للملف
  },
});
const upload = multer({ storage: storage });
exports.uploadFile = upload.single("file");



exports.addUser = asyncHandler(async (req, res, next) => {
  if (
    !req.files ||
    !req.files["identity_image"] ||
    !req.files["profile_image"]
  ) {
    return res
      .status(400)
      .json({ message: "يرجى رفع صورة الهوية وصورة الشخصية" });
  }

  const identityImageUrl = `${req.protocol}://${req.get(
    "host"
  )}/uploads/users/${req.files["identity_image"][0].filename}`;
  const profileImageUrl = `${req.protocol}://${req.get("host")}/uploads/users/${
    req.files["profile_image"][0].filename
  }`;

  const user = await User.create({
    basic_phone_number: req.body.basic_phone_number,
    birth_country: req.body.birth_country,
    birth_date: req.body.birth_date,
    current_city: req.body.current_city,
    current_country: req.body.current_country,
    current_neighborhood: req.body.current_neighborhood,
    current_street: req.body.current_street,
    email: req.body.email,
    first_name: req.body.first_name,
    second_name: req.body.second_name,
    gender: req.body.gender,
    third_name: req.body.third_name,
    last_name: req.body.last_name,
    health_status: req.body.health_status,
    identity_number: req.body.identity_number,
    password: req.body.password,
    role: req.body.role,
    whatsapp_number: req.body.whatsapp_number,
    identity_image: identityImageUrl,
    profile_image: profileImageUrl,
  });
  const token = createToken(user._id);
  res.json({ data: user, token });
});

exports.addLevel = asyncHandler(async (req, res, next) => {
  const levelEXists = await Level.find({ level_number: req.body.level_number });
  if (levelEXists.length == 0) {
    await Level.create(req.body);
  } else {
    return next(new ApiError("هذه المرحلة تم انشاؤها مسبقا"));
  }
  res.status(201).json({ message: "تم اضافة مرحلة جديدة" });
});

exports.addSubject = asyncHandler(async (req, res) => {
  await Subject.create(req.body);
  res.status(201).json({ message: "تم اضافة مادة جديدة" });
});

exports.addNewClass = asyncHandler(async (req, res, next) => {
  const levelEXists = await Level.find({ level_number: req.body.level_number });
  if (levelEXists.length == 0) {
    return next(new ApiError("هذا الصف يجب ان ينتمي الى مرحلة موجودة"));
  }
  const classExists = await Class.find({
    level_number: req.body.level_number,
    class_number: req.body.class_number,
  });
  if (!(classExists.length == 0)) {
    return next(new ApiError("هذا الصف تم انشاؤه مسبقا"));
  }
  const classes = levelEXists[0].classes;
  classes.push(req.body.class_number);
  const classData = await Class.create(req.body);
  await Level.findByIdAndUpdate(levelEXists[0]._id, {
    numberOfClasses: levelEXists[0].numberOfClasses + 1,
    classes: classes,
  });
  res.status(201).json({ message: "تم اضافة هذا الصف بنجاح", data: classData });
});

exports.disActiveUser = asyncHandler(async (req, res, next) => {
  const user = await User.find({ identity_number: req.body.identity_number });
  if (user.length == 0) {
    return next(
      new ApiError(
        `No user for this identity number: ${req.body.identity_number}`,
        404
      )
    );
  }
  await User.findByIdAndUpdate(user[0]._id, { active: false });
  res.json({ message: "تم الغاء تفعيل هذا الحساب بنجاح" });
});

exports.getLevels = asyncHandler(async (req, res, next) => {
  const levels = await Level.find().sort({ level_number: 1 });
  res.status(200).json({ data: levels });
});

exports.getClasses = asyncHandler(async (req, res, next) => {
  const classesLength = await Class.countDocuments();
  const apiFeatures = new ApiFeatures(Class.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate(classesLength);

  const { mongooseQuery, paginationResult } = apiFeatures;
  const classes = await mongooseQuery;
  res
    .status(200)
    .json({ results: classes.length, paginationResult, data: classes });
});

exports.getClassesForSpecificLevel = asyncHandler(async (req, res, next) => {
  const classes = await Class.find({ level_number: req.params.level_number });
  res.status(200).json({ data: classes });
});

exports.getTeachersFromSpecificSubject = asyncHandler(
  async (req, res, next) => {
    const subjectID = await Subject.findById(req.params.subjectID);
    if (!subjectID) {
      return next(new ApiError("هذه المادة غير موجودة"));
    }
    const teachers = subjectID.teachersIDs;
    let teachersData = [];
    for (let i = 0; i < teachers.length; i++) {
      let teacher = await User.find({ identity_number: teachers[i] });
      teachersData.push(teacher[0]);
    }
    res.status(200).json({ data: teachersData });
  }
);

exports.assignSpecificSubjectToTeachers = asyncHandler(
  async (req, res, next) => {
    const subjectID = await Subject.findById(req.params.subjectID);
    if (!subjectID) {
      return next(new ApiError("هذه المادة غير موجودة"));
    }
    for (let i = 0; i < req.body.teachersIDs.length; i++) {
      const teacherExists = await User.find({
        identity_number: req.body.teachersIDs[i],
      });
      if (teacherExists.length == 0) {
        return next(new ApiError("هناك معلم واحد على الاقل غير موجود"));
      }
    }
    subjectID.teachersIDs = req.body.teachersIDs;
    await subjectID.save();
    res.status(200).json({ message: "تم اضافة المعلمين الى هذه المادة" });
  }
);

exports.getSubjects = asyncHandler(async (req, res, next) => {
  const subjects = await Subject.find({}, { __v: false });
  res.status(200).json({ data: subjects });
});

exports.deleteClass = asyncHandler(async (req, res, next) => {
  const classExists = await Class.find({
    level_number: req.body.level_number,
    class_number: req.body.class_number,
  });
  if (classExists.length == 0) {
    return next(new ApiError("هذا الصف غير موجود"));
  }
  const levelEXists = await Level.find({
    level_number: classExists[0].level_number,
  });
  const numOfTeac = classExists[0].numberOfTeachers;
  const numOfStu = classExists[0].numberOfStudents;
  const classes = levelEXists[0].classes;
  const index = classes.indexOf(classExists[0].class_number);
  classes.splice(index, 1);
  await Level.findByIdAndUpdate(levelEXists[0]._id, {
    numberOfClasses: levelEXists[0].numberOfClasses - 1,
    numberOfTeachers: levelEXists[0].numberOfTeachers - numOfTeac,
    numberOfStudents: levelEXists[0].numberOfStudents - numOfStu,
    classes: classes,
  });
  await Class.findByIdAndDelete(classExists[0]._id);
  res.status(204).json();
});

// exports.deleteClass = asyncHandler(async (req, res, next) => {
//   const classExists = await Class.findOne({
//     level_number: req.body.level_number,
//     class_number: req.body.class_number,
//   });

//   if (!classExists) {
//     return next(new ApiError("هذا الصف غير موجود"));
//   }

//   await Class.findOneAndDelete({ _id: classExists._id });

//   res.status(204).json();
// });

// exports.getSpecificTeacher = asyncHandler(async (req, res, next) => {
//   const teacherExists = await User.find({
//     identity_number: req.params.identity_number,
//     role: "teacher",
//   });
//   if (teacherExists.length == 0) {
//     return next(new ApiError("هذا المعلم غير موجود"));
//   }
//   const teacher = await User.find({
//     identity_number: teacherExists[0].user_identity_number,
//   });
//   res.status(200).json({ data: teacher });
// });

// exports.getSpecificStudent = asyncHandler(async (req, res, next) => {
//   const studentExists = await Student.find({
//     user_identity_number: req.params.identity_number,
//   });
//   if (studentExists.length == 0) {
//     return next(new ApiError("هذا الطالب غير موجود"));
//   }
//   const student = await User.find({
//     identity_number: studentExists[0].user_identity_number,
//   });
//   res.status(200).json({ data: student });
// });




exports.getMyData = asyncHandler(async (req, res, next) => {
  const myData = await User.findById(req.user._id);
  res.status(200).json({ data: myData });
});

exports.deleteLevel = asyncHandler(async (req, res, next) => {
  // 1️⃣ التحقق مما إذا كان الليفل موجودًا
  const levelExists = await Level.findOne({
    level_number: req.body.level_number,
  });

  if (!levelExists) {
    return next(new ApiError("هذا المرحلة غير موجود", 404));
  }

  // 2️⃣ البحث عن جميع الكلاسات المرتبطة بهذا الليفل
  await Class.deleteMany({ level_number: req.body.level_number });

  // 3️⃣ حذف الليفل
  await Level.findByIdAndDelete(levelExists._id);

  res.status(204).json();
});

exports.getSpecificClass = asyncHandler(async (req, res, next) => {
  // البحث عن الصف
  const classExists = await Class.findOne({
    level_number: req.params.level_number,
    class_number: req.params.class_number,
  });

  if (!classExists) {
    return next(new ApiError("هذا الصف غير موجود", 404));
  }

  // البحث عن المواد المرتبطة بالصف
  const classSubjectExists = await ClassSubject.find({
    class_id: classExists._id,
  });
  let classSubjectData = [];

  if (classSubjectExists.length !== 0) {
    // جلب بيانات المواد والمعلمين باستخدام Promise.all
    classSubjectData = await Promise.all(
      classSubjectExists.map(async (classSubject) => {
        const subject = await Subject.findById(classSubject.subject_id);
        // البحث عن المعلم بناءً على identity_number
        const teacher = await User.findById(classSubject.teacher_id);
        const user = teacher
          ? await User.findOne({
              identity_number: teacher.identity_number,
            })
          : null; // جلب معلومات المستخدم

        return {
          classSubject_id: classSubject._id,
          classSubject_name: subject ? subject.subject_name : "",
          subject_id: subject ? subject._id : "",
          classSubject_teacher: user, // إرجاع كائن المستخدم بالكامل
        };
      })
    );
  }

  // جلب المواد المتاحة لهذا المستوى
  const availableSubjects = await Subject.find({
    levels: classExists.level_number,
  }).select("_id subject_name");

  res.status(200).json({
    data: classExists,
    classSubjectData,
    available_subjects: availableSubjects,
  });
});

exports.assignTeacherToClassSubject = asyncHandler(async (req, res, next) => {
  const classSubject = await ClassSubject.findById(req.params.classSubjectID);

  if (!classSubject) {
    return next(new ApiError("This ClassSubject Not Exists!"));
  }

  const newTeacher = await User.find({
    identity_number: req.body.identity_number,
  });

  if (newTeacher.length === 0) {
    return next(new ApiError("المعلم غير موجود"));
  }

  classSubject.teacher_id = newTeacher[0]._id; // إضافة ID المعلم
  await classSubject.save(); // حفظ التغييرات

  // إرسال استجابة ناجحة
  res.status(200).json({
    status: "success",
    message: "تمت إضافة المعلم بنجاح إلى المادة الدراسية.",
  });
});

exports.addMaterial = asyncHandler(async (req, res, next) => {
  await Material.create({
    classSubject_id: req.body.classSubject_id,
    file_url: req.body.file_url,
    type_file: req.body.type_file,
    name: req.body.name,
    uploaded_by: req.user._id,
  });
  res.status(201).json({ message: "تم رفع ملف جديد" });
});

exports.getMaterials = asyncHandler(async (req, res, next) => {
  const classSubjects = await ClassSubject.find({
    class_id: req.params.classId,
  });
  const classSubjects_ids = classSubjects.map((subject) => subject._id);
  const materials = await Material.find({
    classSubject_id: { $in: classSubjects_ids },
  }).sort({ createdAt: -1 });
  res.status(200).json(materials);
});

exports.deleteMaterials = asyncHandler(async (req, res, next) => {
  if (
    !req.body.materialIds ||
    !Array.isArray(req.body.materialIds) ||
    req.body.materialIds.length === 0
  ) {
    return next(new ApiError("يجب إرسال معرفات المواد للحذف", 400));
  }

  const existingMaterials = await Material.find({
    _id: { $in: req.body.materialIds },
  });

  const existingIds = existingMaterials.map((material) =>
    material._id.toString()
  );
  const nonExistentIds = req.body.materialIds.filter(
    (id) => !existingIds.includes(id)
  );

  if (nonExistentIds.length > 0) {
    return next(new ApiError(`هنالك ايدي على الاقل غير موجود!`, 404));
  }

  await Material.deleteMany({ _id: { $in: req.body.materialIds } });

  res.status(204).json();
});

exports.updateMaterial = asyncHandler(async (req, res, next) => {
  const material = await Material.findByIdAndUpdate(
    req.params.materialId,
    {
      name: req.body.name,
      file_url: req.body.file_url,
      updated_by: req.user._id,
    },
    { new: true }
  );

  if (!material) {
    return next(new ApiError("المادة غير موجودة", 404));
  }

  res.status(200).json({ message: "تم تحديث المادة بنجاح", data: material });
});

exports.addRecordedLecture = asyncHandler(async (req, res, next) => {
  const recordedLecture = await RecordedLecture.create({
    classSubject_id: req.body.classSubject_id,
    video_url: req.body.video_url,
    title: req.body.title,
    description: req.body.description,
    size: req.body.size,
    rating: req.body.rating,
    uploaded_by: req.user._id,
  });
  res
    .status(201)
    .json({ message: "تم رفع محاضرة جديدة", data: recordedLecture });
});

exports.getRecordedLectures = asyncHandler(async (req, res, next) => {
  const classSubjects = await ClassSubject.find({
    class_id: req.params.classId,
  });
  const classSubjects_ids = classSubjects.map((subject) => subject._id);
  const recordedLectures = await RecordedLecture.find({
    classSubject_id: { $in: classSubjects_ids },
  }).sort({ createdAt: -1 });
  res.status(200).json(recordedLectures);
});

exports.deleteRecordedLectures = asyncHandler(async (req, res, next) => {
  if (
    !req.body.recordedLecturesIds ||
    !Array.isArray(req.body.recordedLecturesIds) ||
    req.body.recordedLecturesIds.length === 0
  ) {
    return next(new ApiError("يجب إرسال معرفات المحاضرات للحذف", 400));
  }

  const existingRecordedLectures = await RecordedLecture.find({
    _id: { $in: req.body.recordedLecturesIds },
  });

  if (!existingRecordedLectures || existingRecordedLectures.length === 0) {
    return res
      .status(200)
      .json({ message: "لم يتم العثور على أي محاضرات للحذف" });
  }

  // حذف المحاضرات الموجودة
  for (const lecture of existingRecordedLectures) {
    await RecordedLecture.deleteOne({ _id: lecture._id });
  }

  res.status(200).json({
    message: `تم حذف ${existingRecordedLectures.length} محاضرة بنجاح مع التعليقات والردود`,
  });
});

exports.updateRecordedLecture = asyncHandler(async (req, res, next) => {
  const recordedLecture = await RecordedLecture.findByIdAndUpdate(
    req.params.recordedLecturesId,
    {
      title: req.body.title,
      description: req.body.description,
      video_url: req.body.video_url,
      updated_by: req.user._id,
    },
    { new: true }
  );

  if (!recordedLecture) {
    return next(new ApiError("المحاضرة غير موجودة", 404));
  }

  res
    .status(200)
    .json({ message: "تم تحديث بيانات المحاضرة بنجاح", data: recordedLecture });
});

exports.getRecordedLectureById = asyncHandler(async (req, res, next) => {
  const recordedLecture = await RecordedLecture.findById(
    req.params.recordedLectureId
  );

  if (!recordedLecture) {
    return next(new ApiError("المحاضرة غير موجودة", 404));
  }

  const classSubject = await ClassSubject.findById(
    recordedLecture.classSubject_id
  );

  if (!classSubject) {
    return next(new ApiError("المادة غير موجودة", 404));
  }

  const subjectData = await Subject.findById(classSubject.subject_id); // تأكد من وجود حقل subject_id في ClassSubject

  if (!subjectData) {
    return next(new ApiError("اسم المادة غير موجود", 404));
  }

  const userData = await User.findById(recordedLecture.uploaded_by).select(
    "first_name second_name third_name last_name profile_image"
  ); // استخدام findById بدلاً من find

  if (!userData) {
    return next(new ApiError("المعلم غير موجود", 404)); // تحقق من وجود بيانات المستخدم
  }

  res.status(200).json({
    recordedLectureData: recordedLecture,
    userData: userData,
    subject_name: subjectData.subject_name,
  });
});

exports.addRecordedLectureComment = asyncHandler(async (req, res, next) => {
  const comment = await RecordedLectureComments.create({
    content: req.body.content,
    recorded_lecture_id: req.body.recorded_lecture_id,
    user_id: req.user._id,
  });
  const userData = await User.findById(comment.user_id).select(
    "first_name second_name third_name last_name profile_image"
  );
  res.status(201).json({ commentData: comment, userData: userData });
});

exports.getRecordedLectureComments = asyncHandler(async (req, res, next) => {
  const comments = await RecordedLectureComments.find({
    recorded_lecture_id: req.params.recorded_lecture_id,
  });

  if (!comments || comments.length === 0) {
    return next(new ApiError("لا توجد تعليقات لهذه المحاضرة", 404));
  }

  comments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const commentsWithUserData = await Promise.all(
    comments.map(async (comment) => {
      const userData = await User.findById(comment.user_id).select(
        "first_name second_name third_name last_name profile_image"
      );
      return {
        _id: comment._id,
        recordedLecture_id: comment.recorded_lecture_id,
        user_id: comment.user_id,
        content: comment.content,
        createdAt: comment.createdAt,
        updatedAt: comment.updatedAt,
        userData: userData || null,
      };
    })
  );

  res.status(200).json(commentsWithUserData);
});

exports.updateRecordedLectureComment = asyncHandler(async (req, res, next) => {
  const recordedLectureComment =
    await RecordedLectureComments.findByIdAndUpdate(
      req.params.comment_id,
      {
        content: req.body.content,
      },
      { new: true }
    );

  if (!recordedLectureComment) {
    return next(new ApiError("التعليق غير موجود", 404));
  }

  res.status(200).json({
    message: "تم تحديث بيانات التعليق بنجاح",
    data: recordedLectureComment,
  });
});

exports.deleteRecordedLectureComment = asyncHandler(async (req, res, next) => {
  if (
    !req.body.commentsIds ||
    !Array.isArray(req.body.commentsIds) ||
    req.body.commentsIds.length === 0
  ) {
    return next(new ApiError("لا يوجد تعليقات للحذف", 400));
  }

  // Check if comments exist before deleting
  const existingComments = await RecordedLectureComments.find({
    _id: { $in: req.body.commentsIds },
  });

  if (existingComments.length === 0) {
    return res
      .status(404)
      .json({ message: "لم يتم العثور على التعليقات المحددة" });
  }

  // Delete comments
  const result = await RecordedLectureComments.deleteMany({
    _id: { $in: req.body.commentsIds },
  });

  if (result.deletedCount === 0) {
    return res.status(404).json({ message: "لا يوجد تعليقات للحذف" });
  }

  res.status(200).json({ message: `تم حذف ${result.deletedCount} تعليق(ات)` });
});

exports.addReplyToComment = asyncHandler(async (req, res, next) => {
  const reply = await RecordedLectureReplies.create({
    content: req.body.content,
    comment_id: req.body.comment_id,
    user_id: req.user._id,
  });
  const userData = await User.findById(reply.user_id).select(
    "first_name second_name third_name last_name profile_image"
  );
  res.status(201).json({ replyData: reply, userData: userData });
});

exports.getCommentReplies = asyncHandler(async (req, res, next) => {
  const replies = await RecordedLectureReplies.find({
    comment_id: req.params.comment_id,
  });

  if (!replies || replies.length === 0) {
    return next(new ApiError("لا توجد ردود لهذا التعليق", 404));
  }

  const repliesWithUserData = await Promise.all(
    replies.map(async (reply) => {
      const userData = await User.findById(reply.user_id).select(
        "first_name second_name third_name last_name profile_image"
      );
      return {
        _id: reply._id,
        comment_id: reply.comment_id,
        user_id: reply.user_id,
        content: reply.content,
        createdAt: reply.createdAt,
        updatedAt: reply.updatedAt,
        userData: userData || null,
      };
    })
  );

  res.status(200).json(repliesWithUserData);
});

exports.updateReply = asyncHandler(async (req, res, next) => {
  const reply = await RecordedLectureReplies.findByIdAndUpdate(
    req.params.reply_id,
    {
      content: req.body.content,
    },
    { new: true }
  );

  if (!reply) {
    return next(new ApiError("هذا الرد غير موجود", 404));
  }

  res.status(200).json({ message: "تم تعديل الرد بنجاح", data: reply });
});

exports.deleteReply = asyncHandler(async (req, res, next) => {
  await RecordedLectureReplies.findByIdAndDelete(req.params.reply_id);
  res.status(204).json();
});

exports.getClassStudents = asyncHandler(async (req, res, next) => {
  const students = await Student.find({ class_id: req.params.class_id });
  const identityNumbers = students.map(
    (student) => student.user_identity_number
  );
  const users = await User.find({ identity_number: { $in: identityNumbers } });
  res.status(200).json(users);
});

exports.assignStudentsToSpecificClass = asyncHandler(async (req, res, next) => {
  const { class_id, student_identity_numbers } = req.body;

  if (!class_id || !student_identity_numbers) {
    return res
      .status(400)
      .json({ success: false, message: "يجب إرسال معرفات الطلاب ورقم الصف" });
  }

  // Ensure student_identity_numbers is always an array
  const studentIdsArray = Array.isArray(student_identity_numbers)
    ? student_identity_numbers
    : [student_identity_numbers];

  // Fetch all students currently assigned to this class
  const currentlyAssignedStudents = await Student.find({ class_id });

  // Identify students to be **removed** (students in the class but not in the selected list)
  const studentsToRemove = currentlyAssignedStudents.filter(
    (student) => !studentIdsArray.includes(student.user_identity_number)
  );

  // Identify students to be **added** (students selected but not already in the class)
  const studentsToAdd = await Student.find({
    user_identity_number: { $in: studentIdsArray },
    class_id: { $ne: class_id }, // Only update if student is not already assigned
  });

  // **Remove students from class** (set `class_id` to null)
  if (studentsToRemove.length > 0) {
    await Student.updateMany(
      {
        user_identity_number: {
          $in: studentsToRemove.map((s) => s.user_identity_number),
        },
      },
      { $unset: { class_id: "" } } // ✅ Removes the `class_id`
    );
  }

  // **Add selected students to the class**
  if (studentsToAdd.length > 0) {
    await Student.updateMany(
      {
        user_identity_number: {
          $in: studentsToAdd.map((s) => s.user_identity_number),
        },
      },
      { $set: { class_id } }
    );
  }

  res.status(200).json({
    message: `تم تحديث طلاب الصف بنجاح`,
    addedStudents: studentsToAdd.map((student) => ({
      identity_number: student.user_identity_number,
      full_name: `${student.first_name} ${student.last_name}`,
    })),
    removedStudents: studentsToRemove.map((student) => ({
      identity_number: student.user_identity_number,
      full_name: `${student.first_name} ${student.last_name}`,
    })),
  });
});

exports.getLevelStudents = asyncHandler(async (req, res, next) => {
  const students = await Student.find({ level_number: req.params.level_number });

  if (students.length === 0) {
    return next(new ApiError("لا يوجد طلاب في هذه المرحلة", 404));
  }

  const identityNumbers = students.map(student => student.user_identity_number);
  const users = await User.find({ identity_number: { $in: identityNumbers } }).select(
    "_id identity_number first_name second_name third_name last_name"
  );

  const studentsWithUserData = students.map(student => {
    const userData = users.find(user => user.identity_number === student.user_identity_number);
    return {
      class_id: student.class_id || null, 
      _id: userData?._id || null, 
      identity_number: student.user_identity_number,
      first_name: userData?.first_name || null,
      second_name: userData?.second_name || null,
      third_name: userData?.third_name || null,
      last_name: userData?.last_name || null
    };
  });
  res.status(200).json(studentsWithUserData);
});



// ✅ 1. Add Class-Wide Announcement
exports.addClassAnnouncement = asyncHandler(async (req, res, next) => {
  const { content, class_id, file_url } = req.body;

  // Validate required fields
  if (!content || !class_id) {
    return next(
      new ApiError("Missing required fields: content, class_id", 400)
    );
  }

  // Fetch all classSubjects related to this class
  const classSubjects = await ClassSubject.find({ class_id });

  if (classSubjects.length === 0) {
    // If no classSubjects exist, create a general announcement for the class
    await Announcement.create({
      content,
      classSubject_id: null, // No specific subject
      user_id: req.user._id,
      file_url: file_url || null, // Ensure null if file_url is missing
    });
    return res.status(201).json({
      success: true,
      message: "Announcement created without class subjects.",
    });
  }

  // Create announcements for each classSubject
  for (const classSubject of classSubjects) {
    await Announcement.create({
      content,
      classSubject_id: classSubject._id,
      user_id: req.user._id,
      file_url: file_url || null, // Ensure null if file_url is missing
    });
  }

  res
    .status(201)
    .json({ success: true, message: "Announcements created successfully." });
});

// ✅ 2. Add Class Subject-Specific Announcement
exports.addClassSubjectAnnouncement = asyncHandler(async (req, res, next) => {
  const { content, classSubject_id, file_url } = req.body;

  // Validate classSubject exists
  const classSubject = await ClassSubject.findById(classSubject_id);
  if (!classSubject) {
    return next(new ApiError("Class subject not found", 404));
  }

  // Create the announcement
  await Announcement.create({
    content,
    classSubject_id,
    user_id: req.user._id,
    file_url,
  });

  res.status(201).json({ success: true });
});

exports.getClassAnnouncements = asyncHandler(async (req, res, next) => {
  const { class_id } = req.params;

  // Get all classSubjects for this class
  const classSubjects = await ClassSubject.find({ class_id });

  if (!classSubjects || classSubjects.length === 0) {
    return next(new ApiError("No subjects found for this class", 404));
  }

  // Extract IDs of classSubjects
  const classSubjectIds = classSubjects.map((subject) => subject._id);

  // Fetch announcements related to those classSubjects
  const announcements = await Announcement.find({
    classSubject_id: { $in: classSubjectIds },
  })
    .sort({ createdAt: -1 }) // Sort by latest first
    .populate("user_id", "first_name last_name") // Fetch user details
    .populate({
      path: "classSubject_id",
      populate: { path: "subject_id", select: "subject_name" }, // Fetch subject name
    });

  // Format response
  const formattedAnnouncements = announcements.map((announcement) => ({
    _id: announcement._id,
    user_id: announcement.user_id?._id || null,
    user_full_name: `${announcement.user_id?.first_name || "غير معروف"} ${
      announcement.user_id?.last_name || "غير معروف"
    }`,
    classSubject_id: announcement.classSubject_id?._id || null,
    classSubject_name:
      announcement.classSubject_id?.subject_id?.subject_name || "عام",
    content: announcement.content,
    file_url: announcement.file_url || null,
    createdAt: announcement.createdAt,
    updatedAt: announcement.updatedAt,
  }));

  res.status(200).json(formattedAnnouncements);
});

// ✅ 4. Get Teacher Announcements
exports.getTeacherAnnouncements = asyncHandler(async (req, res, next) => {
  const { user_id } = req.params; // Extract user_id from request params

  // Validate user_id
  if (!user_id) {
    return next(new ApiError("User ID is required", 400));
  }

  // Check if user exists
  const userExists = await User.findById(user_id);
  if (!userExists) {
    return next(new ApiError("User not found", 404));
  }

  // Fetch announcements posted by the given teacher
  const announcements = await Announcement.find({ user_id })
    .sort({ createdAt: -1 }) // Sort by latest first
    .populate("user_id", "first_name last_name") // Fetch user details
    .populate({
      path: "classSubject_id",
      populate: { path: "subject_id", select: "subject_name" }, // Fetch subject name
    });

  // Format response
  const formattedAnnouncements = announcements.map((announcement) => ({
    _id: announcement._id,
    user_id: announcement.user_id?._id || null,
    user_full_name: `${announcement.user_id?.first_name || "غير معروف"} ${
      announcement.user_id?.last_name || "غير معروف"
    }`,
    classSubject_id: announcement.classSubject_id?._id || null,
    classSubject_name:
      announcement.classSubject_id?.subject_id?.subject_name || "عام",
    content: announcement.content,
    file_url: announcement.file_url || null,
    createdAt: announcement.createdAt,
    updatedAt: announcement.updatedAt,
  }));

  res.status(200).json(formattedAnnouncements);
});

// ✅ 5. Update an Announcement
exports.updateAnnouncement = asyncHandler(async (req, res, next) => {
  const { announcement_id } = req.params;
  const { content, file_url } = req.body;

  // Validate announcement_id
  if (!announcement_id) {
    return next(new ApiError("Announcement ID is required", 400));
  }

  // Ensure at least one field is provided
  if (!content && !file_url) {
    return next(
      new ApiError(
        "At least one field (content or file_url) must be provided",
        400
      )
    );
  }

  // Update the announcement
  const updatedAnnouncement = await Announcement.findByIdAndUpdate(
    announcement_id,
    { $set: { content, file_url } },
    { new: true, runValidators: true }
  );

  // If announcement is not found
  if (!updatedAnnouncement) {
    return next(new ApiError("Announcement not found", 404));
  }

  res.status(200).json({ success: true, data: updatedAnnouncement });
});

exports.deleteAnnouncements = asyncHandler(async (req, res, next) => {
  const { announcements_ids } = req.body;

  // Validate request body
  if (
    !announcements_ids ||
    !Array.isArray(announcements_ids) ||
    announcements_ids.length === 0
  ) {
    return next(
      new ApiError(
        "Invalid request: announcements_ids must be a non-empty array",
        400
      )
    );
  }

  // Find existing announcements
  const existingAnnouncements = await Announcement.find({
    _id: { $in: announcements_ids },
  });

  // Extract valid IDs
  const existingIds = existingAnnouncements.map((ann) => ann._id.toString());
  const missingIds = announcements_ids.filter(
    (id) => !existingIds.includes(id)
  );

  // Delete only valid IDs
  if (existingIds.length > 0) {
    await Announcement.deleteMany({ _id: { $in: existingIds } });
  }

  res.status(200).json({
    success: true,
    deletedCount: existingIds.length,
    missingIds: missingIds.length > 0 ? missingIds : null,
    message:
      missingIds.length > 0
        ? "Some announcements were not found and were not deleted."
        : "All selected announcements deleted successfully.",
  });
});


exports.getSchoolStudents = asyncHandler(async (req, res, next) => {
  try {
    // ✅ 1. Fetch all students and populate class details
    const students = await Student.find()
      .populate({
        path: "class_id", 
        select: "class_number level_number", // Fetch class_number and level_number
      })
      .lean();

    if (!students.length) {
      return res.status(404).json({ message: "No students found" });
    }

    // ✅ 2. Fetch user data for students
    const studentIdentityNumbers = students.map(student => student.user_identity_number);
    const users = await User.find({ identity_number: { $in: studentIdentityNumbers } }).lean();

    // ✅ 3. Organize Data into Required Format
    const studentsData = students.map(student => {
      const userData = users.find(user => user.identity_number === student.user_identity_number) || {};
      
      return {
        userData,
        level_number: student.class_id?.level_number || null,
        class_number: student.class_id?.class_number || null,
      };
    });

    res.status(200).json({ status: "success", students: studentsData });
  } catch (error) {
    res.status(500).json({ status: "error", message: "Internal server error!" });
  }
});



exports.getSchoolStaff = asyncHandler(async (req, res, next) => {
  try {
    // ✅ 1. Fetch all staff members (teachers & manager assistants)
    const users = await User.find({
      role: { $in: ["teacher", "manager assistant"] },
    }).lean();

    if (!users.length) {
      return res
        .status(404)
        .json({ status: "error", message: "No staff members found!" });
    }

    const staffIds = users.map((user) => user._id);
    const staffIdentityNumbers = users.map((user) => user.identity_number); // Needed for Subject matching

    // ✅ 2. Fetch ClassSubjects (teaching assignments)
    const classSubjects = await ClassSubject.find({
      teacher_id: { $in: staffIds },
    })
      .populate("class_id", "class_number level_number")
      .populate("subject_id", "subject_name")
      .lean();

    // ✅ 3. Fetch Subjects where teacher identity is listed in `teachersIDs`
    const subjects = await Subject.find({
      teachersIDs: { $in: staffIdentityNumbers }, // Match teachers based on identity_number
    })
      .select("subject_name teachersIDs")
      .lean();

    if (!classSubjects.length && !subjects.length) {
      return res
        .status(200)
        .json({
          status: "success",
          staff: users.map((user) => ({ userData: user, teachingData: {} })),
        });
    }

    // ✅ 4. Organize Data into Required Format
    const staffData = users.map((user) => {
      const userClassSubjects = classSubjects.filter(
        (cs) => cs.teacher_id.toString() === user._id.toString()
      );

      // Extract subjects that the teacher is associated with
      const teacherSubjects = subjects
        .filter((subject) => subject.teachersIDs.includes(user.identity_number))
        .map((subject) => subject.subject_name);

      const teachingData = {
        subjects: teacherSubjects, // Add list of subjects assigned to the teacher
      };

      userClassSubjects.forEach((cs) => {
        if (!cs.class_id || !cs.subject_id) return; // Skip null values

        const levelNumber = cs.class_id.level_number;
        const classNumber = cs.class_id.class_number;
        const subjectData = {
          _id: cs.subject_id._id,
          classSubject_name: cs.subject_id.subject_name,
        };

        // Ensure level exists
        if (!teachingData[levelNumber]) {
          teachingData[levelNumber] = {};
        }

        // Ensure class exists within the level
        if (!teachingData[levelNumber][classNumber]) {
          teachingData[levelNumber][classNumber] = [];
        }

        // Push subject data into appropriate level/class structure
        teachingData[levelNumber][classNumber].push(subjectData);
      });

      return {
        userData: user,
        teachingData,
      };
    });

    res.status(200).json({ status: "success", staff: staffData });
  } catch (error) {
    res
      .status(500)
      .json({ status: "error", message: "Internal server error!" });
  }
});




// exports.addActivity = asyncHandler(async (req,res,next) => {
//   const activity = await Activity.create({
//     classSubject_id: req.body.classSubject_id,
//     available_at: req.body.available_at,
//     deadline: req.body.deadline,
//     description: req.body.description,
//     file_url: req.body.file_url,
//     full_grade: req.body.full_grade,
//     title: req.body.title,
//     activity_type: req.body.activity_type,
//     posted_by: req.user._id
//   })
//   res.status(201).json(activity)
// })

exports.addActivity = asyncHandler(async (req, res, next) => {
  let fileUrl = null;
  if (req.file) {
    fileUrl = `${req.protocol}://${req.get("host")}/uploads/activities/${req.file.filename}`;
  }

  const activity = await Activity.create({
    title: req.body.title,
    description: req.body.description,
    class_id: req.body.class_id,
    subject_id: req.body.subject_id,
    typeActivity: req.body.typeActivity,
    full_grade: req.body.full_grade,
    file_url: fileUrl, // ✅ حفظ رابط الملف
    available_at: req.body.available_at,
    deadline: req.body.deadline,
    posted_by: req.user._id,
  });

  res.status(201).json({
    message: "تم إنشاء النشاط بنجاح",
    data: activity,
  });
});


exports.getActivitiesByClass = asyncHandler(async (req, res, next) => {
  const { class_id } = req.params;

  const classSubjects = await ClassSubject.find({ class_id });

  if (classSubjects.length === 0) {
    return next(new ApiError("لا يوجد مواد دراسية لهذا الصف", 404));
  }

  const classSubjectIds = classSubjects.map(subject => subject._id);
  const activities = await Activity.find({ classSubject_id: { $in: classSubjectIds } });

  if (activities.length === 0) {
    return next(new ApiError("لا يوجد أنشطة لهذا الصف", 404));
  }

  // Fetch the number of students in the class from the Student collection
  const studentsCount = await Student.countDocuments({ class_id });

  // Fetch related subject names
  const subjectIds = classSubjects.map(cs => cs.subject_id);
  const subjects = await Subject.find({ _id: { $in: subjectIds } });

  // Map subject IDs to their names
  const subjectMap = {};
  subjects.forEach(subject => {
    subjectMap[subject._id] = subject.subject_name;
  });

  // Fetch submissions count for each activity
  const activityIds = activities.map(activity => activity._id);
  const submissions = await Submission.aggregate([
    { $match: { activity_id: { $in: activityIds } } },
    { $group: { _id: "$activity_id", count: { $sum: 1 } } }
  ]);

  // Map activity IDs to their submission count
  const submissionMap = {};
  submissions.forEach(sub => {
    submissionMap[sub._id] = sub.count;
  });

  // Fetch teacher details (name and profile image)
  const teacherIds = activities.map(activity => activity.posted_by);
  const teachers = await User.find({ _id: { $in: teacherIds } }).select(
    "first_name second_name third_name last_name profile_image"
  );

  // Map teacher IDs to their details
  const teacherMap = {};
  teachers.forEach(teacher => {
    teacherMap[teacher._id] = {
      first_name: teacher.first_name,
      second_name: teacher.second_name,
      third_name: teacher.third_name,
      last_name: teacher.last_name,
      profile_image: teacher.profile_image,
    };
  });

  // Calculate activity status and prepare the response
  const currentTime = new Date();
  const response = activities.map(activity => {
    let status;
    if (currentTime < activity.available_at) {
      status = "upcoming";
    } else if (currentTime >= activity.available_at && currentTime <= activity.deadline) {
      status = "active";
    } else {
      status = "finished";
    }

    return {
      ...activity._doc,
      activity_status: status,
      classSubject_name: subjectMap[classSubjects.find(cs => cs._id.equals(activity.classSubject_id))?.subject_id] || "غير معروف",
      submissions_count: submissionMap[activity._id] || 0,
      students_count: studentsCount, // Added class students count here
      posted_by_details: teacherMap[activity.posted_by] || {
        first_name: "غير معروف",
        second_name: "",
        third_name: "",
        last_name: "",
        profile_image: null,
      },
    };
  });

  res.status(200).json(response);
});



exports.getActivityById = asyncHandler(async (req, res, next) => {
  const { activity_id } = req.params;

  // Fetch the activity
  const activity = await Activity.findById(activity_id);
  if (!activity) {
    return next(new ApiError("النشاط غير موجود", 404));
  }

  // Fetch the ClassSubject for this activity
  const classSubject = await ClassSubject.findById(activity.classSubject_id);
  if (!classSubject) {
    return next(new ApiError("المادة الدراسية غير موجودة", 404));
  }

  // Fetch the number of students in the class from the Student collection
  const studentsCount = await Student.countDocuments({ class_id: classSubject.class_id });

  // Fetch subject name
  const subject = await Subject.findById(classSubject.subject_id);
  const classSubjectName = subject ? subject.subject_name : "غير معروف";

  // Fetch submissions count for the activity
  const submissionsCount = await Submission.countDocuments({ activity_id });

  // Fetch teacher details (name and profile image)
  const teacher = await User.findById(activity.posted_by).select(
    "first_name second_name third_name last_name profile_image"
  );

  const teacherDetails = teacher
    ? {
        first_name: teacher.first_name,
        second_name: teacher.second_name,
        third_name: teacher.third_name,
        last_name: teacher.last_name,
        profile_image: teacher.profile_image,
      }
    : {
        first_name: "غير معروف",
        second_name: "",
        third_name: "",
        last_name: "",
        profile_image: null,
      };

  // Calculate activity status
  const currentTime = new Date();
  let status;
  if (currentTime < activity.available_at) {
    status = "upcoming";
  } else if (currentTime >= activity.available_at && currentTime <= activity.deadline) {
    status = "active";
  } else {
    status = "finished";
  }

  // Construct response
  const response = {
    ...activity._doc,
    activity_status: status,
    classSubject_name: classSubjectName,
    submissions_count: submissionsCount,
    students_count: studentsCount,
    posted_by_details: teacherDetails,
  };

  res.status(200).json(response);
});


exports.updateActivity = asyncHandler(async (req, res, next) => {
  const active = await Activity.findByIdAndUpdate(req.params.activity_id, {
    title: req.body.title,
    description: req.body.description,
    file_url: req.body.file_url,
    available_at: req.body.available_at,
    deadline: req.body.deadline,
    full_grade: req.body.full_grade,
    activity_type: req.body.activity_type
  }, {new: true})

  res.status(200).json(active)
})
exports.deleteActivity = asyncHandler(async (req,res,next) => {
  await Activity.findByIdAndDelete(req.params.activity_id)
  res.status(204).json()
})


// exports.addSubmissionToActivity = asyncHandler(async (req,res,next) => {
//   const submission = await Submission.create({
//    activity_id: req.body.activity_id,
//    content: req.body.content,
//    file_url: req.body.file_url,
//    user_id: req.user._id   
//   })
//   res.status(201).json(submission)
// })

exports.addSubmissionToActivity = asyncHandler(async (req, res, next) => {
  try {
    console.log("📌 بيانات الطلب:", req.body);
    console.log("📌 الملف المرفوع:", req.file);

    let fileUrl = null;
    if (req.file) {
      fileUrl = `${req.protocol}://${req.get("host")}/uploads/submissions/${req.file.filename}`;
    }

    if (!req.body.user_identity_number || !req.body.activity_id || !req.body.classSubject_id) {
      return res.status(400).json({ status: "error", message: "يرجى إرسال جميع البيانات المطلوبة" });
    }

    const submission = await Submission.create({
      user_identity_number: req.body.user_identity_number,
      activity_id: req.body.activity_id,
      classSubject_id: req.body.classSubject_id,
      file_url: fileUrl, // ✅ حفظ رابط الملف
      grade: req.body.grade || null, // تأكد من أنها قيمة صحيحة
      feedback: req.body.feedback || "",
      gradedBy: req.body.gradedBy || null,
    });

    res.status(201).json({
      status: "success",
      message: "تم تسليم النشاط بنجاح",
      data: submission,
    });

  } catch (error) {
    console.error("❌ خطأ في addSubmission:", error);
    res.status(500).json({ status: "error", message: error.message });
  }
});


exports.addGradeToSubmission = asyncHandler(async (req, res, next) => {
  const submission = await Submission.findById(req.params.submission_id);

  if (!submission) {
    return next(new ApiError("هذا التسليم غير موجود", 404));
  }

  const submissionWithGrade = await Submission.findByIdAndUpdate(
    submission._id,
    {
      grade: req.body.grade,
      feedback: req.body.feedback,
      graded_by: req.user._id,
    },
    { new: true }
  );

  res.status(200).json(submissionWithGrade);
});


exports.getSubmissionsByActivity = asyncHandler(async (req, res, next) => {
  const { activity_id } = req.params;

  // Fetch submissions
  const submissions = await Submission.find({ activity_id });
  if (!submissions || submissions.length === 0) {
    return next(new ApiError("لا يوجد تسليمات حاليا", 404));
  }

  // Fetch user details for each submission
  const userIds = submissions.map(submission => submission.user_id);
  const users = await User.find({ _id: { $in: userIds } }).select(
    "first_name second_name third_name last_name profile_image identity_number"
  );

  // Map user details by ID for quick lookup
  const userMap = {};
  users.forEach(user => {
    userMap[user._id] = {
      first_name: user.first_name,
      second_name: user.second_name,
      third_name: user.third_name,
      last_name: user.last_name,
      profile_image: user.profile_image,
      identity_number: user.identity_number,
    };
  });

  // Enhance submission response with user details
  const response = submissions.map(submission => ({
    ...submission._doc,
    user_details: userMap[submission.user_id] || {
      first_name: "غير معروف",
      second_name: "",
      third_name: "",
      last_name: "",
      profile_image: null,
      identity_number: "غير متوفر",
    },
  }));

  res.status(200).json(response);
});

exports.updateSubmission = asyncHandler(async (req, res, next) => {
  const { grade, feedback } = req.body.newSubmission; // Extract new fields

  // Find the existing submission
  const submission = await Submission.findById(req.params.submission_id);
  if (!submission) {
    return next(new ApiError("هذا التسليم غير موجود", 404));
  }

  // Update fields
  submission.grade = grade ?? submission.grade; // Preserve existing values if not provided
  submission.feedback = feedback ?? submission.feedback;

  // Save changes
  const updatedSubmission = await submission.save();

  // Respond with updated submission
  res.status(200).json(updatedSubmission);
});


exports.deleteSubmissions = asyncHandler(async (req, res, next) => {
  const { submissionsIds } = req.body;

  if (!submissionsIds || !Array.isArray(submissionsIds) || submissionsIds.length === 0) {
    return next(new ApiError("يجب إرسال معرفات التسليمات للحذف", 400));
  }

  // Fetch submissions to check if they exist and ensure none are graded
  const submissions = await Submission.find({ _id: { $in: submissionsIds } });

  if (submissions.length === 0) {
    return next(new ApiError("لم يتم العثور على أي تسليمات للحذف", 404));
  }

  // Check if any submission has been graded
  const gradedSubmissions = submissions.filter(submission => submission.grade !== undefined);
  if (gradedSubmissions.length > 0) {
    return next(new ApiError("لا يمكن حذف بعض التسليمات لأنها تحتوي على درجات", 400));
  }

  // Proceed with deletion
  await Submission.deleteMany({ _id: { $in: submissionsIds } });

  res.status(204).json({ message: "تم حذف التسليمات بنجاح" });
});


// getClassGrades

exports.getClassGrades = asyncHandler(async (req, res, next) => {
  try {
    const { class_id } = req.params;
    if (!class_id) {
      return next(new ApiError("Class ID is required", 400));
    }

    // Fetch students in the class
    const students = await Student.find({ class_id });
    if (!students.length) {
      return res.status(404).json({ message: "No students found in this class." });
    }

    const studentIdentityNumbers = students.map((student) => student.user_identity_number);
    const users = await User.find({ identity_number: { $in: studentIdentityNumbers } })
      .select("_id identity_number first_name second_name third_name last_name");


    // Fetch related class subjects
    const classSubjects = await ClassSubject.find({ class_id }).select("_id");
    if (!classSubjects.length) {
      return res.status(404).json({ message: "No subjects found for this class." });
    }
    const classSubjectIds = classSubjects.map((cs) => cs._id);

    // Fetch activities related to these class subjects
    const activities = await Activity.find({ classSubject_id: { $in: classSubjectIds } })
      .select("_id activity_type full_grade");
    const activityIds = activities.map((a) => a._id.toString());


    // Fetch submissions for these activities
    const submissions = await Submission.find({ activity_id: { $in: activityIds } })
      .select("user_id activity_id grade");


    // Categorize activities
    let assignmentFullMark = 0, examFullMark = 0;
    const activityMap = {};
    activities.forEach(activity => {
      activityMap[activity._id.toString()] = activity;
      if (activity.activity_type === "Assignment") {
        assignmentFullMark += activity.full_grade;
      } else if (activity.activity_type === "Exam") {
        examFullMark += activity.full_grade;
      }
    });

    // Prepare response data
    const studentDataMap = {};
    students.forEach(student => {
      studentDataMap[student.user_identity_number] = {
        studentData: users.find(user => user.identity_number === student.user_identity_number) || {},
        grades_data: {
          assignments_totalGrades: 0,
          Exams_totalGrades: 0,
        },
        activity_grades: {},
      };
    });

    // Process submissions
    submissions.forEach(submission => {
      const student = studentDataMap[submission.user_id];
      if (!student) {
        return;
      }
      const activity = activityMap[submission.activity_id.toString()];
      if (!activity) {
        return;
      }

      if (activity.activity_type === "Assignment") {
        student.grades_data.assignments_totalGrades += submission.grade || 0;
      } else if (activity.activity_type === "Exam") {
        student.grades_data.Exams_totalGrades += submission.grade || 0;
      }
      student.activity_grades[submission.activity_id] = true;
    });

    // Calculate graded and ungraded activities
    let gradedActivities = 0, ungradedActivities = 0;
    activities.forEach(activity => {
      const hasGrades = submissions.some(sub => sub.activity_id.toString() === activity._id.toString());
      if (hasGrades) {
        gradedActivities++;
      } else {
        ungradedActivities++;
      }
    });

    // Finalize response
    const response = Object.values(studentDataMap).map(student => ({
      ...student,
      grades_data: {
        ...student.grades_data,
        assignments_fullMark: assignmentFullMark,
        Exams_fullMark: examFullMark,
      },
      activities_stats: {
        gradedActivities_number: gradedActivities,
        ungradedActivities_number: ungradedActivities,
      }
    }));

    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
});
