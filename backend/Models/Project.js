import mongoose from "mongoose";

const projectSchema = new mongoose.Schema({
  name: String,
  businessLine: { type: mongoose.Schema.Types.ObjectId, ref: "BusinessLine" },
});

export default mongoose.model("Project", projectSchema);
