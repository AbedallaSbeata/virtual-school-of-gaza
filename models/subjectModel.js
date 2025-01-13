const mongoose = require("mongoose");

const subjectSchema = new mongoose.Schema({
  subject_name: {
    type: String,
    unique: true,
  },
  levels: [Number],
  teachersIDs: [String]
}, {timestamps: true});


const subjectModel = mongoose.model("Subject", subjectSchema);
module.exports = subjectModel;
