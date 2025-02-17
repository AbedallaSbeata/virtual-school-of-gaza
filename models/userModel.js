const mongoose = require("mongoose");
const Teacher = require('./teacherModel')
const Student = require('./studentModel')
const StudentStatus = require('./studentStatusModel')
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema({
  identity_number: {
    type: String,
    unique: true,
  },
  email: String,
  first_name: String,
  second_name: String,
  third_name: String,
  last_name: String,
  basic_phone_number: String,
  second_phone_number: String,
  whatsapp_number: String,
  health_status: String,
  profile_image: String,
  password: String,
  identity_image: String,
  current_country: String,
  current_city: String,
  current_neighborhood: String,
  current_street: String,
  birth_country: String,
  birth_date: Date,
  role: {
    type: String,
    enum: ["admin", "manager", "manager assistant", "teacher", "student"],
    default: "student",
  },
  gender: {
    type: String,
    enum: ["male", "female"],
  },
  active: {
    type: Boolean,
    default: true,
  },
  resetPasswordAt: String,
  passwordResetCode: String,
  passwordResetExpires: Date,
  passwordResetVerified: Boolean,
  refreshToken: String,
}, {timestamps: true});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 12);
  if(this.role == 'teacher') {
    await Teacher.create({user_identity_number: this.identity_number})
  } else if(this.role == 'student') {
    await Student.create({user_identity_number: this.identity_number})
    await StudentStatus.create({user_identity_number: this.identity_number})
  }
  next();
});

const userModel = mongoose.model("User", userSchema);

module.exports = userModel;
