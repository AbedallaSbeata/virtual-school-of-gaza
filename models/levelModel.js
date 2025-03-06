const mongoose = require('mongoose')

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

// ✅ قبل الحفظ: تحديد المواد المتاحة لهذا المستوى
levelSchema.pre("save", async function (next) {
  const subjects = await Subject.find();
  this.available_subjects = subjects
    .filter((subject) => subject.levels.includes(this.level_number))
    .map((subject) => subject.subject_name);

  this.numberOfClasses = this.classes.length;
  next();
});

// ✅ بعد الحفظ: إنشاء الفصول ثم إنشاء ClassSubject لكل كلاس
levelSchema.post("save", async function () {
  const createdClasses = [];

  for (let i = 0; i < this.classes.length; i++) {
    const newClass = await Class.create({
      class_number: this.classes[i],
      level_number: this.level_number,
    });

    createdClasses.push(newClass._id);
  }

  // ✅ بعد إنشاء جميع الكلاسات، قم بإنشاء ClassSubject لكل مادة في كل كلاس
  for (const classId of createdClasses) {
    const subjects = await Subject.find({ levels: this.level_number });

    for (const subject of subjects) {
      await ClassSubject.create({
        class_id: classId,
        subject_id: subject._id,
      });
    }
  }
});

const levelModel = mongoose.model("Level", levelSchema);
module.exports = levelModel;
