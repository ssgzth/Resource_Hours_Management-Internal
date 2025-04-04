import cron from "node-cron";
import Employee from "../Models/Employee.js";

// Calculate the next forecasted week based on the latest entry
const getNextForecastDate = (forecastHours) => {
  if (forecastHours.length === 0) return getNextFriday(new Date()); // Default if empty
  const latestDate = new Date(forecastHours[forecastHours.length - 1].date);
  latestDate.setDate(latestDate.getDate() + 7);
  return latestDate;
};

// Function to add a new forecast week for all employees
const generateWeeklyForecastHours = async () => {
  try {
    const employees = await Employee.find();
    for (const employee of employees) {
      const nextForecastDate = getNextForecastDate(employee.forecastHours);
      const newForecast = {
        date: nextForecastDate.toISOString().split("T")[0],
        OH: 0,
        Training: 0,
        Total_Uncompensated: 0,
        PTO: 0,
        Holiday: 0,
        projects: [],
      };
      await Employee.findByIdAndUpdate(employee._id, {
        $push: { forecastHours: newForecast },
      });
    }
    console.log("✅ Weekly forecast hours added.");
  } catch (error) {
    console.error("❌ Error updating forecast hours:", error);
  }
};

// Schedule the job to run every Sunday at midnight
cron.schedule("0 0 * * 0", async () => {
  console.log("🔄 Running weekly forecast hour generation...");
  await generateWeeklyForecastHours();
});
