const mongoose = require("mongoose");
const Subject = require("./subjectModel");
const Class = require("./classModel");

const levelSchema = new mongoose.Schema(
  {
    level_number: {
      type: Number,
      unique: true,
    },
    level_name: String,
    classes: [{
      type: mongoose.Schema.ObjectId,
      ref: "Class",
    }],
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

levelSchema.pre("save", async function (next) {
  try {
    // جلب المواد التي تحتوي على هذا المستوى
    const subjects = await Subject.find({ levels: this.level_number });

    // استخراج أسماء المواد وإضافتها
    this.available_subjects = subjects.map((subject) => subject.subject_name);

    // البحث عن الكلاسات وتحويل الأرقام إلى ObjectId
    const classIds = await Class.find({ class_number: { $in: this.classes } }).select("_id");

    this.classes = classIds.map((cls) => cls._id);

    // تحديث عدد الكلاسات
    this.numberOfClasses = this.classes.length;

    next();
  } catch (error) {
    next(error);
  }
});

levelSchema.post("save", async function () {
  try {
    for (const classId of this.classes) {
      await Class.findByIdAndUpdate(classId, { level_number: this.level_number });
    }
  } catch (error) {
    console.error("Error updating classes with level_number:", error);
  }
});

const Level = mongoose.model("Level", levelSchema);
module.exports = Level;
