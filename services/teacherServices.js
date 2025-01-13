const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/apiError");
const RecordedLecture = require('../models/recordedLectureModel');
const Teacher = require('../models/teacherModel')
const Class = require('../models/classModel')
const User = require('../models/userModel')
const Announcement = require('../models/announcementModel')
const Material = require('../models/materialModel');
const multer = require("multer");
const path = require('path')
const { uploadSingleFile } = require('../middlewares/uploadFileMiddleware');
const sharp = require('sharp');
const { v4: uuidv4 } = require('uuid');


exports.addNewRecordedLecture = asyncHandler(async (req, res, next) => {
    await RecordedLecture.create({
        class_id: req.body.class_id,
        description: req.body.description,
        subject_id: req.body.subject_id,
        title: req.body.title,
        uploaded_by: req.user.identity_number,
        video_url: req.body.video_url
    })
    res.status(201).send({message: 'تم انشاء محاضرة جديدة'})
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