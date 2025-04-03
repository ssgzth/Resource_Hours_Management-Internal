import mongoose from "mongoose";
import { generateWeeklyWorkHours } from "./scheduler.js";

// Connect to MongoDB first
mongoose
  .connect("")
  .then(async () => {
    console.log("Connected to MongoDB.");
    await generateWeeklyWorkHours();
    console.log("Scheduler test run completed.");
    process.exit(0); // Exit the process once done
  })
  .catch((error) => {
    console.error("Failed to connect to MongoDB:", error);
    process.exit(1);
  });
