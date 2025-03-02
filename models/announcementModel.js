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
    file_url: {
      type: String,
      default: null, // Allows announcements without attachments
    },
  },
  { timestamps: true }
);

const announcementModel = mongoose.model("Announcement", announcementSchema);
module.exports = announcementModel;
