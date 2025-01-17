// submissionModel.js
const mongoose = require("mongoose");

const submissionSchema = new mongoose.Schema({
  user_identity_number: {
    type: String,
    ref: 'Student'
  },
  activity_id: {
    type: mongoose.Schema.ObjectId,
    ref: 'Activity',
  },
  file_url: String, // الملف الذي يرفعه الطالب
  grade: Number,
  feedback: String,
}, { timestamps: true });

const submissionModel = mongoose.model("Submission", submissionSchema);
module.exports = submissionModel;