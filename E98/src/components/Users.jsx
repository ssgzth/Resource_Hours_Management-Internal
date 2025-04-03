import React, { useState, useEffect } from "react";
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
  MenuItem,
  Switch,
} from "@mui/material";
import axios from "axios";

const API_BASE_URL = "http://localhost:5000"; // Replace with your actual API URL

const Users = () => {
  const [users, setUsers] = useState([]);
  const [businessLines, setBusinessLines] = useState([]);
  const [open, setOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    businessLineId: "", // Ensure we store the ID
    empType: "Full Time",
    isActive: true,
  });

  // Fetch business lines
  useEffect(() => {
    axios.get(`${API_BASE_URL}/api/business-lines`, {
      headers: { 
        Authorization: `Bearer ${localStorage.getItem('token')}` 
      }
    })
      .then((response) => setBusinessLines(response.data))
      .catch((error) => console.error("Error fetching business lines:", error));
  }, []);

  // Fetch users
  useEffect(() => {
    axios.get(`${API_BASE_URL}/api/employees`, {
      headers: { 
        Authorization: `Bearer ${localStorage.getItem('token')}` 
      }
    })
      .then((response) => setUsers(response.data))
      .catch((error) => console.error("Error fetching users:", error));
  }, []);

  const handleOpen = (user = null) => {
    setEditingUser(user);
    setFormData(
      user
        ? {
            name: user.name,
            businessLineId: user.businessLine?._id || "", // Store the ID
            empType: user.empType,
            isActive: user.isActive,
          }
        : {
            name: "",
            businessLineId: "",
            empType: "Full Time",
            isActive: true,
          }
    );
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingUser(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleToggleActive = (event) => {
    setFormData((prev) => ({ ...prev, isActive: event.target.checked }));
  };

  const handleSave = async () => {
    try {
      const payload = {
        name: formData.name,
        businessLineId: formData.businessLineId, // Ensure this is correct
        empType: formData.empType,
        isActive: formData.isActive,
      };

      if (editingUser) {
        // await axios.put(
        //   `${API_BASE_URL}/api/employees/${editingUser?._id}`,
        //   payload
        // );
        await axios.put(
          `${API_BASE_URL}/api/employees/${editingUser?._id}`,
          payload,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`
            }
          }
        );
        setUsers((prev) =>
          prev.map((user) =>
            user._id === editingUser._id
              ? {
                  ...user,
                  ...payload,
                  businessLine: businessLines.find(
                    (bl) => bl._id === formData.businessLineId
                  ),
                }
              : user
          )
        );
      } else {
        // const response = await axios.post(
        //   `${API_BASE_URL}/api/employees`,
        //   payload
        // );
        const response = await axios.post(
          `${API_BASE_URL}/api/employees`,
          payload,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`
            }
          }
        );
        setUsers((prev) => [
          ...prev,
          {
            ...response.data,
            businessLine: businessLines.find(
              (bl) => bl._id === formData.businessLineId
            ),
          },
        ]);
      }

      handleClose();
    } catch (error) {
      console.error("Error saving user:", error);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Button variant="contained" onClick={() => handleOpen()} sx={{ mb: 2 }}>
        Create User
      </Button>
      {/* Users Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Business Line</TableCell>
              <TableCell>Worker Type</TableCell>
              <TableCell>Active</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user?._id}>
                <TableCell>{user?.name}</TableCell>
                <TableCell>{user?.businessLine?.name || "N/A"}</TableCell>
                <TableCell>{user?.empType}</TableCell>
                <TableCell>{user?.isActive ? "✅ Yes" : "❌ No"}</TableCell>
                <TableCell>
                  <Button size="small" onClick={() => handleOpen(user)}>
                    Edit
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      {/* Dialog for Create/Edit User */}
      <Dialog open={open} onClose={handleClose} fullWidth>
        <DialogTitle>{editingUser ? "Edit User" : "Create User"}</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            margin="dense"
            label="Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
          />
          <TextField
            fullWidth
            margin="dense"
            select
            label="Business Line"
            name="businessLineId"
            value={formData.businessLineId}
            onChange={handleChange}
          >
            {businessLines.map((line) => (
              <MenuItem key={line._id} value={line._id}>
                {line.name}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            fullWidth
            margin="dense"
            select
            label="Worker Type"
            name="empType"
            value={formData.empType}
            onChange={handleChange}
          >
            <MenuItem value="Full Time">Full Time</MenuItem>
            <MenuItem value="CWK">CWK</MenuItem>
          </TextField>
          <Box sx={{ display: "flex", alignItems: "center", mt: 2 }}>
            <Switch checked={formData.isActive} onChange={handleToggleActive} />
            Active
          </Box>
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

export default Users;
