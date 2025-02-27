const mongoose = require("mongoose");

const announcementSchema = new mongoose.Schema(
  {
    content: String,
    classSubject_id: {
      type: mongoose.Schema.ObjectId,
      ref: "ClassSubject",
    },
    user_id: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

const announcementModel = mongoose.model("Announcement", announcementSchema);
module.exports = announcementModel;
