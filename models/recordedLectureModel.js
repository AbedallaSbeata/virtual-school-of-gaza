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

// استخدام pre('deleteOne') بدلاً من pre('remove') عند استخدام delete
recordedLectureSchema.pre('deleteOne', async function(next) {
  try {
    const doc = await this.model.findOne(this.getQuery()); // الحصول على المحاضرة التي سيتم حذفها

    if (!doc) {
      return next(new Error("Lecture not found"));
    }

    // حذف الكومنتات المرتبطة بالمحاضرة
    await mongoose.model('RecordedLectureComment').deleteMany({
      recorded_lecture_id: doc._id
    });

    console.log(`Comments deleted for lecture with ID: ${doc._id}`);
    next();
  } catch (error) {
    next(error);
  }
});

const recordedLectureModel = mongoose.model("RecordedLecture", recordedLectureSchema);
module.exports = recordedLectureModel;
