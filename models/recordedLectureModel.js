const mongoose = require("mongoose");

const recordedLectureSchema = new mongoose.Schema(
  {
    title: String,
    class_id: {
      type: mongoose.Schema.ObjectId,
      ref: "Class",
    },
    subject_id: {
      type: mongoose.Schema.ObjectId,
      ref: "Subject",
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
  },
  { timestamps: true }
);

const recordedLectureModel = mongoose.model("RecordedLecture", recordedLectureSchema);
module.exports = recordedLectureModel;
