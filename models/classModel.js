const mongoose = require("mongoose");
const Subject = require("../models/subjectModel");
const ClassSubject = require("../models/classSubject");

const classSchema = new mongoose.Schema(
  {
    class_number: Number,
    level_number: {
      type: Number,
      ref: "Level",
    },
    numberOfStudents: {
      type: Number,
      default: 0,
    },
    numberOfTeachers: {
      type: Number,
      default: 0,
    },
    teachersIDs: [String],
    studentsIDs: [String],
  },
  { timestamps: true }
);

// بعد الحفظ: إنشاء ClassSubject لكل مادة مرتبطة بالمستوى
classSchema.post("save", async function () {
  // جلب المواد الخاصة بهذا المستوى
  const subjects = await Subject.find({ levels: this.level_number });

  // إنشاء ClassSubject لكل مادة
  for (const subject of subjects) {
    await ClassSubject.create({
      class_id: this._id,
      subject_id: subject._id,
    });
  }
});

const classModel = mongoose.model("Class", classSchema);
module.exports = classModel;
