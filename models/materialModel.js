const mongoose = require("mongoose");

const materialSchema = new mongoose.Schema(
  {
    name: String,
    classSubject_id: {
      type: mongoose.Schema.ObjectId,
      ref: "ClassSubject",
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
