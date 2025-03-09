const mongoose = require("mongoose");
const Submission = require("./submissionModel");
const Grade = require("./gradeModel");

const activitySchema = new mongoose.Schema({
  title: String,
  description: String,
  classSubject_id: {
    type: mongoose.Schema.ObjectId,
    ref: "ClassSubject",
  },
  activity_type: {
    type: String,
    enum: ["Exam", "Assignment"],
  },
  full_grade: Number,
  file_url: String,
  available_at: Date,
  deadline: Date,
  posted_by: {
    type: String,
    ref: "User",
  },
}, { timestamps: true });

activitySchema.pre("findOneAndDelete", async function (next) {
  const activityId = this.getQuery()._id;

  if (activityId) {
    await Submission.deleteMany({ activity_id: activityId });
    await Grade.deleteMany({ subject_id: activityId });
    console.log(`تم حذف جميع البيانات المرتبطة بالنشاط ${activityId}`);
  }

  next();
});

const activityModel = mongoose.model("Activity", activitySchema);
module.exports = activityModel;
