const validatorMiddleware = require('../../middlewares/validatorMiddleware')
const { check } = require("express-validator");


exports.addNewRecordedLectureValidator = [
    check("title").notEmpty().withMessage("Title Required"),
    check("class_id").notEmpty().withMessage("Class ID Required"),
    check("subject_id").notEmpty().withMessage("Subject ID Required"),
    check("description").notEmpty().withMessage("Description Required"),
    check("video_url").notEmpty().withMessage("Video URL Required"),
    check("views").optional(),
    check("rating").optional(),
    check("size").optional(),
    validatorMiddleware,
];

exports.addNewAnnouncementValidator = [
    check("content").notEmpty().withMessage("Content Required"),
    check("class_id").notEmpty().withMessage("Class ID Required"),
    check("subject_id").notEmpty().withMessage("Subject ID Required"),
    validatorMiddleware,
];

exports.addMaterialValidator = [
    check("name").notEmpty().withMessage("Name Required"),
    check("class_id").notEmpty().withMessage("Class ID Required"),
    check("subject_id").notEmpty().withMessage("Subject ID Required"),
    validatorMiddleware,
]

