const mongoose = require("mongoose");

const examSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  classSubject_id: {
    type: mongoose.Schema.ObjectId,
    ref: 'ClassSubject',
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

const examModel = mongoose.model("Exam", examSchema);
module.exports = examModel;