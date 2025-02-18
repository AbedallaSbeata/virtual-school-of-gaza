const mongoose = require("mongoose");
const Subject = require("./subjectModel");
const Class = require("./classModel");

const levelSchema = new mongoose.Schema({
  level_number: {
    type: Number,
    unique: true,
  },
  level_name: String,
  classes: [Number],
  available_subjects: [String],
  numberOfStudents: {
    type: Number,
    default: 0,
  },
  numberOfTeachers: {
    type: Number,
    default: 0,
  },
  numberOfClasses: {
    type: Number,
    default: 0,
  },
}, {timestamps:true});

levelSchema.pre("save", async function (next) {
  const documents = await Subject.find().countDocuments();
  for (let i = 0; i < documents; i++) {
    if ((await Subject.find()).at(i).levels.includes(this.level_number)) {
      this.available_subjects.push((await Subject.find()).at(i).subject_name);
    }
  }
  this.numberOfClasses = this.classes.length;
  next();
});

levelSchema.post("save", async function () {
  for (let i = 0; i < this.classes.length; i++) {
    await Class.create({
      class_number: this.classes[i],
      level_number: this.level_number,
    });
  }
});

const levelModel = mongoose.model("Level", levelSchema);
module.exports = levelModel;
