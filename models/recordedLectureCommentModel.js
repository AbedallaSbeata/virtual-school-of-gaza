const mongoose = require("mongoose");

const recordedLectureCommentSchema = new mongoose.Schema(
  {
    user_identity_number: {
      type: String,
      ref: "User",
    },
    classSubject_id: {
      type: mongoose.Schema.ObjectId,
      ref: "ClassSubject",
    },
    recorded_lecture_id: {
      type: mongoose.Schema.ObjectId,
      ref: "RecordedLecture",
    },
    content: String,
  },
  { timestamps: true }
);

const recordedLectureCommentModel = mongoose.model(
  "RecordedLectureComment",
  recordedLectureCommentSchema
);
module.exports = recordedLectureCommentModel;
