const mongoose = require("mongoose");

const gradeSchema = new mongoose.Schema({
  student_id: {
    type: String,
    ref: 'Student',
    required: true,
  },
  subject_id: {
    type: mongoose.Schema.ObjectId,
    ref: 'Subject',
    required: true,
  },
  class_id: {
    type: mongoose.Schema.ObjectId,
    ref: 'Class',
    required: true,
  },
  grade: {
    type: Number,
    required: true,
  },
  teacher_id: {
    type: String,
    ref: 'Teacher',
    required: true,
  },
}, { timestamps: true });

const Grade = mongoose.model("Grade", gradeSchema);
module.exports = Grade;