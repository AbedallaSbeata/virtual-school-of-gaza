const mongoose = require("mongoose");
const Subject = require("./subjectModel");
const Class = require("./classModel");
const Student = require("./studentModel");

const levelSchema = new mongoose.Schema(
  {
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
  },
  { timestamps: true }
);

levelSchema.pre("save", async function (next) {
  const subjects = await Subject.find();
  this.available_subjects = subjects
    .filter((subject) => subject.levels.includes(this.level_number))
    .map((subject) => subject.subject_name);

  this.numberOfClasses = this.classes.length;

  const existingLevel = await this.constructor.findOne({ level_number: this.level_number });
  if (existingLevel) {
    const removedClasses = existingLevel.classes.filter(
      (classNum) => !this.classes.includes(classNum)
    );

    if (removedClasses.length > 0) {
      await Class.deleteMany({ class_number: { $in: removedClasses }, level_number: this.level_number });

      await Student.updateMany(
        { class_id: { $in: await Class.find({ class_number: { $in: removedClasses } }).distinct("_id") } },
        { $unset: { class_id: "" } }
      );
    }
  }

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

levelSchema.pre("findOneAndDelete", async function (next) {
  const level = await this.model.findOne(this.getFilter());
  if (!level) return next();

  await Class.deleteMany({ level_number: level.level_number });

  await Student.updateMany(
    { level_number: level.level_number },
    { $unset: { class_id: "" } }
  );

  next();
});

const levelModel = mongoose.model("Level", levelSchema);
module.exports = levelModel;
