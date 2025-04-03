import mongoose from "mongoose";

const workHoursSchema = new mongoose.Schema({
  date: String,
  OH: Number,
  Training: Number,
  Total_Uncompensated: Number,
  PTO: Number,
  Holiday: Number,
  projects: [
    {
      projectId: { type: mongoose.Schema.Types.ObjectId, ref: "Project" },
      direct: Number,
    },
  ],
});

const forecastHoursSchema = new mongoose.Schema({
  date: String,
  OH: Number,
  Training: Number,
  Total_Uncompensated: Number,
  PTO: Number,
  Holiday: Number,
  projects: [
    {
      projectId: { type: mongoose.Schema.Types.ObjectId, ref: "Project" },
      direct: Number,
    },
  ],
});

const employeeSchema = new mongoose.Schema({
  name: String,
  businessLine: { type: mongoose.Schema.Types.ObjectId, ref: "BusinessLine" },
  isActive: { type: Boolean, default: true }, // Default value set to true
  empType: { type: String, enum: ["Full Time", "CWK"], required: true },
  workHours: [workHoursSchema],
  forecastHours: [forecastHoursSchema],
});

export default mongoose.model("Employee", employeeSchema);
