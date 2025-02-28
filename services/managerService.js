const User = require("../models/userModel");
const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/apiError");
const Level = require("../models/levelModel");
const Subject = require("../models/subjectModel");
const Class = require("../models/classModel");
const Teacher = require("../models/teacherModel");
const Student = require("../models/studentModel");
const ApiFeatures = require("../utils/apiFeatures");
const createToken = require("../utils/createToken");
const ClassSubject = require("../models/classSubject");
const Material = require("../models/materialModel");
const RecordedLecture = require("../models/recordedLectureModel");
const RecordedLectureComments = require("../models/recordedLectureCommentModel");
const RecordedLectureReplies = require("../models/recordedLectureReplieModel");
const Announcement = require("../models/announcementModel");
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
  res.send({ data: user, token });
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
    res.status(200).send({ data: teachersData });
  }
);

exports.assignSpecificSubjectToTeachers = asyncHandler(
  async (req, res, next) => {
    const subjectID = await Subject.findById(req.params.subjectID);
    if (!subjectID) {
      return next(new ApiError("هذه المادة غير موجودة"));
    }
    for (let i = 0; i < req.body.teachersIDs.length; i++) {
      const teacherExists = await Teacher.find({
        user_identity_number: req.body.teachersIDs[i],
      });
      if (teacherExists.length == 0) {
        return next(new ApiError("هناك معلم واحد على الاقل غير موجود"));
      }
    }
    subjectID.teachersIDs = req.body.teachersIDs;
    await subjectID.save();
    res.status(200).send({ message: "تم اضافة المعلمين الى هذه المادة" });
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

exports.getSpecificTeacher = asyncHandler(async (req, res, next) => {
  const teacherExists = await Teacher.find({
    user_identity_number: req.params.identity_number,
  });
  if (teacherExists.length == 0) {
    return next(new ApiError("هذا المعلم غير موجود"));
  }
  const teacher = await User.find({
    identity_number: teacherExists[0].user_identity_number,
  });
  res.status(200).send({ data: teacher });
});

exports.getSpecificStudent = asyncHandler(async (req, res, next) => {
  const studentExists = await Student.find({
    user_identity_number: req.params.identity_number,
  });
  if (studentExists.length == 0) {
    return next(new ApiError("هذا الطالب غير موجود"));
  }
  const student = await User.find({
    identity_number: studentExists[0].user_identity_number,
  });
  res.status(200).send({ data: student });
});

exports.getTeachers = asyncHandler(async (req, res, next) => {
  const teachers = await User.find().where({ role: "teacher" });
  res.status(200).send({ data: teachers });
});

exports.getStudents = asyncHandler(async (req, res, next) => {
  const students = await User.find().where({ role: "student" });
  res.status(200).send({ data: students });
});

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
  res.status(201).send({ message: "تم رفع ملف جديد" });
});

exports.getMaterials = asyncHandler(async (req, res, next) => {
  const classSubjects = await ClassSubject.find({
    class_id: req.params.classId,
  });
  const classSubjects_ids = classSubjects.map((subject) => subject._id);
  const materials = await Material.find({
    classSubject_id: { $in: classSubjects_ids },
  }).sort({ createdAt: -1 });
  res.status(200).send(materials);
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
    .send({ message: "تم رفع محاضرة جديدة", data: recordedLecture });
});

exports.getRecordedLectures = asyncHandler(async (req, res, next) => {
  const classSubjects = await ClassSubject.find({
    class_id: req.params.classId,
  });
  const classSubjects_ids = classSubjects.map((subject) => subject._id);
  const recordedLectures = await RecordedLecture.find({
    classSubject_id: { $in: classSubjects_ids },
  }).sort({ createdAt: -1 });
  res.status(200).send(recordedLectures);
});

