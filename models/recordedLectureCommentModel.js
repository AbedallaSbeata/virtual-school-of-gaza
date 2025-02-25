const mongoose = require("mongoose");

const recordedLectureCommentSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
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
