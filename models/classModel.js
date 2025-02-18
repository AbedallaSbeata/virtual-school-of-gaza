const mongoose = require("mongoose");

const classSchema = new mongoose.Schema(
  {
    class_number: Number,
    level_number: {
      type: mongoose.Schema.ObjectId, // تغيير النوع إلى ObjectId
      ref: "Level", // الإشارة إلى مودل Level
    },
    numberOfStudents: {
      type: Number,
      default: 0,
    },
    numberOfTeachers: {
      type: Number,
      default: 0,
    },
    teachersIDs: [{
      type: mongoose.Schema.ObjectId, // استخدام ObjectId للمعرفات
      ref: "User", // الإشارة إلى مودل المستخدمين (إذا كنت تستخدم مودل User)
    }],
    studentsIDs: [{
      type: mongoose.Schema.ObjectId, // استخدام ObjectId بدلاً من String
      ref: "User",
    }],
  },
  { timestamps: true }
);

const Class = mongoose.model("Class", classSchema);
module.exports = Class;
