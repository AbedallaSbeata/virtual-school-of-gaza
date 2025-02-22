// recordedLectureModel.js
const mongoose = require("mongoose");

const recordedLectureSchema = new mongoose.Schema(
  {
    title: String,
    classSubject_id: {
      type: mongoose.Schema.ObjectId,
      ref: "ClassSubject",
    },
    description: String,
    video_url: String,
    views: Number,
    rating: Number,
    size: Number,
    uploaded_by: {
      type: String,
      ref: "Teacher",
    },
    // إضافة حقل جديد لتخزين الطلاب الذين انضموا إلى المحاضرة
    enrolled_students: [
      {
        type: String,
        ref: "Student",
      },
    ],
  },
  { timestamps: true }
);

const recordedLectureModel = mongoose.model(
  "RecordedLecture",
  recordedLectureSchema
);
module.exports = recordedLectureModel;
