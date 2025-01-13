const mongoose = require("mongoose");

const studentStatusSchema = new mongoose.Schema(
  {
    user_identity_number: {
      type: String,
      ref: "User",
    },
    total_grades: Number,
    attendance_rate: Number,
    gradedActivities_number: Number,
    ungradedActivities_number: Number,
    passedActivities_number: Number,
    classRank: Number,
  },
  { timestamps: true }
);

const studentStatusModel = mongoose.model("StudentStatus", studentStatusSchema);
module.exports = studentStatusModel;
