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
}, {timestamps: true});



const classModel = mongoose.model("Class", classSchema);
module.exports = classModel;