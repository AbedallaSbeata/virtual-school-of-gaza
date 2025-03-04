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

recordedLectureSchema.pre('deleteOne', { document: false, query: true }, async function(next) {
  try {
    const doc = await this.model.findOne(this.getFilter()); // جلب بيانات المحاضرة قبل الحذف

    if (!doc) {
      return next(new Error("Lecture not found"));
    }

    const recordedLectureId = doc._id;

    const comments = await mongoose.model('RecordedLectureComment').find({ recorded_lecture_id: recordedLectureId });

    const commentIds = comments.map(comment => comment._id);

    // حذف الردود المرتبطة بهذه التعليقات
    await mongoose.model('RecordedLectureReplie').deleteMany({ comment_id: { $in: commentIds } });

    // حذف التعليقات نفسها
    await mongoose.model('RecordedLectureComment').deleteMany({ recorded_lecture_id: recordedLectureId });

    console.log(`Deleted comments and replies for lecture ID: ${recordedLectureId}`);
    next();
  } catch (error) {
    next(error);
  }
});

const recordedLectureModel = mongoose.model("RecordedLecture", recordedLectureSchema);
module.exports = recordedLectureModel;