exports.deleteRecordedLectures = asyncHandler(async (req, res, next) => {
  if (
    !req.body.recordedLecturesIds ||
    !Array.isArray(req.body.recordedLecturesIds) ||
    req.body.recordedLecturesIds.length === 0
  ) {
    return next(new ApiError("يجب إرسال معرفات المواد للحذف", 400));
  }

  const existingRecordedLectures = await RecordedLecture.find({
    _id: { $in: req.body.recordedLecturesIds },
  });

  const existingIds = existingRecordedLectures.map((recordedLecture) =>
    recordedLecture._id.toString()
  );
  const nonExistentIds = req.body.recordedLecturesIds.filter(
    (id) => !existingIds.includes(id)
  );

  if (nonExistentIds.length > 0) {
    return next(new ApiError(`هنالك ايدي على الاقل غير موجود!`, 404));
  }

  await RecordedLecture.deleteMany({
    _id: { $in: req.body.recordedLecturesIds },
  });

  res.status(204).json();
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
  console.log("Incoming Request Body:", req.body); 
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
    return res.status(404).json({ message: "لم يتم العثور على التعليقات المحددة" });
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

  console.log("Incoming Request:", { class_id, student_identity_numbers });

  if (!class_id || !student_identity_numbers || student_identity_numbers.length === 0) {
    return res.status(400).json({ success: false, message: "يجب إرسال معرفات الطلاب ورقم الصف" });
  }

  // Ensure student_identity_numbers is always an array
  const studentIdsArray = Array.isArray(student_identity_numbers) ? student_identity_numbers : [student_identity_numbers];

  console.log("Student IDs to Update:", studentIdsArray);

  // Check if students exist before updating
  const existingStudents = await Student.find({ user_identity_number: { $in: studentIdsArray } });

  if (existingStudents.length === 0) {
    return next(new ApiError("لم يتم العثور على أي طلاب بهذه المعرفات.", 404));
  }

  console.log("Matching Students Found in Database:", existingStudents.length);

  // Get students who are already assigned to this class
  const alreadyAssignedStudents = existingStudents.filter(student => student.class_id?.toString() === class_id);

  // Get students who need to be updated
  const studentsToUpdate = existingStudents.filter(student => student.class_id?.toString() !== class_id);

  if (studentsToUpdate.length === 0) {
    return res.status(200).json({ message: "لم يتم إجراء أي تغييرات، جميع الطلاب موجودون بالفعل في هذا الصف" });
  }

  // Update only students who are not already in this class
  const updateResult = await Student.updateMany(
    { user_identity_number: { $in: studentsToUpdate.map(student => student.user_identity_number) } },
    { $set: { class_id } }
  );

  console.log("Update Result:", updateResult);

  if (updateResult.modifiedCount === 0) {
    return next(new ApiError("لم يتم تحديث أي طالب، تأكد من صحة البيانات", 400));
  }

  res.status(200).json({
    message: `تم تعيين ${updateResult.modifiedCount} طالب(ة) إلى هذا الصف بنجاح`,
    updatedStudents: studentsToUpdate.map(student => ({
      identity_number: student.user_identity_number,
      full_name: `${student.first_name} ${student.last_name}`,
    })),
    alreadyAssignedStudents: alreadyAssignedStudents.map(student => ({
      identity_number: student.user_identity_number,
      full_name: `${student.first_name} ${student.last_name}`,
    })),
  });
});



exports.getLevelStudents = asyncHandler(async (req, res, next) => {
  const classes = await Class.find({ level_number: req.params.level_number });
  if (classes.length === 0) {
    return next(new ApiError("لا يوجد صفوف لهذه المرحلة", 404));
  }
  const classesIds = classes.map((classObj) => classObj._id);
  const students = await Student.find({ class_id: { $in: classesIds } });
  if (students.length === 0) {
    return next(new ApiError("لا يوجد طلاب في هذه المرحلة", 404));

  }
  const identity_numbers = students.map(
    (student) => student.user_identity_number
  );
  const users = await User.find({ identity_number: { $in: identity_numbers } });
  res.status(200).json(users);
});

exports.addAnnouncement = asyncHandler(async (req, res, next) => {
  const announcement = await Announcement.create({
    content: req.body.content,
    classSubject_id: req.body.classSubject_id,
    user_id: req.user._id,
  });
  res.status(201).send({ message: "تم انشاء اعلان جديد", data: announcement });
});

exports.getClassSubjectAnnouncements = asyncHandler(async (req, res, next) => {
  const announcements = await Announcement.find({classSubject_id: req.params.classSubject_id})
  if(!announcements) {
    return next(new ApiError("لا يوجد اعلانات", 404));
  }
  res.status(200).json(announcements)
})

exports.updateAnnouncement = asyncHandler(async (req, res, next) => {
  const announcement = await Announcement.findByIdAndUpdate(req.params.announcement_id, {
    content: req.body.content
  }, {new: true})
  if(!announcement) {
    return next(new ApiError("هذا الاعلان غير موجود",404))
  }
  res.status(200).json({message: "تم تحديث البيانات بنجاح", data: announcement})
})

exports.deleteAnnouncement = asyncHandler(async (req, res, next) => {
  await Announcement.findByIdAndDelete(req.params.announcement_id);
  res.status(204).json();
});
