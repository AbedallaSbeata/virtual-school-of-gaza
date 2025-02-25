const mongoose = require("mongoose");

const materialSchema = new mongoose.Schema(
  {
    name: String,
    classSubject_id: {
      type: mongoose.Schema.ObjectId,
      ref: "ClassSubject",
    },
    type_file: {
      type: String,
      enum: ["كتاب", "نموذج اختبار", "مادة مساعدة", "رابط خارجي", "ملف"]
    },
    file_url: String,
    uploaded_by: {
      type: String,
      ref: "User",
    },
    updated_by: {
      type: mongoose.Schema.ObjectId,
      ref: "User"
    }
  },
  { timestamps: true }
);

const materialModel = mongoose.model("Material", materialSchema);
module.exports = materialModel;
