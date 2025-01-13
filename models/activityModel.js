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
    enum: ['Exam', 'Assignment', 'Quiz']
  },
  full_grade: Number,
  file_url: String,
  available_at: Date,
  deadline: Date,
  posted_by: {
    type: String,
    ref: 'Teacher'
  }
}, {timestamps: true});

const activityModel = mongoose.model("Activity", activitySchema);
module.exports = activityModel;
