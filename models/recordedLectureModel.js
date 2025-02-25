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
    rating: Number,
    size: Number,
    uploaded_by: {
      type: String,
      ref: "User",
    },
  },
  { timestamps: true }
);

const recordedLectureModel = mongoose.model(
  "RecordedLecture",
  recordedLectureSchema
);
module.exports = recordedLectureModel;
