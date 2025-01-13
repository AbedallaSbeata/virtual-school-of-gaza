const mongoose = require("mongoose");

const announcementSchema = new mongoose.Schema(
  {
    content: String,
    class_id: {
      type: mongoose.Schema.ObjectId,
      ref: "Class",
    },
    subject_id: {
      type: mongoose.Schema.ObjectId,
      ref: "Subject",
    },
    user_identity_number: {
        type: String,
        ref: 'Teacher'
    },
  },
  { timestamps: true }
);

const announcementModel = mongoose.model("Announcement", announcementSchema);
module.exports = announcementModel;
