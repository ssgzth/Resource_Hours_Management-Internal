import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  CircularProgress,
  MenuItem,
} from "@mui/material";

const API_URL = "http://localhost:5000"; // Replace with your API URL

const CreateProject = () => {
  const [projects, setProjects] = useState([]);
  const [businessLines, setBusinessLines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    businessLineId: "",
  });

  useEffect(() => {
    axios.get(`${API_URL}/api/business-lines`, {
      headers: { 
        Authorization: `Bearer ${localStorage.getItem('token')}` 
      }
    }).then((response) => setBusinessLines(response.data))
      .catch((error) => console.error("Error fetching business lines:", error));
  }, []);

  // Fetch projects from API
  const fetchProjects = async () => {
    try {
      // const response = await axios.get(`${API_URL}/api/projects`);
      const response = await axios.get(`${API_URL}/api/projects`, {
        headers: { 
          Authorization: `Bearer ${localStorage.getItem('token')}` 
        }
      });
      setProjects(response.data);
    } catch (error) {
      console.error("Error fetching projects:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  console.log(projects);

  const handleOpen = (project = null) => {
    setEditingProject(project);
    setFormData({
      name: project?.name || "",
      businessLineId: project?.businessLine?._id || "", // Ensure it's never undefined
    });
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingProject(null);
    setFormData({ name: "", businessLineId: "" }); // Reset to prevent stale state
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Create or Update project
  const handleSave = async () => {
    try {
      const payload = {
        name: formData.name,
        businessLineId: formData.businessLineId, // Ensure this is correct
      };

      if (editingProject) {
        // Update project
        // await axios.put(
        //   `${API_URL}/api/projects/${editingProject._id}`,
        //   payload
        // );
        await axios.put(
          `${API_URL}/api/projects/${editingProject._id}`,
          payload,
          {
            headers: { 
              Authorization: `Bearer ${localStorage.getItem('token')}` 
            }
          }
        );
        setProjects((prev) =>
          prev.map((project) =>
            project._id === editingProject._id
              ? {
                  ...project,
                  ...payload,
                  businessLine: businessLines.find(
                    (bl) => bl._id === formData.businessLineId
                  ),
                }
              : project
          )
        );
      } else {
        // Create project
        // const response = await axios.post(`${API_URL}/api/projects`, payload);
        const response = await axios.post(
          `${API_URL}/api/projects`, 
          payload,
          {
            headers: { 
              Authorization: `Bearer ${localStorage.getItem('token')}` 
            }
          }
        );
        setProjects((prev) => [
          ...prev,
          {
            ...response.data,
            businessLine: businessLines.find(
              (bl) => bl._id === formData.businessLineId
            ),
          },
        ]);
      }
    } catch (error) {
      console.error("Error saving project:", error);
    } finally {
      handleClose();
    }
  };

  // Delete project
  const handleDelete = async (id, name) => {
    const isConfirmed = window.confirm(
      `Are you sure you want to delete the project "${name}"?`
    );

    if (!isConfirmed) return;

    try {
      // await axios.delete(`${API_URL}/api/projects/${id}`);
      await axios.delete(`${API_URL}/api/projects/${id}`, {
        headers: { 
          Authorization: `Bearer ${localStorage.getItem('token')}` 
        }
      });
      setProjects((prev) => prev.filter((project) => project._id !== id));
    } catch (error) {
      console.error("Error deleting project:", error);
    }
  };

  console.log(formData);

  return (
    <Box sx={{ p: 3 }}>
      <Button variant="contained" onClick={() => handleOpen()} sx={{ mb: 2 }}>
        Create Project
      </Button>

      {/* Projects Table */}
      <TableContainer component={Paper}>
        {loading ? (
          <Box sx={{ textAlign: "center", p: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ width: "40%", textAlign: "center" }}>
                  Name
                </TableCell>
                <TableCell sx={{ width: "40%", textAlign: "center" }}>
                  Business Line
                </TableCell>
                <TableCell sx={{ width: "20%", textAlign: "center" }}>
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {projects.map((project) => (
                <TableRow key={project._id}>
                  <TableCell>{project.name}</TableCell>
                  <TableCell>{project?.businessLine?.name || "N/A"}</TableCell>
                  <TableCell sx={{ textAlign: "center" }}>
                    <Button size="small" onClick={() => handleOpen(project)}>
                      Edit
                    </Button>
                    <Button
                      size="small"
                      color="error"
                      onClick={() => handleDelete(project._id, project.name)}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </TableContainer>

      {/* Dialog for Create/Edit Project */}
      <Dialog open={open} onClose={handleClose} fullWidth>
        <DialogTitle>
          {editingProject ? "Edit Project" : "Create Project"}
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            margin="dense"
            label="Project Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            inputProps={{ maxLength: 20 }}
          />

          <TextField
            fullWidth
            margin="dense"
            select
            label="Business Line"
            name="businessLineId"
            value={formData.businessLineId || ""} // Ensure it's always a string
            onChange={handleChange}
          >
            {businessLines.map((line) => (
              <MenuItem key={line._id} value={line._id}>
                {line.name}
              </MenuItem>
            ))}
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CreateProject;
