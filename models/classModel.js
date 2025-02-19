const mongoose = require("mongoose");
const Subject = require('../models/subjectModel')

const classSchema = new mongoose.Schema({
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
  available_subjects: [String],
}, {timestamps: true});

classSchema.pre("save", async function (next) {
  const documents = await Subject.find().countDocuments();
  for (let i = 0; i < documents; i++) {
    if ((await Subject.find()).at(i).levels.includes(this.level_number)) {
      this.available_subjects.push((await Subject.find()).at(i).subject_name);
    }
  }
  this.numberOfClasses = this.classes.length;
  next();
});

const classModel = mongoose.model("Class", classSchema);
module.exports = classModel;
