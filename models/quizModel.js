const mongoose = require("mongoose");

const quizSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  class_id: {
    type: mongoose.Schema.ObjectId,
    ref: 'Class',
    required: true,
  },
  subject_id: {
    type: mongoose.Schema.ObjectId,
    ref: 'Subject',
    required: true,
  },
  questions: [
    {
      questionText: {
        type: String,
        required: true,
      },
      options: [
        {
          type: String,
          required: true,
        },
      ],
      correctAnswer: {
        type: String,
        required: true,
      },
      questionGrade: {
        type: Number,
        required: true,
      },
    },
  ],
  full_grade: {
    type: Number,
    required: true,
  },
  available_at: {
    type: Date,
    required: true,
  },
  deadline: {
    type: Date,
    required: true,
  },
  posted_by: {
    type: String,
    ref: 'Teacher',
    required: true,
  },
}, { timestamps: true });

const quizModel = mongoose.model("Quiz", quizSchema);
module.exports = quizModel;