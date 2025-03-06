const mongoose = require("mongoose");
const Subject = require("../models/subjectModel");
const ClassSubject = require("../models/classSubject");

const classSchema = new mongoose.Schema(
  {
    class_number: Number,
    level_number: {
      type: Number,
      ref: "Level",
    },
    numberOfStudents: {
      type: Number,
      default: 0,
    },
    numberOfTeachers: {
      type: Number,
      default: 0,
    },
    teachersIDs: [String],
    studentsIDs: [String],
  },
  { timestamps: true }
);

classSchema.post("save", async function () {
  const subjects = await Subject.find({ levels: this.level_number });

  for (const subject of subjects) {
    const exists = await ClassSubject.findOne({
      class_id: this._id,
      subject_id: subject._id,
    });

    if (!exists) {
      await ClassSubject.create({
        class_id: this._id,
        subject_id: subject._id,
      });
    }
  }
});


const classModel = mongoose.model("Class", classSchema);
module.exports = classModel;
