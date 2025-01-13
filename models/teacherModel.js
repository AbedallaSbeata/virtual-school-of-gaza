const mongoose = require("mongoose");

const teacherSchema = new mongoose.Schema({
  user_identity_number: {
    type: String,
    ref: 'User'
  },
  classes_ids: {
    type: [mongoose.Schema.ObjectId],
    ref: 'Class'
  },
  teacher_subjects: {
    type: [String],
    ref: 'Subject'
  }
});

const teacherModel = mongoose.model("Teacher", teacherSchema);
module.exports = teacherModel;
