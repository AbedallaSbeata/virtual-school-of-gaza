const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
  user_identity_number: {
    type: String,
    ref: 'User'
  },
  class_id: {
    type: mongoose.Schema.ObjectId,
    ref: 'Class'
  }
});

const studentModel = mongoose.model("Student", studentSchema);
module.exports = studentModel;
