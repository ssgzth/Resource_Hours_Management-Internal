import express from "express";
import BusinessLine from "../Models/BusinessLine.js";
import Employee from "../Models/Employee.js";

const businessRouter = express.Router();

// Get all business lines
businessRouter.get("/", async (req, res) => {
  const businessLines = await BusinessLine.find().populate(
    "employees projects"
  );
  res.json(businessLines);
});

// Create a new business line
businessRouter.post("/", async (req, res) => {
  const { name } = req.body;
  const businessLine = new BusinessLine({ name });
  await businessLine.save();
  res.status(201).json(businessLine);
});

// Update a business line
businessRouter.put("/:id", async (req, res) => {
  try {
    const businessLine = await BusinessLine.findById(req.params.id);
    if (!businessLine) {
      return res.status(404).json({ message: "Business line not found" });
    }

    if (req.body.name !== undefined) {
      businessLine.name = req.body.name;
    }

    if (Array.isArray(req.body.employees)) {
      for (const updatedEmployee of req.body.employees) {
        const employee = await Employee.findById(updatedEmployee._id);
        if (employee) {
          if (updatedEmployee.name !== undefined) {
            employee.name = updatedEmployee.name;
          }
          if (updatedEmployee.businessLine !== undefined) {
            employee.businessLine = updatedEmployee.businessLine;
          }

          if (Array.isArray(updatedEmployee.workHours)) {
            updatedEmployee.workHours.forEach((updatedWorkHour) => {
              const workHour = employee.workHours.find(
                (wh) => wh._id.toString() === updatedWorkHour._id.toString()
              );
              if (workHour) {
                Object.assign(workHour, updatedWorkHour);
              }
            });
          }

          if (Array.isArray(updatedEmployee.forecastHours)) {
            updatedEmployee.forecastHours.forEach((updatedForecastHour) => {
              const forecastHour = employee.forecastHours.find(
                (fh) => fh._id.toString() === updatedForecastHour._id.toString()
              );
              if (forecastHour) {
                Object.assign(forecastHour, updatedForecastHour);
              }
            });
          }

          await employee.save();
        }
      }
    }

    const updatedBusinessLine = await businessLine.save();
    res.json(updatedBusinessLine);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete a business line
businessRouter.delete("/:id", async (req, res) => {
  try {
    const businessLine = await BusinessLine.findById(req.params.id);
    if (!businessLine) {
      return res.status(404).json({ message: "Business line not found" });
    }

    await businessLine.deleteOne();
    res.json({ message: "Business line deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default businessRouter;
