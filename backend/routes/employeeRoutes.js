import express from "express";
import Employee from "../Models/employee.js";
import BusinessLine from "../Models/BusinessLine.js";

const router = express.Router();

// Get all employees (without populating workHours)
router.get("/", async (req, res) => {
  try {
    const employees = await Employee.find()
      .select("-workHours")
      .populate("businessLine");
    res.json(employees);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch employees" });
  }
});

// Create an employee and generate work hours for 2 years (Fridays)
router.post("/", async (req, res) => {
  try {
    const { name, businessLineId, empType, isActive } = req.body;

    // Check if an employee with the same name and businessLine already exists.
    const existingEmployee = await Employee.findOne({
      name,
      businessLine: businessLineId,
    });

    if (existingEmployee) {
      return res.status(400).json({ error: "Employee already exists" });
    }

    // Calculate next week's Friday
    const today = new Date();
    today.setDate(today.getDate() + ((5 - today.getDay() + 7) % 7)); // 5 represents Friday

    // Create work hour entry for the next Friday
    const workHourEntry = {
      date: today.toISOString().split("T")[0],
      OH: 0,
      Training: 0,
      Total_Uncompensated: 0,
      PTO: 0,
      Holiday: 0,
      projects: [],
    };

    // Generate forecast hours for the next two Fridays
    const forecastHours = [];
    for (let i = 1; i <= 2; i++) {
      const nextFriday = new Date();
      nextFriday.setDate(today.getDate() + i * 7);
      forecastHours.push({
        date: nextFriday.toISOString().split("T")[0],
        OH: 0,
        Training: 0,
        Total_Uncompensated: 0,
        PTO: 0,
        Holiday: 0,
        projects: [],
      });
    }

    // console.log("Forecast Hours:", forecastHours); // Debugging

    const employee = new Employee({
      name,
      businessLine: businessLineId,
      empType,
      isActive,
      workHours: [workHourEntry],
      forecastHours, // Include forecast hours
    });

    await employee.save();
    // console.log("Saved Employee:", employee); // Debugging

    // Add employee reference to BusinessLine
    await BusinessLine.findByIdAndUpdate(businessLineId, {
      $push: { employees: employee._id },
    });

    res.status(201).json(employee);
  } catch (error) {
    console.error("Error creating employee:", error); // Log full error
    res
      .status(500)
      .json({ error: "Failed to create employee", details: error.message });
  }
});

// Update an employee
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, businessLineId, empType, isActive } = req.body;

    const employee = await Employee.findByIdAndUpdate(
      id,
      { name, businessLine: businessLineId, empType, isActive },
      { new: true, select: "-workHours" } // Return updated employee without workHours
    );

    if (!employee) {
      return res.status(404).json({ error: "Employee not found" });
    }

    res.json(employee);
  } catch (error) {
    res.status(500).json({ error: "Failed to update employee" });
  }
});

// Delete an employee
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const employee = await Employee.findByIdAndDelete(id);
    if (!employee) {
      return res.status(404).json({ error: "Employee not found" });
    }

    // Remove employee reference from BusinessLine
    await BusinessLine.findByIdAndUpdate(employee.businessLine, {
      $pull: { employees: id },
    });

    res.json({ message: "Employee deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete employee" });
  }
});

export default router;
