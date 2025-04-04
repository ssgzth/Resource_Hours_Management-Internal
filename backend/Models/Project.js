import mongoose from "mongoose";

const projectSchema = new mongoose.Schema({
  name: String,
  businessLine: { type: mongoose.Schema.Types.ObjectId, ref: "BusinessLine" },
  isActive: { type: Boolean, default: true },
});

export default mongoose.model("Project", projectSchema);
