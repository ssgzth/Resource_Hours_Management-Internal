import mongoose from "mongoose";

const businessLineSchema = new mongoose.Schema({
  name: { type: String, required: true },
  employees: [{ type: mongoose.Schema.Types.ObjectId, ref: "Employee" }],
  projects: [{ type: mongoose.Schema.Types.ObjectId, ref: "Project" }],
});

// Middleware to remove duplicates before saving
businessLineSchema.pre("save", function (next) {
  this.employees = [...new Set(this.employees.map((id) => id.toString()))]; // Remove duplicate Employee IDs
  this.projects = [...new Set(this.projects.map((id) => id.toString()))]; // Remove duplicate Project IDs
  next();
});

export default mongoose.model("BusinessLine", businessLineSchema);
