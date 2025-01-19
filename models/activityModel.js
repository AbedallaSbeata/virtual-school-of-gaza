// activityModel.js
const mongoose = require("mongoose");

const activitySchema = new mongoose.Schema({
  title: String,
  description: String,
  class_id: {
    type: mongoose.Schema.ObjectId,
    ref: 'Class'
  },
  subject_id: {
    type: mongoose.Schema.ObjectId,
    ref: 'Subject'
  },
  typeActivity: {
    type: String,
  },
  full_grade: Number,
  file_url: String, // الملف الذي يرفعه المعلم (إن وجد)
  available_at: Date,
  deadline: Date,
  posted_by: {
    type: String,
    ref: 'Teacher'
  },
  submissions: [{
    type: mongoose.Schema.ObjectId,
    ref: 'Submission'
  }]
}, { timestamps: true });

const activityModel = mongoose.model("Activity", activitySchema);
module.exports = activityModel;