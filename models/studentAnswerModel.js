const mongoose = require("mongoose");

const studentAnswerSchema = new mongoose.Schema({
  exam_id: {
    type: mongoose.Schema.ObjectId,
    ref: 'Exam',
    required: true,
  },
  student_id: {
    type: String,
    ref: 'Student',
    required: true,
  },
  answers: [
    {
      question_id: {
        type: mongoose.Schema.ObjectId,
        required: true,
      },
      answer: {
        type: String,
        required: true,
      },
    },
  ],
  total_grade: {
    type: Number,
    default: 0,
  },
}, { timestamps: true });

const StudentAnswer = mongoose.model("StudentAnswer", studentAnswerSchema);
module.exports = StudentAnswer;