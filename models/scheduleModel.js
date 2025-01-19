const mongoose = require("mongoose");

const scheduleSchema = new mongoose.Schema({
  class_id: {
    type: mongoose.Schema.ObjectId,
    ref: 'Class',
    required: true,
  },
  schedule: [
    {
      day: {
        type: String,
        required: true,
        enum: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      },
      periods: [
        {
          subject_id: {
            type: mongoose.Schema.ObjectId,
            ref: 'Subject',
            required: true,
          },
          teacher_id: {
            type: String,
            ref: 'Teacher',
            required: true,
          },
          start_time: {
            type: String,
            required: true,
          },
          end_time: {
            type: String,
            required: true,
          },
        },
      ],
    },
  ],
}, { timestamps: true });

const Schedule = mongoose.model("Schedule", scheduleSchema);
module.exports = Schedule;