const mongoose = require("mongoose");

const materialSchema = new mongoose.Schema(
  {
    name: String,
    class_id: {
      type: mongoose.Schema.ObjectId,
      ref: "Class",
    },
    subject_id: {
      type: mongoose.Schema.ObjectId,
      ref: "Subject",
    },
    type_file: String,
    file_url: String,
    uploaded_by: {
      type: String,
      ref: "Teacher",
    },
  },
  { timestamps: true }
);

const materialModel = mongoose.model("Material", materialSchema);
module.exports = materialModel;
