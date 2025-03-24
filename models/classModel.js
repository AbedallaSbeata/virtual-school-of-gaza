const mongoose = require("mongoose");
const Class = require("./classModel");
const Student = require("./studentModel"); // تأكد من استيراد موديل Student

const classSchema = new mongoose.Schema({
  class_number: Number,
  level_number: {
    type: Number,
    ref: "Level",
  },
}, { timestamps: true });

// ✅ قبل حذف الصف: تحديث جميع الطلاب المرتبطين بهذا الصف إلى NULL
classSchema.pre("findOneAndDelete", async function (next) {
  const classId = this.getQuery()._id;

  if (classId) {
    // تحديث جميع الطلاب المرتبطين بهذا الصف إلى NULL
    await Student.updateMany(
      { class_id: classId },
      { $set: { class_id: null } }
    );
  }

  next();
});

const classModel = mongoose.model("Class", classSchema);
module.exports = classModel;
