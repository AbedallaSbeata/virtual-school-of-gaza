const mongoose = require("mongoose");

const classSubjectSchema = new mongoose.Schema(
  {
    class_id: {
      type: mongoose.Schema.ObjectId,
      ref: "Class",
    },
    subject_id: {
      type: mongoose.Schema.ObjectId,
      ref: "Subject",
    },
    teacher_id: {
        type: mongoose.Schema.ObjectId,
        ref: 'Teacher' 
    }
  },
  { timestamps: true }
);

const classSubjectModel = mongoose.model("ClassSubject", classSubjectSchema);
module.exports = classSubjectModel;
