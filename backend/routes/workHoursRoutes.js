import express from "express";
import Employee from "../Models/Employee.js";

const router = express.Router();

// Get filtered work hours
router.get("/", async (req, res) => {
  const { businessLineId, startDate, endDate, projectId } = req.query;

  let query = Employee.find()
    .populate("businessLine")
    .populate("workHours.projects");

  if (businessLineId)
    query = query.where("businessLine").equals(businessLineId);

  const employees = await query.exec();

  const result = employees.map((e) => ({
    name: e.name,
    workHours: e.workHours
      .filter((wh) => wh.date >= startDate && wh.date <= endDate)
      .map((wh) => ({
        date: wh.date,
        projects: projectId
          ? wh.projects.filter((p) => p.projectId.toString() === projectId)
          : wh.projects,
      })),
  }));

  res.json(result);
});

router.put("/:employeeId/workHours", async (req, res) => {
  const { employeeId } = req.params;
  const newWorkHour = req.body; // { date, OH, PTO, projects, etc. }

  try {
    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    // Normalize date for matching (ignore time component)
    const normalizedNewDate = new Date(newWorkHour.date)
      .toISOString()
      .split("T")[0];

    // Find existing entry by matching normalized date
    const existingIndex = employee.workHours.findIndex((wh) => {
      const existingDate = new Date(wh.date).toISOString().split("T")[0];
      return existingDate === normalizedNewDate;
    });

    if (existingIndex !== -1) {
      // ✅ Update existing work hour entry
      employee.workHours[existingIndex] = {
        ...employee.workHours[existingIndex],
        ...newWorkHour,
      };
    } else {
      // ✅ Add new work hour entry
      employee.workHours.push(newWorkHour);
    }

    await employee.save();
    res.json({ message: "Work hour saved successfully", employee });
  } catch (error) {
    console.error("Error saving work hour:", error);
    res.status(500).json({ message: "Server error", error });
  }
});

export default router;
