import React, { useState, useEffect, useMemo } from "react";
import { Box, Typography, TextField, Grid } from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import axios from "axios";
import {
  BarChart,
  ResponsiveContainer,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line,
} from "recharts";

const API_BASE_URL = "http://localhost:5000";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

const Summary = () => {
  const [data, setData] = useState({ businessLines: [] });
  const [businessLine, setBusinessLine] = useState("");
  const [year, setYear] = useState("");
  const [availableYears, setAvailableYears] = useState([]);
  const [workHoursData, setWorkHoursData] = useState([]);
  const [forecastHoursData, setForecastHoursData] = useState([]);

  const WEEKS = ["W1", "W2", "W3", "W4", "W5"];
  const MONTH_NAMES = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  useEffect(() => {
    // axios
    //   .get(`${API_BASE_URL}/api/business-lines`)
    axios.get(`${API_BASE_URL}/api/business-lines`, {
      headers: { 
        Authorization: `Bearer ${localStorage.getItem('token')}` 
      }
    })
      .then((response) => {
        const businessLines = response.data;
        setData({ businessLines });

        // Extract unique years from both workHours and forecastHours
        const years = new Set();
        businessLines.forEach((bl) => {
          bl.employees?.forEach((emp) => {
            // Check both workHours and forecastHours
            const hoursData = [
              ...(emp.workHours || []),
              ...(emp.forecastHours || []),
            ];
            hoursData.forEach((wh) => {
              if (wh.date) {
                const dataYear = new Date(wh.date).getFullYear();
                years.add(dataYear);
              }
            });
          });
        });

        setAvailableYears(Array.from(years).sort((a, b) => b - a));
      })
      .catch((error) => console.error("Error fetching business lines:", error));
  }, []);

  useEffect(() => {
    if (!data.businessLines.length) {
      setWorkHoursData([]);
      setForecastHoursData([]);
      return;
    }

    let employees = [];
    if (!businessLine) {
      employees = data.businessLines.flatMap((bl) => bl.employees || []);
    } else {
      const blObj = data.businessLines.find((bl) => bl.name === businessLine);
      if (!blObj) {
        setWorkHoursData([]);
        setForecastHoursData([]);
        return;
      }
      employees = blObj.employees || [];
    }

    // Process workHours data
    const workHoursEmployees = year
      ? employees.map((emp) => ({
          ...emp,
          workHours: emp.workHours?.filter(
            (wh) =>
              wh.date && new Date(wh.date).getFullYear() === parseInt(year)
          ),
        }))
      : employees;

    const workMonthWeekMap = computeMonthWeekUtilization(
      workHoursEmployees,
      "workHours"
    );
    const workSummaryArr = buildSummaryArray(workMonthWeekMap);
    setWorkHoursData(workSummaryArr);

    // Process forecastHours data
    const forecastHoursEmployees = year
      ? employees.map((emp) => ({
          ...emp,
          forecastHours: emp.forecastHours?.filter(
            (wh) =>
              wh.date && new Date(wh.date).getFullYear() === parseInt(year)
          ),
        }))
      : employees;

    const forecastMonthWeekMap = computeMonthWeekUtilization(
      forecastHoursEmployees,
      "forecastHours"
    );
    const forecastSummaryArr = buildSummaryArray(forecastMonthWeekMap);
    setForecastHoursData(forecastSummaryArr);
  }, [businessLine, year, data]);

  const computeMonthWeekUtilization = (employees, hoursField) => {
    const monthWeekMap = {};
    for (let i = 0; i < 12; i++) {
      monthWeekMap[i] = {
        W1: { direct: 0, actual: 0 },
        W2: { direct: 0, actual: 0 },
        W3: { direct: 0, actual: 0 },
        W4: { direct: 0, actual: 0 },
        W5: { direct: 0, actual: 0 },
      };
    }

    employees.forEach((emp) => {
      (emp[hoursField] || []).forEach((wh) => {
        if (!wh.date) return;

        const dateObj = new Date(wh.date);
        const monthIndex = dateObj.getMonth();
        const weekLabel = getWeekLabelInMonth(dateObj);

        const directHours = (wh.projects || []).reduce(
          (sum, proj) => sum + (proj.direct || 0),
          0
        );

        const actualHours =
          directHours +
          (wh.OH || 0) +
          (wh.Training || 0) +
          (wh.PTO || 0) +
          (wh.Holiday || 0) +
          (wh.Total_Uncompensated || 0);

        const adjustedActual =
          actualHours -
          (wh.PTO || 0) -
          (wh.Holiday || 0) -
          (wh.Total_Uncompensated || 0);

        if (monthWeekMap[monthIndex]?.[weekLabel]) {
          monthWeekMap[monthIndex][weekLabel].direct += directHours;
          monthWeekMap[monthIndex][weekLabel].actual += adjustedActual;
        }
      });
    });

    return monthWeekMap;
  };

  const getWeekLabelInMonth = (dateObj) => {
    const day = dateObj.getDate();
    if (day <= 7) return "W1";
    if (day <= 14) return "W2";
    if (day <= 21) return "W3";
    if (day <= 28) return "W4";
    return "W5";
  };

  const buildSummaryArray = (monthWeekMap) => {
    const result = [];
    for (let i = 0; i < 12; i++) {
      const rowObj = { month: MONTH_NAMES[i] };
      let totalDirect = 0;
      let totalActual = 0;

      WEEKS.forEach((weekLabel) => {
        const { direct, actual } = monthWeekMap[i][weekLabel];
        if (actual > 0) {
          const utilization = (direct / actual) * 100;
          rowObj[weekLabel] = utilization.toFixed(2) + "%";
        } else {
          rowObj[weekLabel] = "-";
        }
        totalDirect += direct;
        totalActual += actual;
      });

      if (totalActual > 0) {
        const avg = (totalDirect / totalActual) * 100;
        rowObj["Avg"] = avg.toFixed(2) + "%";
      } else {
        rowObj["Avg"] = "-";
      }

      result.push(rowObj);
    }
    return result;
  };

  const prepareChartData = (summaryData) => {
    return summaryData.map((month) => {
      const parseValue = (value) => {
        if (typeof value === "string" && value.endsWith("%")) {
          return parseFloat(value.replace("%", ""));
        }
        return 0;
      };

      return {
        month: month.month,
        W1: parseValue(month.W1),
        W2: parseValue(month.W2),
        W3: parseValue(month.W3),
        W4: parseValue(month.W4),
        W5: parseValue(month.W5),
        Avg: parseValue(month.Avg),
      };
    });
  };

  const buildTrendlineData = (actualData, forecastData) => {
    const WEEKS = ["W1", "W2", "W3", "W4", "W5"];
    const MONTHS = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
 
    const parse = (val) =>
      typeof val === "string" && val.endsWith("%")
        ? parseFloat(val.replace("%", ""))
        : null;
 
    const trend = [];
 
    for (let i = 0; i < 12; i++) {
      for (let w = 0; w < WEEKS.length; w++) {
        const weekLabel = `${MONTHS[i]}-${WEEKS[w]}`;
        const actualVal = parse(actualData[i]?.[WEEKS[w]]);
        const forecastVal = parse(forecastData[i]?.[WEEKS[w]]);
 
        if (actualVal !== null || forecastVal !== null) {
          trend.push({
            week: weekLabel,
            Actual: actualVal,
            Forecast: forecastVal,
          });
        }
      }
    }
    return trend;
  };
 

  const workChartData = useMemo(
    () => prepareChartData(workHoursData),
    [workHoursData]
  );
  const forecastChartData = useMemo(
    () => prepareChartData(forecastHoursData),
    [forecastHoursData]
  );

  const trendlineData = useMemo(() => {
    return buildTrendlineData(workHoursData, forecastHoursData);
  }, [workHoursData, forecastHoursData]);

  return (
    <Box sx={{ px: 3, py: 2, width: "82vw" }}>
      <Typography variant="h4" gutterBottom>
        Summary
      </Typography>

      <Box
        sx={{ display: "flex", gap: 2, p: 2, width: "100%", flexWrap: "wrap" }}
      >
        {/* Business Line Filter */}
        <Autocomplete
          options={data.businessLines.map((b) => b.name)}
          value={businessLine}
          onChange={(event, newValue) => setBusinessLine(newValue || "")}
          renderInput={(params) => (
            <TextField {...params} label="Business Line" variant="outlined" />
          )}
          sx={{ minWidth: "200px" }}
        />

        {/* Year Filter */}
        <Autocomplete
          options={availableYears.map((y) => y.toString())}
          value={year}
          onChange={(event, newValue) => setYear(newValue || "")}
          renderInput={(params) => (
            <TextField {...params} label="Year" variant="outlined" />
          )}
          sx={{ minWidth: "200px" }}
        />
      </Box>

      {/* Visualization Section */}
      <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
        Data Visualization
      </Typography>

      <Grid container spacing={4} sx={{ mt: 2 }}>
        {/* Work Hours Chart */}
        <Grid item xs={12} md={6}>
          <Box sx={{ height: 400, width: "100%" }}>
            <Typography variant="h6" gutterBottom>
              Actual Weekly Chargibility by Month
            </Typography>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={workChartData} syncId="workForecastSync">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis unit="%" domain={[0, 100]} />
                <Tooltip />
                <Legend />
                <Bar dataKey="W1" fill={COLORS[0]} name="Week 1" />
                <Bar dataKey="W2" fill={COLORS[1]} name="Week 2" />
                <Bar dataKey="W3" fill={COLORS[2]} name="Week 3" />
                <Bar dataKey="W4" fill={COLORS[3]} name="Week 4" />
                <Bar dataKey="W5" fill={COLORS[4]} name="Week 5" />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </Grid>

        {/* Forecast Hours Chart */}
        <Grid item xs={12} md={6}>
          <Box sx={{ height: 400, width: "100%" }}>
            <Typography variant="h6" gutterBottom>
              Forecasted Weekly Chargibility by Month
            </Typography>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={forecastChartData} syncId="workForecastSync">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis unit="%" domain={[0, 100]} />
                <Tooltip />
                <Legend />
                <Bar dataKey="W1" fill={COLORS[0]} name="Week 1" />
                <Bar dataKey="W2" fill={COLORS[1]} name="Week 2" />
                <Bar dataKey="W3" fill={COLORS[2]} name="Week 3" />
                <Bar dataKey="W4" fill={COLORS[3]} name="Week 4" />
                <Bar dataKey="W5" fill={COLORS[4]} name="Week 5" />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </Grid>
        <Grid item xs={12}>
          <Box sx={{ height: 400, width: "100%" }}>
            <Typography variant="h6" gutterBottom>
              Actual vs Forecast Chargibility Trend
            </Typography>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendlineData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" />
                <YAxis unit="%" domain={[0, 100]} />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="Actual"
                  stroke="#8884d8"
                  strokeWidth={2}
                  dot={false}
                  connectNulls={false} // Ensures lines are broken at null data points
                />
                <Line
                  type="monotone"
                  dataKey="Forecast"
                  stroke="#82ca9d"
                  strokeWidth={2}
                  dot={false}
                  connectNulls={false} // Ensures lines are broken at null data points
                />
              </LineChart>
            </ResponsiveContainer>
          </Box>
        </Grid>
        {/* Tabular Data View */}
        <Grid item xs={12}>
          <Box sx={{ mt: 4 }}>
            <Typography variant="h6" gutterBottom>
              Weekly Chargibility (Actual)
            </Typography>
            <Box sx={{ overflowX: "auto" }}>
              <table style={{ borderCollapse: "collapse", width: "100%" }}>
                <thead>
                  <tr>
                    <th style={{ padding: "8px", border: "1px solid #ccc" }}>
                      Month
                    </th>
                    {WEEKS.map((week) => (
                      <th
                        key={week}
                        style={{ padding: "8px", border: "1px solid #ccc" }}
                      >
                        {week}
                      </th>
                    ))}
                    <th style={{ padding: "8px", border: "1px solid #ccc" }}>
                      Avg
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {workHoursData.map((row, idx) => (
                    <tr key={idx}>
                      <td style={{ padding: "8px", border: "1px solid #ccc" }}>
                        {row.month}
                      </td>
                      {WEEKS.map((week) => (
                        <td
                          key={week}
                          style={{ padding: "8px", border: "1px solid #ccc" }}
                        >
                          {row[week]}
                        </td>
                      ))}
                      <td style={{ padding: "8px", border: "1px solid #ccc" }}>
                        {row.Avg}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Box>
          </Box>

          <Box sx={{ mt: 4 }}>
            <Typography variant="h6" gutterBottom>
              Weekly Chargibility (Forecast)
            </Typography>
            <Box sx={{ overflowX: "auto" }}>
              <table style={{ borderCollapse: "collapse", width: "100%" }}>
                <thead>
                  <tr>
                    <th style={{ padding: "8px", border: "1px solid #ccc" }}>
                      Month
                    </th>
                    {WEEKS.map((week) => (
                      <th
                        key={week}
                        style={{ padding: "8px", border: "1px solid #ccc" }}
                      >
                        {week}
                      </th>
                    ))}
                    <th style={{ padding: "8px", border: "1px solid #ccc" }}>
                      Avg
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {forecastHoursData.map((row, idx) => (
                    <tr key={idx}>
                      <td style={{ padding: "8px", border: "1px solid #ccc" }}>
                        {row.month}
                      </td>
                      {WEEKS.map((week) => (
                        <td
                          key={week}
                          style={{ padding: "8px", border: "1px solid #ccc" }}
                        >
                          {row[week]}
                        </td>
                      ))}
                      <td style={{ padding: "8px", border: "1px solid #ccc" }}>
                        {row.Avg}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Summary;
