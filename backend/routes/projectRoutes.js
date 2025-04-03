import express from "express";
import Project from "../Models/Project.js";
import BusinessLine from "../Models/BusinessLine.js";

const router = express.Router();

// Get all projects
router.get("/", async (req, res) => {
  try {
    const projects = await Project.find().populate("businessLine");
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: "Error fetching projects", error });
  }
});

// Get projects by business line
router.get("/businessLine/:businessLineId", async (req, res) => {
  try {
    const { businessLineId } = req.params;
    const projects = await Project.find({
      businessLine: businessLineId,
    }).populate("businessLine");

    if (!projects.length) {
      return res
        .status(404)
        .json({ message: "No projects found for this business line" });
    }

    res.json(projects);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching projects by business line", error });
  }
});

// Create a project linked to a business line
router.post("/", async (req, res) => {
  try {
    const { name, businessLineId } = req.body;
    const project = new Project({ name, businessLine: businessLineId });
    await project.save();

    await BusinessLine.findByIdAndUpdate(businessLineId, {
      $push: { projects: project._id },
    });

    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ message: "Error creating project", error });
  }
});

// Update a project
router.put("/:id", async (req, res) => {
  try {
    const { name, businessLineId } = req.body;
    const updatedProject = await Project.findByIdAndUpdate(
      req.params.id,
      { name, businessLine: businessLineId },
      { new: true }
    );

    if (!updatedProject) {
      return res.status(404).json({ message: "Project not found" });
    }

    res.json(updatedProject);
  } catch (error) {
    res.status(500).json({ message: "Error updating project", error });
  }
});

// Delete a project
router.delete("/:id", async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Remove project reference from BusinessLine
    await BusinessLine.findByIdAndUpdate(project.businessLine, {
      $pull: { projects: project._id },
    });

    await Project.findByIdAndDelete(req.params.id);
    res.json({ message: "Project deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting project", error });
  }
});

export default router;
