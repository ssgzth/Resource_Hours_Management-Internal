// Employee component with fixed-width summary section and scrollable project section

import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
} from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import axios from "axios";
import { data as initialDataModel } from "../config/data";

const API_BASE_URL = "http://localhost:5000";

const Employee = () => {
  const [data, setData] = useState(initialDataModel);
  const [projectOptions, setProjectOptions] = useState([]);
  const [selectedBusinessLine, setSelectedBusinessLine] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [loading, setLoading] = useState(false);

  // useEffect(() => {
  //   axios
  //     .get(`${API_BASE_URL}/api/business-lines`)
  //     .then((response) => setData({ businessLines: response.data }))
  //     .catch((error) => console.error("Error fetching business lines:", error));
  // }, []);

  // useEffect(() => {
  //   axios
  //     .get(`${API_BASE_URL}/api/projects`)
  //     .then((response) => setProjectOptions(response.data))
  //     .catch((error) => console.error("Error fetching projects:", error));
  // }, []);

  useEffect(() => {
    axios.get(`${API_BASE_URL}/api/business-lines`, {
      headers: { 
        Authorization: `Bearer ${localStorage.getItem('token')}` 
      }
    })
      .then((response) => setData({ businessLines: response.data }))
      .catch((error) => console.error("Error fetching business lines:", error));
  }, []);

  useEffect(() => {
    // axios
    //   .get(`${API_BASE_URL}/api/projects`)
    axios.get(`${API_BASE_URL}/api/projects`, {
          headers: { 
            Authorization: `Bearer ${localStorage.getItem('token')}` 
          }
        })
      .then((response) => setProjectOptions(response.data))
      .catch((error) => console.error("Error fetching projects:", error));
  }, []);

  const businessLines = data?.businessLines?.map((line) => line.name) || [];
  const allEmployeeNames = [
    ...new Set(
      data.businessLines?.flatMap((line) =>
        line.employees.map((emp) => emp.name)
      ) || []
    ),
  ];
  const filteredEmployeeNames = selectedBusinessLine
    ? data.businessLines
        .find((bl) => bl.name === selectedBusinessLine)
        ?.employees.map((emp) => emp.name) || []
    : allEmployeeNames;

  const filteredEmployees = data.businessLines
    .filter(
      (line) => !selectedBusinessLine || line.name === selectedBusinessLine
    )
    .flatMap((line) =>
      line.employees.filter(
        (emp) => !selectedEmployee || emp.name === selectedEmployee
      )
    );

  const dates = [
    ...new Set(
      data.businessLines?.flatMap((line) =>
        line.employees.flatMap((emp) => emp.workHours.map((w) => w.date))
      ) || []
    ),
  ].sort((a, b) => new Date(b) - new Date(a)); // Sort dates descending

  const projectSet = new Set();
  filteredEmployees.forEach((emp) => {
    emp.workHours.forEach((work) => {
      if (!selectedDate || work.date === selectedDate) {
        work.projects.forEach((proj) => {
          if (proj.direct > 0) projectSet.add(proj.projectId);
        });
      }
    });
  });
  const projects = Array.from(projectSet);

  const summary = filteredEmployees.reduce(
    (acc, emp) => {
      emp.workHours.forEach((work) => {
        if (!selectedDate || work.date === selectedDate) {
          work.projects.forEach((proj) => {
            if (proj.direct > 0) {
              acc.project[proj.projectId] =
                (acc.project[proj.projectId] || 0) + proj.direct;
            }
          });
          acc.oh += work?.OH || 0;
          acc.training += work?.Training || 0;
          acc.totalUncompensated += work?.Total_Uncompensated || 0;
          acc.pto += work?.PTO || 0;
          acc.holiday += work?.Holiday || 0;
        }
      });
      return acc;
    },
    {
      project: {},
      oh: 0,
      training: 0,
      totalUncompensated: 0,
      pto: 0,
      holiday: 0,
    }
  );

  const totalDirect = Object.values(summary.project).reduce(
    (sum, val) => sum + val,
    0
  );
  const totalActual =
    totalDirect +
    summary.oh +
    summary.training +
    summary.totalUncompensated +
    summary.pto +
    summary.holiday;

  const calculateEmployeeTotals = (emp) => {
    let empProject = {},
      ohHours = 0,
      pto = 0,
      trainingHours = 0,
      Total_Uncompensated = 0,
      Holiday = 0;
    emp.workHours.forEach((work) => {
      if (!selectedDate || work.date === selectedDate) {
        work.projects.forEach((proj) => {
          if (proj.direct > 0) {
            empProject[proj.projectId] =
              (empProject[proj.projectId] || 0) + proj.direct;
          }
        });
        ohHours += work?.OH || 0;
        pto += work?.PTO || 0;
        Holiday += work?.Holiday || 0;
        trainingHours += work?.Training || 0;
        Total_Uncompensated += work?.Total_Uncompensated || 0;
      }
    });
    const empDirect = Object.values(empProject).reduce(
      (sum, val) => sum + val,
      0
    );
    const empOther =
      ohHours + trainingHours + Total_Uncompensated + pto + Holiday;
    const empActual = empDirect + empOther;
    return {
      empProject,
      empDirect,
      empActual,
      ohHours,
      trainingHours,
      Total_Uncompensated,
      pto,
      Holiday,
    };
  };

  return (
    <Box p={3}>
      <Typography variant="h5" gutterBottom>
        Employee Work Hours
      </Typography>

      <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", p: 2 }}>
        <Autocomplete
          options={businessLines}
          value={selectedBusinessLine}
          onChange={(e, val) => setSelectedBusinessLine(val)}
          renderInput={(params) => (
            <TextField {...params} label="Business Line" variant="outlined" />
          )}
          sx={{ minWidth: 200 }}
        />
        <Autocomplete
          options={dates}
          value={selectedDate}
          onChange={(e, val) => setSelectedDate(val)}
          renderInput={(params) => (
            <TextField {...params} label="Select Date" variant="outlined" />
          )}
          sx={{ minWidth: 200 }}
        />
        <Autocomplete
          options={filteredEmployeeNames}
          value={selectedEmployee}
          onChange={(e, val) => setSelectedEmployee(val)}
          renderInput={(params) => (
            <TextField {...params} label="Employee" variant="outlined" />
          )}
          sx={{ minWidth: 200 }}
        />
      </Box>

      <Box
        sx={{
          display: "flex",
          border: "1px solid #ccc",
          borderRadius: 2,
          width: "80vw",
        }}
      >
        <Box sx={{ minWidth: "13%", flexShrink: 0 }}>
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                <TableCell
                  sx={{
                    fontWeight: "bold",
                    // background: "#fff",
                    position: "sticky",
                    left: 0,
                    zIndex: 2,
                  }}
                >
                  Employee Name
                </TableCell>
                {[
                  "OH (4552)",
                  "Training (4557)",
                  "Total Uncompensated",
                  "PTO (1407)",
                  "Holiday (1402)",
                  "Emp Direct",
                  "Emp Actual",
                ].map((label) => (
                  <TableCell
                    key={label}
                    align="center"
                    sx={{ fontWeight: "bold", maxWidth: "100px" }}
                  >
                    {label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredEmployees.map((emp, idx) => {
                const {
                  empDirect,
                  empActual,
                  ohHours,
                  trainingHours,
                  Total_Uncompensated,
                  pto,
                  Holiday,
                } = calculateEmployeeTotals(emp);
                return (
                  <TableRow key={idx}>
                    <TableCell
                      sx={{
                        position: "sticky",
                        left: 0,
                        // background: "#fff",
                        zIndex: 1,
                        fontWeight: "bold",
                      }}
                    >
                      {emp.name}
                    </TableCell>
                    <TableCell align="center">{ohHours || "-"}</TableCell>
                    <TableCell align="center">{trainingHours || "-"}</TableCell>
                    <TableCell align="center">
                      {Total_Uncompensated || "-"}
                    </TableCell>
                    <TableCell align="center">{pto || "-"}</TableCell>
                    <TableCell align="center">{Holiday || "-"}</TableCell>
                    <TableCell align="center">{empDirect || "-"}</TableCell>
                    <TableCell align="center">{empActual || "-"}</TableCell>
                  </TableRow>
                );
              })}
              <TableRow sx={{ backgroundColor: "  " }}>
                <TableCell
                  sx={{
                    position: "sticky",
                    left: 0,
                    // background: "#fff",
                    fontWeight: "bold",
                  }}
                >
                  Summary
                </TableCell>
                <TableCell align="center">{summary.oh || 0}</TableCell>
                <TableCell align="center">{summary.training || 0}</TableCell>
                <TableCell align="center">
                  {summary.totalUncompensated || 0}
                </TableCell>
                <TableCell align="center">{summary.pto || 0}</TableCell>
                <TableCell align="center">{summary.holiday || 0}</TableCell>
                <TableCell align="center">{totalDirect}</TableCell>
                <TableCell align="center">{totalActual}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Box>

        <Box sx={{ overflowX: "auto", minWidth: "30%" }}>
          <Table stickyHeader size="small">
            <TableHead sx={{}}>
              <TableRow>
                {projects.map((projectId, i) => (
                  <TableCell
                    key={i}
                    align="center"
                    sx={{ minWidth: 100, fontWeight: "bold", py: "18px" }}
                  >
                    {projectOptions.find((p) => p._id === projectId)?.name ||
                      projectId}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredEmployees.map((emp, idx) => {
                const { empProject } = calculateEmployeeTotals(emp);
                return (
                  <TableRow key={idx}>
                    {projects.map((pid, j) => (
                      <TableCell key={j} align="center">
                        {empProject[pid] || "-"}
                      </TableCell>
                    ))}
                  </TableRow>
                );
              })}
              <TableRow sx={{ backgroundColor: "" }}>
                {projects.map((pid, idx) => (
                  <TableCell
                    key={idx}
                    align="center"
                    sx={{ fontWeight: "bold" }}
                  >
                    {summary.project[pid] || 0}
                  </TableCell>
                ))}
              </TableRow>
            </TableBody>
          </Table>
        </Box>
      </Box>
    </Box>
  );
};

export default Employee;
