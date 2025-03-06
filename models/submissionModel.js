const mongoose = require("mongoose");

const submissionSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
    activity_id: {
      type: mongoose.Schema.ObjectId,
      ref: "Activity",
    },
    file_url: String, 
    content: String,
    grade: Number,
    feedback: String,
    graded_by: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

const submissionModel = mongoose.model("Submission", submissionSchema);
module.exports = submissionModel;
