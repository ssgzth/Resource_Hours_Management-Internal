import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Typography,
  TextField,
  Paper,
  Grid,
  MenuItem,
} from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import axios from "axios";
import { parseISO } from "date-fns";

const API_BASE_URL = "http://localhost:5000";

const Chargibility = () => {
  const [data, setData] = useState({ businessLines: [] });
  const [selectedBL, setSelectedBL] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [availableDates, setAvailableDates] = useState([]);

  useEffect(() => {
    axios.get(`${API_BASE_URL}/api/business-lines`, {
      headers: { 
        Authorization: `Bearer ${localStorage.getItem('token')}` 
      }
    })
      .then((res) => {
      const businessLines = res.data;
      setData({ businessLines });

      const datesSet = new Set();
      businessLines.forEach((bl) =>
        bl.employees?.forEach((emp) =>
          emp.workHours?.forEach((wh) => {
            if (wh.date) datesSet.add(wh.date);
          })
        )
      );

      const allDates = [...datesSet].sort((a, b) => new Date(b) - new Date(a));
      setAvailableDates(allDates);

      const today = new Date();
      const monday = new Date(
        today.setDate(today.getDate() - today.getDay() + 1)
      );
      const currentWeekDate = allDates.find((d) => {
        const dateObj = new Date(d);
        return (
          dateObj >= monday &&
          dateObj < new Date(monday.getTime() + 7 * 86400000)
        );
      });
      if (currentWeekDate) setSelectedDate(currentWeekDate);
    });
  }, []);

  const selectedEmployees = useMemo(() => {
    if (!selectedBL) {
      return data.businessLines.flatMap((bl) => bl.employees || []);
    }
    const blObj = data.businessLines.find((bl) => bl.name === selectedBL);
    return blObj?.employees || [];
  }, [selectedBL, data]);

  const calculateUtilization = (
    employees,
    targetDate,
    type = "work",
    forecastTarget = null
  ) => {
    if (!targetDate) return "-";

    let totalDirect = 0;
    let totalActual = 0;

    const targetDateObj = parseISO(targetDate);
    const normalizedForecastDate = forecastTarget
      ? parseISO(forecastTarget)
      : null;

    employees.forEach((emp) => {
      const hoursList = type === "work" ? emp.workHours : emp.forecastHours;
      if (!hoursList) return;

      hoursList.forEach((entry) => {
        const entryDate = parseISO(entry.date);
        if (
          (type === "work" &&
            entryDate.getTime() === targetDateObj.getTime()) ||
          (type === "forecast" &&
            normalizedForecastDate &&
            entryDate.getTime() === normalizedForecastDate.getTime())
        ) {
          const direct = (entry.projects || []).reduce(
            (sum, p) => sum + (p.direct || 0),
            0
          );
          const actual =
            direct +
            (entry.OH || 0) +
            (entry.PTO || 0) +
            (entry.Training || 0) +
            (entry.Holiday || 0) +
            (entry.Total_Uncompensated || 0);

          const adjustedActual =
            actual -
            (entry.PTO || 0) -
            (entry.Holiday || 0) -
            (entry.Total_Uncompensated || 0);

          totalDirect += direct;
          totalActual += adjustedActual;
        }
      });
    });

    if (totalActual === 0) return "-";
    return ((totalDirect / totalActual) * 100).toFixed(2) + "%";
  };

  const forecastDates = useMemo(() => {
    const forecastSet = new Set();
    selectedEmployees.forEach((emp) =>
      emp.forecastHours?.forEach((f) => forecastSet.add(f.date))
    );
    return [...forecastSet]
      .sort()
      .filter((d) => d > selectedDate)
      .slice(0, 2);
  }, [selectedEmployees, selectedDate]);

  const workUtilization = useMemo(
    () => calculateUtilization(selectedEmployees, selectedDate, "work"),
    [selectedEmployees, selectedDate]
  );

  const forecastUtil1 = useMemo(
    () =>
      calculateUtilization(
        selectedEmployees,
        selectedDate,
        "forecast",
        forecastDates[0]
      ),
    [selectedEmployees, selectedDate, forecastDates]
  );

  const forecastUtil2 = useMemo(
    () =>
      calculateUtilization(
        selectedEmployees,
        selectedDate,
        "forecast",
        forecastDates[1]
      ),
    [selectedEmployees, selectedDate, forecastDates]
  );

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>
        Chargibility Dashboard
      </Typography>

      <Box sx={{ display: "flex", gap: 2, mt: 2, flexWrap: "wrap" }}>
        <Autocomplete
          options={data.businessLines.map((bl) => bl.name)}
          value={selectedBL}
          onChange={(e, val) => setSelectedBL(val || "")}
          renderInput={(params) => (
            <TextField {...params} label="Business Line (optional)" />
          )}
          sx={{ minWidth: 250 }}
        />
        <TextField
          select
          label="WorkHours Date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          sx={{ minWidth: 250 }}
        >
          {availableDates.map((date) => (
            <MenuItem key={date} value={date}>
              {date}
            </MenuItem>
          ))}
        </TextField>
      </Box>

      <Grid container spacing={4} sx={{ mt: 4 }}>
        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 3, textAlign: "center" }}>
            <Typography variant="h6">WorkHours Chargibility</Typography>
            <Typography variant="body2">{selectedDate}</Typography>
            <Typography variant="h4" sx={{ mt: 1, color: "#1976d2" }}>
              {workUtilization}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 3, textAlign: "center" }}>
            <Typography variant="h6">Forecast Chargibility</Typography>
            <Typography variant="body2">{forecastDates[0]}</Typography>
            <Typography variant="h4" sx={{ mt: 1, color: "#2e7d32" }}>
              {forecastUtil1}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 3, textAlign: "center" }}>
            <Typography variant="h6">Forecast Chargibility</Typography>
            <Typography variant="body2">{forecastDates[1]}</Typography>
            <Typography variant="h4" sx={{ mt: 1, color: "#2e7d32" }}>
              {forecastUtil2}
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Chargibility;
