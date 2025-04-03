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
} from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import axios from "axios";

const API_BASE_URL = "http://localhost:5000";

const ForecastEmpSummary = () => {
  const [data, setData] = useState({ businessLines: [] });
  const [businessLine, setBusinessLine] = useState("");
  const [selectedDate, setSelectedDate] = useState(null);
  const [employeeDifferences, setEmployeeDifferences] = useState([]);
  const [availableDates, setAvailableDates] = useState([]);
  const [overallWorkUtilization, setOverallWorkUtilization] = useState(0);
  const [overallForecastUtilization, setOverallForecastUtilization] =
    useState(0);

  useEffect(() => {
    // axios.get(`${API_BASE_URL}/api/business-lines`)
    axios.get(`${API_BASE_URL}/api/business-lines`, {
      headers: { 
        Authorization: `Bearer ${localStorage.getItem('token')}` 
      }
    })
      .then((response) => {
      const businessLines = response.data;
      setData({ businessLines });

      const dates = new Set();
      businessLines.forEach((bl) => {
        bl.employees?.forEach((emp) => {
          const workDates = new Set(emp.workHours?.map((wh) => wh.date) || []);
          const forecastDates = new Set(
            emp.forecastHours?.map((fh) => fh.date) || []
          );
          workDates.forEach((date) => {
            if (forecastDates.has(date)) {
              dates.add(date);
            }
          });
        });
      });

      const sortedDates = Array.from(dates).sort(
        (a, b) => new Date(b) - new Date(a)
      );
      setAvailableDates(sortedDates);
      if (sortedDates.length > 0) setSelectedDate(sortedDates[0]);
    });
  }, []);

  useEffect(() => {
    if (!data.businessLines.length || !selectedDate) return;

    let employees = businessLine
      ? data.businessLines.find((bl) => bl.name === businessLine)?.employees ||
        []
      : data.businessLines.flatMap((bl) => bl.employees || []);

    let totalWorkDirect = 0,
      totalWorkAdjusted = 0;
    let totalForecastDirect = 0,
      totalForecastAdjusted = 0;

    const differences = employees.map((emp) => {
      const work = computeTotals(emp, "workHours");
      const forecast = computeTotals(emp, "forecastHours");

      const workAdj =
        work.empActual - work.PTO - work.Holiday - work.Total_Uncompensated;
      const forecastAdj =
        forecast.empActual -
        forecast.PTO -
        forecast.Holiday -
        forecast.Total_Uncompensated;

      const workUtil = workAdj > 0 ? (work.empDirect / workAdj) * 100 : 0;
      const forecastUtil =
        forecastAdj > 0 ? (forecast.empDirect / forecastAdj) * 100 : 0;

      totalWorkDirect += work.empDirect;
      totalWorkAdjusted += workAdj;
      totalForecastDirect += forecast.empDirect;
      totalForecastAdjusted += forecastAdj;

      return {
        employeeId: emp._id,
        employeeName: emp.name,
        workUtilization: workUtil.toFixed(2),
        forecastUtilization: forecastUtil.toFixed(2),
        difference: (forecastUtil - workUtil).toFixed(2),
        isSignificant: Math.abs(forecastUtil - workUtil) >= 10,
      };
    });

    setEmployeeDifferences(differences);
    setOverallWorkUtilization(
      (totalWorkAdjusted > 0
        ? (totalWorkDirect / totalWorkAdjusted) * 100
        : 0
      ).toFixed(2)
    );
    setOverallForecastUtilization(
      (totalForecastAdjusted > 0
        ? (totalForecastDirect / totalForecastAdjusted) * 100
        : 0
      ).toFixed(2)
    );
  }, [businessLine, selectedDate, data]);

  const computeTotals = (emp, type) => {
    let empDirect = 0,
      empActual = 0,
      PTO = 0,
      Holiday = 0,
      Training = 0,
      OH = 0,
      Total_Uncompensated = 0;
    emp[type]?.forEach((entry) => {
      if (entry.date === selectedDate) {
        empDirect += (entry.projects || []).reduce(
          (sum, p) => sum + (p.direct || 0),
          0
        );
        PTO += entry.PTO || 0;
        Holiday += entry.Holiday || 0;
        Training += entry.Training || 0;
        OH += entry.OH || 0;
        Total_Uncompensated += entry.Total_Uncompensated || 0;
      }
    });
    empActual = empDirect + PTO + Holiday + Training + OH + Total_Uncompensated;
    return {
      empDirect,
      empActual,
      PTO,
      Holiday,
      Training,
      OH,
      Total_Uncompensated,
    };
  };

  return (
    <Box sx={{ px: 3, py: 2, width: "82vw" }}>
      <Typography variant="h4" gutterBottom>
        Utilization Difference Report
      </Typography>

      <Box sx={{ display: "flex", gap: 2, mb: 2, flexWrap: "wrap" }}>
        <Autocomplete
          options={data.businessLines.map((b) => b.name)}
          value={businessLine}
          onChange={(e, val) => setBusinessLine(val || "")}
          renderInput={(params) => (
            <TextField {...params} label="Business Line" />
          )}
          sx={{ minWidth: 200 }}
        />
        <Autocomplete
          options={availableDates}
          value={selectedDate}
          onChange={(e, val) => setSelectedDate(val || null)}
          renderInput={(params) => <TextField {...params} label="Date" />}
          sx={{ minWidth: 200 }}
        />
        <Paper elevation={2} sx={{ px: 3, py: 2, minWidth: 200 }}>
          <Typography variant="body2">Actual Utilization</Typography>
          <Typography variant="h6" color="primary">
            {overallWorkUtilization}%
          </Typography>
        </Paper>
        <Paper elevation={2} sx={{ px: 3, py: 2, minWidth: 200 }}>
          <Typography variant="body2">Forecast Utilization</Typography>
          <Typography variant="h6" color="green">
            {overallForecastUtilization}%
          </Typography>
        </Paper>
        <Paper elevation={2} sx={{ px: 3, py: 2, minWidth: 200 }}>
          <Typography variant="body2">Diff Utilization</Typography>
          <Typography variant="h6" color="red">
            {(overallForecastUtilization - overallWorkUtilization).toFixed(2)}%
          </Typography>
        </Paper>
      </Box>

      <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
        {selectedDate &&
          `Significant Utilization Differences (>10%) for ${selectedDate}`}
      </Typography>

      {employeeDifferences.length > 0 ? (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Employee</TableCell>
                <TableCell align="right">Actual Utilization (%)</TableCell>
                <TableCell align="right">Forecast Utilization (%)</TableCell>
                <TableCell align="right">Difference (%)</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {employeeDifferences
                .sort((a, b) => Math.abs(b.difference) - Math.abs(a.difference))
                .map((emp) => (
                  <TableRow
                    key={emp.employeeId}
                    sx={{
                      backgroundColor: emp.isSignificant
                        ? "#ffebee"
                        : "inherit",
                    }}
                  >
                    <TableCell>{emp.employeeName}</TableCell>
                    <TableCell align="right">{emp.workUtilization}%</TableCell>
                    <TableCell align="right">
                      {emp.forecastUtilization}%
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{
                        color: emp.difference > 0 ? "red" : "green",
                        fontWeight: "bold",
                      }}
                    >
                      {emp.difference > 0 ? "+" : ""}
                      {emp.difference}%
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Typography>No significant differences found.</Typography>
      )}
    </Box>
  );
};

export default ForecastEmpSummary;
