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
  Button,
  IconButton,
} from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import axios from "axios";
import { data as initialDataModel } from "../config/data";
import { startOfWeek, parseISO, isWithinInterval, endOfWeek } from "date-fns";

const API_BASE_URL = "http://localhost:5000";

const Home = () => {
  const [data, setData] = useState(initialDataModel);
  const [businessLine, setBusinessLine] = useState(null);
  const [date, setDate] = useState(null);
  const [project, setProject] = useState(null);
  const [projectOptions, setProjectOptions] = useState([]);
  const [dateOptions, setDateOptions] = useState([]);

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
    axios.get(`${API_BASE_URL}/api/projects`, {
      headers: { 
        Authorization: `Bearer ${localStorage.getItem('token')}` 
      }
    })
      .then((response) => setProjectOptions(response.data))
      .catch((error) => console.error("Error fetching projects:", error));
  }, []);

  useEffect(() => {
    const datesSet = new Set();
    const today = new Date();
    const weekStart = startOfWeek(today, { weekStartsOn: 1 }); // Start of the week (Monday)
    const weekEnd = endOfWeek(today, { weekStartsOn: 1 }); // End of the week (Sunday)

    data.businessLines.forEach((bl) => {
      bl.employees.forEach((emp) => {
        emp.workHours.forEach((wh) => {
          const dateStr = wh.date;
          const date = parseISO(dateStr); // Convert string to Date object

          // Include all dates from Monday to Sunday of this week
          if (isWithinInterval(date, { start: weekStart, end: weekEnd })) {
            datesSet.add(dateStr);
          }
        });
      });
    });

    setDateOptions([...datesSet].sort()); // Ensure sorted order
  }, [data]);

  // Automatically select the most recent date in the current week
  useEffect(() => {
    if (dateOptions.length > 0) {
      // const today = new Date().toISOString().split("T")[0];
      // const currentWeekDates = dateOptions.filter((d) => d <= today);
      setDate(dateOptions[dateOptions.length - 1]); // Select the latest available date in the current week
    }
  }, [dateOptions]);

  const handleBusinessLineChange = (newValue) => {
    setBusinessLine(newValue);
    const bl = data.businessLines.find((b) => b.name === newValue);
    axios.get(`${API_BASE_URL}/api/projects/businessLine/${bl._id}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    })
      .then((response) => setProjectOptions(response.data))
      .catch((error) => console.error("Error fetching projects:", error));
  };

  // Update Holiday hours for the filtered employees (only those in the selected business line)
  const handleHolidayUpdateAll = (increment = true) => {
    setData((prevData) => {
      const updatedData = { ...prevData };
      if (businessLine) {
        const bl = updatedData.businessLines.find(
          (b) => b.name === businessLine
        );
        if (bl) {
          bl.employees.forEach((emp) => {
            if (emp.isActive) {
              const wh = emp.workHours.find((entry) => entry.date === date);
              if (wh) {
                const currentHoliday = wh.Holiday || 0;
                const newHoliday = currentHoliday + (increment ? 8 : -8);
                wh.Holiday = Math.max(newHoliday, 0);
              }
            }
          });
        }
      }
      return updatedData;
    });
  };

  const handleInputChange = (employeeName, field, value) => {
    setData((prevData) => {
      const updatedData = { ...prevData };
      updatedData.businessLines.forEach((bl) => {
        bl.employees.forEach((emp) => {
          if (emp.name === employeeName && emp.isActive) {
            emp.workHours.forEach((wh) => {
              if (wh.date === date) {
                if (field === "direct" && project) {
                  let projectData = wh.projects.find(
                    (p) => p?.projectId === project?._id
                  );
                  if (!projectData) {
                    projectData = { projectId: project?._id, direct: 0 };
                    wh.projects.push(projectData);
                  }
                  projectData.direct = value;
                } else {
                  wh[field] = value;
                }
              }
            });
          }
        });
      });
      return updatedData;
    });
  };

  const handleSave = async () => {
    const bl = data.businessLines.find((bl) => bl?.name === businessLine);

    // Validate total actual hours for each active employee in the business line
    const insufficientEmployees = (bl?.employees || []).filter((emp) => {
      if (!emp.isActive) return false;
      // Get the work hours entry for the selected date
      const wh = emp.workHours.find((entry) => entry.date === date);
      if (!wh) return false; // if not found, you could also decide to flag it
      // Sum direct hours from all projects
      const projectDirectHours = wh.projects.reduce(
        (sum, proj) => sum + proj.direct,
        0
      );
      // Calculate total hours from all fields
      const totalHours =
        (wh.OH || 0) +
        (wh.Training || 0) +
        (wh.Holiday || 0) +
        (wh.Total_Uncompensated || 0) +
        (wh.PTO || 0) +
        projectDirectHours;
      return totalHours < 40;
    });

    if (insufficientEmployees.length > 0) {
      const names = insufficientEmployees.map((emp) => emp.name).join(", ");
      alert(
        `The following employee(s) have insufficient total hours (< 40) for the selected date: ${names}`
      );
      return; // Prevent saving if validation fails
    }

    try {
      // const response = await axios.put(
      //   `${API_BASE_URL}/api/business-lines/${bl?._id}`,
      //   bl
      // );
      const response = await axios.put(
        `${API_BASE_URL}/api/business-lines/${bl?._id}`,
        bl,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      console.log("Response:", response.data);
      alert("Data saved successfully!");
    } catch (error) {
      console.error("Error saving data:", error);
      alert("Failed to save data.");
    }
  };

  const filteredEmployees = businessLine
    ? data.businessLines
        .find((bl) => bl.name === businessLine)
        ?.employees.filter((emp) => emp.isActive) || []
    : data.businessLines.flatMap((bl) =>
        bl.employees.filter((emp) => emp.isActive)
      );

      const sortedEmployees = [...filteredEmployees].sort((a, b) => {
        const hasProject = (emp) =>
          emp.workHours
            .find((wh) => wh.date === date)
            ?.projects.some((p) => p.projectId === project?._id);
     
        return hasProject(b) - hasProject(a);
      });

  const handleProjectChange = (_, newValue) => {
    setProject(newValue);
  };

  return (
    <Box sx={{ px: 3, py: 2 }}>
      <Typography variant="h4" gutterBottom>
        E98 Dashboard
      </Typography>
      <Box
        sx={{ display: "flex", gap: 2, flexWrap: "wrap", p: 2, width: "100%" }}
      >
        <Autocomplete
          options={data.businessLines.map((b) => b.name)}
          value={businessLine}
          onChange={(event, newValue) => handleBusinessLineChange(newValue)}
          renderInput={(params) => (
            <TextField {...params} label="Business Line" variant="outlined" />
          )}
          sx={{ minWidth: "200px" }}
        />
        <Autocomplete
          options={dateOptions}
          value={date}
          onChange={(event, newValue) => setDate(newValue)}
          renderInput={(params) => (
            <TextField {...params} label="Select Date" variant="outlined" />
          )}
          sx={{ minWidth: "170px" }}
        />
        <Autocomplete
          options={projectOptions}
          getOptionLabel={(option) => option?.name || ""}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Select Project"
              variant="outlined"
              InputProps={{
                ...params.InputProps,
                endAdornment: <>{params.InputProps.endAdornment}</>,
              }}
            />
          )}
          value={project}
          onChange={handleProjectChange}
          isOptionEqualToValue={(option, value) => option._id === value._id}
          sx={{ minWidth: "400px" }}
        />
      </Box>
      <Typography variant="h6" sx={{ mt: 3 }}>
        Direct Hours by Employee
      </Typography>
      <TableContainer
        component={Paper}
        sx={{ mt: 1, height: "64vh", width: "80vw" }}
      >
        <Table stickyHeader sx={{ width: "100%" }}>
          <TableHead>
            <TableRow>
              {[
                "Name",
                "Direct",
                "OH(4552)",
                "Training(4557)",
                "Total Uncompensated",
                "PTO(1402)",
                "Holiday(1407)",
                "Total Direct",
                "Total Actual",
              ].map((title) => (
                <TableCell
                  key={title}
                  sx={{ textAlign: "center", fontWeight: "bold" }}
                >
                  {title}
                  {title.includes("Holiday") && (
                    <Box sx={{ display: "inline-flex", ml: 1 }}>
                      <IconButton
                        size="small"
                        onClick={() => handleHolidayUpdateAll(true)}
                      >
                        +
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleHolidayUpdateAll(false)}
                      >
                        -
                      </IconButton>
                    </Box>
                  )}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedEmployees.map((employee) => {
              const workHoursEntry = employee.workHours.find(
                (wh) => wh.date === date
              );
              const hasProject = workHoursEntry?.projects?.some(
                (p) => p.projectId === project?._id
              );
 
              const directHours =
                workHoursEntry?.projects?.find(
                  (p) => p?.projectId === project?._id
                )?.direct || 0;
 
              const totalDirect =
                workHoursEntry?.projects?.reduce(
                  (sum, proj) => sum + (proj.direct || 0),
                  0
                ) || 0;
 
              const totalActual =
                totalDirect +
                (workHoursEntry?.OH || 0) +
                (workHoursEntry?.Training || 0) +
                (workHoursEntry?.Holiday || 0) +
                (workHoursEntry?.Total_Uncompensated || 0) +
                (workHoursEntry?.PTO || 0);
 
              return (
                <TableRow
                  key={employee.name}
                  sx={{
                    backgroundColor: hasProject ? "#e0f7fa" : "inherit", // Light blue for highlight
                  }}
                >
                  {/* ...rest of the row remains the same */}
 
                  <TableCell sx={{ textAlign: "center" }}>
                    {employee.name}
                  </TableCell>
 
                  {/* Direct field (editable) */}
                  <TableCell sx={{ textAlign: "center" }}>
                    <TextField
                      type="text"
                      inputMode="numeric"
                      value={directHours}
                      onChange={(e) => {
                        const newValue = e.target.value.replace(/[^0-9]/g, "");
                        handleInputChange(
                          employee.name,
                          "direct",
                          newValue ? parseInt(newValue, 10) : 0
                        );
                      }}
                      variant="outlined"
                      size="small"
                      sx={{ width: "80px", textAlign: "center" }}
                    />
                  </TableCell>
 
                  {/* OH, Training, Total Uncompensated, PTO, Holiday */}
                  {[
                    "OH",
                    "Training",
                    "Total_Uncompensated",
                    "PTO",
                    "Holiday",
                  ].map((field) => (
                    <TableCell key={field} sx={{ textAlign: "center" }}>
                      <TextField
                        type="text"
                        inputMode="numeric"
                        value={workHoursEntry?.[field] ?? 0}
                        onChange={(e) => {
                          const newValue = e.target.value.replace(
                            /[^0-9]/g,
                            ""
                          );
                          handleInputChange(
                            employee.name,
                            field,
                            newValue ? parseInt(newValue, 10) : 0
                          );
                        }}
                        variant="outlined"
                        size="small"
                        sx={{ width: "80px" }}
                      />
                    </TableCell>
                  ))}
 
                  {/* Total Direct */}
                  <TableCell sx={{ textAlign: "center", fontWeight: "bold" }}>
                    {totalDirect}
                  </TableCell>
 
                  {/* Total Actual */}
                  <TableCell sx={{ textAlign: "center", fontWeight: "bold" }}>
                    {totalActual}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
      <Box sx={{ mt: 2, display: "flex", justifyContent: "center" }}>
        <Button variant="contained" color="primary" onClick={handleSave}>
          Save
        </Button>
      </Box>
    </Box>
  );
};

export default Home;
