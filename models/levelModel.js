const mongoose = require("mongoose");
const Level = require("./levelModel");
const Student = require("./studentModel"); // تأكد من استيراد موديل Student

const levelSchema = new mongoose.Schema(
  {
    level_number: {
      type: Number,
      unique: true,
    },
    level_name: String,
    classes: [Number],
    available_subjects: [String],
    numberOfStudents: {
      type: Number,
      default: 0,
    },
    numberOfTeachers: {
      type: Number,
      default: 0,
    },
    numberOfClasses: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// ✅ قبل حذف المستوى: تحديث جميع الطلاب المرتبطين بهذا المستوى إلى NULL
levelSchema.pre("findOneAndDelete", async function (next) {
  const levelNumber = this.getQuery().level_number;

  if (levelNumber) {
    // تحديث جميع الطلاب المرتبطين بهذا المستوى إلى NULL
    await Student.updateMany(
      { level_number: levelNumber },
      { $set: { level_number: null } }
    );
  }

  next();
});

const levelModel = mongoose.model("Level", levelSchema);
module.exports = levelModel;
