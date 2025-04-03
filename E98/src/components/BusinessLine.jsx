import React, { useState, useEffect } from "react";
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
  IconButton,
  Typography,
} from "@mui/material";
import { Edit, Delete } from "@mui/icons-material";

const API_URL = "http://localhost:5000"; // Replace with your API URL

const BusinessLineManager = () => {
  const [businessLines, setBusinessLines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentBusinessLine, setCurrentBusinessLine] = useState(null);
  const [formData, setFormData] = useState({ name: "" });

  useEffect(() => {
    fetchBusinessLines();
  }, []);

  const fetchBusinessLines = async () => {
    try {
      // const response = await axios.get(`${API_URL}/api/business-lines`);
      const response = await axios.get(`${API_URL}/api/business-lines`, {
        headers: { 
          Authorization: `Bearer ${localStorage.getItem('token')}` 
        }
      });
      setBusinessLines(response.data);
    } catch (error) {
      console.error("Error fetching business lines:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDialogOpen = (businessLine = null) => {
    setCurrentBusinessLine(businessLine);
    setFormData({ name: businessLine ? businessLine.name : "" });
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setCurrentBusinessLine(null);
    setFormData({ name: "" });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, name: e.target.value });
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      alert("Business line name cannot be empty.");
      return;
    }

    try {
      if (currentBusinessLine) {
        // Update existing business line
        // const response = await axios.put(
        //   `${API_URL}/api/business-lines/${currentBusinessLine._id}`,
        //   formData
        // );
        const response = await axios.put(
          `${API_URL}/api/business-lines/${currentBusinessLine._id}`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`
            }
          }
        );
        setBusinessLines((prev) =>
          prev.map((bl) =>
            bl._id === currentBusinessLine._id ? response.data : bl
          )
        );
      } else {
        // Create new business line
        // const response = await axios.post(
        //   `${API_URL}/api/business-lines`,
        //   formData
        // );
        const response = await axios.post(
          `${API_URL}/api/business-lines`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`
            }
          }
        );
        setBusinessLines((prev) => [...prev, response.data]);
      }
      handleDialogClose();
    } catch (error) {
      console.error("Error saving business line:", error);
    }
  };

  const handleDelete = async (id) => {
    const isConfirmed = window.confirm(
      "Are you sure you want to delete this business line?"
    );
    if (!isConfirmed) return;

    try {
      // await axios.delete(`${API_URL}/api/business-lines/${id}`);
     await axios.delete(
        `${API_URL}/api/business-lines/${id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      setBusinessLines((prev) => prev.filter((bl) => bl._id !== id));
    } catch (error) {
      console.error("Error deleting business line:", error);
    }
  };

  if (loading) {
    return (
      <Box sx={{ textAlign: "center", p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Business Line Management
      </Typography>
      <Button
        variant="contained"
        color="primary"
        onClick={() => handleDialogOpen()}
        sx={{ mb: 2 }}
      >
        Add Business Line
      </Button>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: "bold" }}>
                Business Line Name
              </TableCell>
              <TableCell sx={{ fontWeight: "bold", textAlign: "right" }}>
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {businessLines.map((bl) => (
              <TableRow key={bl._id}>
                <TableCell>{bl.name}</TableCell>
                <TableCell sx={{ textAlign: "right" }}>
                  <IconButton
                    color="primary"
                    onClick={() => handleDialogOpen(bl)}
                  >
                    <Edit />
                  </IconButton>
                  <IconButton
                    color="secondary"
                    onClick={() => handleDelete(bl._id)}
                  >
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {businessLines.length === 0 && (
              <TableRow>
                <TableCell colSpan={2} sx={{ textAlign: "center" }}>
                  No business lines available.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Dialog for Creating/Editing Business Line */}
      <Dialog open={dialogOpen} onClose={handleDialogClose} fullWidth>
        <DialogTitle>
          {currentBusinessLine ? "Edit Business Line" : "Add Business Line"}
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            margin="dense"
            label="Business Line Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            inputProps={{ maxLength: 50 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleSave} color="primary" variant="contained">
            {currentBusinessLine ? "Update" : "Create"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BusinessLineManager;
