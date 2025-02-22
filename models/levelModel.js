const mongoose = require("mongoose");
const Subject = require("./subjectModel");
const Class = require("./classModel");
const ClassSubject = require("./subjectModel");

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

// قبل الحفظ: تحديد المواد المتاحة لهذا المستوى
levelSchema.pre("save", async function (next) {
  const subjects = await Subject.find();
  this.available_subjects = subjects
    .filter((subject) => subject.levels.includes(this.level_number))
    .map((subject) => subject.subject_name);

  this.numberOfClasses = this.classes.length;
  next();
});

// بعد الحفظ: إنشاء الفصول وربطها بالمواد المتاحة
levelSchema.post("save", async function () {
  for (let i = 0; i < this.classes.length; i++) {
    // إنشاء الكلاس
    const newClass = await Class.create({
      class_number: this.classes[i],
      level_number: this.level_number,
    });

    // جلب المواد المتاحة لهذا المستوى
    const subjects = await Subject.find({ subject_name: { $in: this.available_subjects } }).lean();

    // إنشاء ClassSubject فقط إذا كان subject_id غير فارغ
    for (const subject of subjects) {
      if (subject._id) {
        await ClassSubject.create({
          class_id: newClass._id,
          subject_id: subject._id,
        });
      }
    }
  }
});

const levelModel = mongoose.model("Level", levelSchema);
module.exports = levelModel;
