import cron from "node-cron";
import Employee from "../Models/employee.js";

// This cron job runs every Sunday at midnight (00:00)
cron.schedule("0 0 * * 0", async () => {
  try {
    const employees = await Employee.find();
    for (const emp of employees) {
      // Calculate the upcoming Friday from now (Sunday)
      const nextFriday = new Date();
      nextFriday.setDate(
        nextFriday.getDate() + ((5 - nextFriday.getDay() + 14) % 7)
      );
      const nextFridayDate = nextFriday.toISOString().split("T")[0];

      // Check if a work hour entry for the upcoming Friday already exists
      const exists = emp.workHours.some((hour) => hour.date === nextFridayDate);
      if (!exists) {
        const newWorkHour = {
          date: nextFridayDate,
          OH: 0,
          Training: 0,
          Total_Uncompensated: 0,
          PTO: 0,
          Holiday: 0,
          projects: [],
        };

        emp.workHours.push(newWorkHour);
        await emp.save();
      }
    }
    console.log("Weekly work hours generated for all employees.");
  } catch (error) {
    console.error("Failed to generate weekly work hours:", error);
  }
});
