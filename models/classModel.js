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
  },
  { timestamps: true }
);

// ✅ بعد الحفظ: إنشاء ClassSubject فقط إذا لم يكن موجودًا مسبقًا
classSchema.post("save", async function () {
  const subjects = await Subject.find({ levels: this.level_number });

  for (const subject of subjects) {
    const exists = await ClassSubject.findOne({
      class_id: this._id,
      subject_id: subject._id,
    });

    if (!exists) {
      await ClassSubject.create({
        class_id: this._id,
        subject_id: subject._id,
      });
    }
  }
});

// ✅ قبل حذف الصف: حذف جميع ClassSubject المرتبطة به
classSchema.pre("findOneAndDelete", async function (next) {
  const classId = this.getQuery()._id;

  if (classId) {
    await ClassSubject.deleteMany({ class_id: classId });
  }

  next();
});

const classModel = mongoose.model("Class", classSchema);
module.exports = classModel;
