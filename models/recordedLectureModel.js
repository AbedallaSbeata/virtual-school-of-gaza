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
    updated_by: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

recordedLectureSchema.pre('remove', async function(next) {
  try {
    await mongoose.model('RecordedLectureComment').deleteMany({
      recorded_lecture_id: this._id
    });

    next();
  } catch (error) {
    next(error);
  }
});

const recordedLectureModel = mongoose.model("RecordedLecture", recordedLectureSchema);
module.exports = recordedLectureModel;
