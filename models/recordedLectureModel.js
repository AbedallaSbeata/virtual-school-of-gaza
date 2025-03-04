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

// تنفيذ الإجراءات قبل حذف المحاضرة
recordedLectureSchema.pre("deleteOne", { document: false, query: true }, async function (next) {
  try {
    const doc = await this.model.findOne(this.getFilter());

    if (!doc) {
      return next(new Error("Lecture not found"));
    }

    const recordedLectureId = doc._id;

    console.log(`Deleting comments and replies for lecture ID: ${recordedLectureId}`);

    // حذف جميع التعليقات المرتبطة بالمحاضرة
    const comments = await mongoose.model("RecordedLectureComment").find({ recorded_lecture_id: recordedLectureId });

    if (comments.length > 0) {
      const commentIds = comments.map((comment) => comment._id);

      // حذف جميع الردود المرتبطة بهذه التعليقات
      await mongoose.model("RecordedLectureReplie").deleteMany({ comment_id: { $in: commentIds } });

      // حذف جميع التعليقات المرتبطة بالمحاضرة
      await mongoose.model("RecordedLectureComment").deleteMany({ recorded_lecture_id: recordedLectureId });

      console.log(`Deleted ${comments.length} comments and their replies.`);
    } else {
      console.log("No comments found for this lecture.");
    }

    next();
  } catch (error) {
    console.error("Error deleting comments and replies:", error);
    next(error);
  }
});

const recordedLectureModel = mongoose.model("RecordedLecture", recordedLectureSchema);
module.exports = recordedLectureModel;
