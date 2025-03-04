// activityModel.js
const mongoose = require("mongoose");

const activitySchema = new mongoose.Schema({
  title: String,
  description: String,
  classSubject_id: {
    type: mongoose.Schema.ObjectId,
    ref: 'ClassSubject'
  },
  activity_type: {
    type: String,
    enum: ["Exam", "Assignment"]
  },
  full_grade: Number,
  file_url: String, 
  available_at: Date,
  deadline: Date,
  posted_by: {
    type: String,
    ref: 'User'
  },
}, { timestamps: true });

const activityModel = mongoose.model("Activity", activitySchema);
module.exports = activityModel;