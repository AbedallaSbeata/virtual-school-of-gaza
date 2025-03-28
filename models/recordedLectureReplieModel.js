const mongoose = require("mongoose");

const recordedLectureReplieSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
    comment_id: {
      type: mongoose.Schema.ObjectId,
      ref: "RecordedLectureComment",
    },
    content: String,
  },
  { timestamps: true }
);

const recordedLectureReplieModel = mongoose.model(
  "RecordedLectureReplie",
  recordedLectureReplieSchema
);
module.exports = recordedLectureReplieModel;
