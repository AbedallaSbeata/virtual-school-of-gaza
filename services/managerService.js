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
  await Class.create(req.body);
  await Level.findByIdAndUpdate(levelEXists[0]._id, {
    numberOfClasses: levelEXists[0].numberOfClasses + 1,
    classes: classes,
  });
  res.status(201).json({ message: "تم اضافة هذا الصف بنجاح" });
});

exports.addTeachersToSpecificClass = asyncHandler(async (req, res, next) => {
  const classExists = await Class.find({
    class_number: req.body.class_number,
    level_number: req.body.level_number,
  });
  if (classExists.length == 0) {
    return next(new ApiError("لا يوجد صف يحتوي على هذه المعلومات"));
  }
  for (let i = 0; i < req.body.teachersIDs.length; i++) {
    const teacherExists = await Teacher.find({
      user_identity_number: req.body.teachersIDs[i],
    });
    if (teacherExists.length == 0) {
      return next(new ApiError("هناك معلم واحد على الاقل غير موجود"));
    }
  }
  for (let i = 0; i < req.body.teachersIDs.length; i++) {
    classExists[0].teachersIDs.push(req.body.teachersIDs[i]);
  }
  const levelEXists = await Level.find({
    level_number: classExists[0].level_number,
  });

  for (let i = 0; i < req.body.teachersIDs.length; i++) {
    let teacherExists = await Teacher.find({
      user_identity_number: req.body.teachersIDs[i],
    });
    teacherExists[0].classes_ids.push(classExists[0]._id);
    await teacherExists[0].save();
  }
  await Level.findByIdAndUpdate(levelEXists[0]._id, {
    numberOfTeachers:
      levelEXists[0].numberOfTeachers + req.body.teachersIDs.length,
  });
  classExists[0].numberOfTeachers = classExists[0].teachersIDs.length;

  await classExists[0].save();
  res.status(201).json({ message: "تم اضافة المعلمين الى هذا الصف بنجاح" });
});

exports.addStudentsToSpecificClass = asyncHandler(async (req, res, next) => {
  const classExists = await Class.find({
    class_number: req.body.class_number,
    level_number: req.body.level_number,
  });
  if (classExists.length == 0) {
    return next(new ApiError("لا يوحد صف يحتوي على هذه المعلومات"));
  }
  for (let i = 0; i < req.body.studentsIDs.length; i++) {
    const studentExists = await Student.find({
      user_identity_number: req.body.studentsIDs[i],
    });
    if (studentExists.length == 0) {
      return next(new ApiError("هناك طالب واحد على الاقل غير موجود"));
    }
  }
  for (let i = 0; i < req.body.studentsIDs.length; i++) {
    classExists[0].studentsIDs.push(req.body.studentsIDs[i]);
  }
  const levelEXists = await Level.find({
    level_number: classExists[0].level_number,
  });
  for (let i = 0; i < req.body.studentsIDs.length; i++) {
    let studentExists = await Student.find({
      user_identity_number: req.body.studentsIDs[i],
    });
    studentExists[0].class_id = classExists[0]._id;
    await studentExists[0].save();
  }
  await Level.findByIdAndUpdate(levelEXists[0]._id, {
    numberOfStudents:
      levelEXists[0].numberOfStudents + req.body.studentsIDs.length,
  });
  classExists[0].numberOfStudents = classExists[0].studentsIDs.length;
  await classExists[0].save();
  res.status(201).json({ message: "تم اضافة الطلاب الى هذا الصف بنجاح" });
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
  const levelsLength = await Level.countDocuments();
  const apiFeatures = new ApiFeatures(Level.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate(levelsLength);

  const { mongooseQuery, paginationResult } = apiFeatures;
  const levels = await mongooseQuery;
  res
    .status(200)
    .json({ results: levels.length, paginationResult, data: levels });
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
  const classesLength = await Class.countDocuments();
  const apiFeatures = new ApiFeatures(
    Class.find(
      { level_number: req.params.level_number },
      { _id: false, __v: false }
    ),
    req.query
  )
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

exports.addSpecificSubjectToTeachers = asyncHandler(async (req, res, next) => {
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
  for (let i = 0; i < req.body.teachersIDs.length; i++) {
    const teacherExists = await Teacher.find({
      user_identity_number: req.body.teachersIDs[i],
    });
    teacherExists[0].teacher_subjects.push(subjectID.subject_name);
    subjectID.teachersIDs.push(req.body.teachersIDs[i]);
    await teacherExists[0].save();
  }
  await subjectID.save();
  res.status(200).send({ message: "تم اضافة المعلمين الى هذه المادة" });
});

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
  res.send({ message: "تم حذف هذا الصف بنجاح" });
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
