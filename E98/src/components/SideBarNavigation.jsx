import React, { useState } from "react";
import {
  Box,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  CssBaseline,
  Button,
  Avatar,
  Divider,
} from "@mui/material";
import {
  Home as HomeIcon,
  Person as ProfileIcon,
  Settings as SettingsIcon,
  Dashboard as DashboardIcon,
  Summarize as SummaryIcon,
  BarChart as ForecastIcon,
  Groups as EmployeeIcon,
  ExitToApp as LogoutIcon,
} from "@mui/icons-material";

import Home from "./Home";
import CreateProject from "./CreateProject";
import Users from "./Users";
import Summary from "./Summary";
import DarkModeToggle from "./DarkModeToggle";
import Employee from "./Employee";
import Forcast from "./Forcast";
import ForecastEmpSummary from "./ForecastEmpSummary";
import Chargibility from "./Chargibility";
import BusinessLine from "./BusinessLine";

const drawerWidth = 270;

const SidebarNavigation = ({ user, handleLogout }) => {   //change
  // const [selectedItem, setSelectedItem] = useState("E98");
  const [selectedItem, setSelectedItem] = useState(() => {
    // For users, default to "Employee"
    if (user?.role === 'user') return "Employee";
    // For managers/admins, default to "E98"
    if (user?.role === 'manager' || user?.role === 'admin') return "E98";
    // Fallback for guests or undefined roles
    return "Employee"; 
  });




  const menuItems = [
    { text: "E98", icon: <HomeIcon />, roles: ['manager', 'admin'] },
    { text: "Forecast", icon: <ForecastIcon />, roles: ['manager', 'admin'] },
    { text: "Projects", icon: <DashboardIcon />, roles: ['manager', 'admin'] },
    { text: "Users", icon: <ProfileIcon />, roles: ['manager', 'admin'] },
    { text: "Employee", icon: <EmployeeIcon />, roles: ['user','manager', 'admin'] },
    { text: "Summary", icon: <SummaryIcon />, roles: ['manager', 'admin'] },
    { text: "ForecastSummary", icon: <SettingsIcon />, roles: ['manager', 'admin'] },
    { text: "Chargibility", icon: <SummaryIcon />, roles: ['manager', 'admin'] },
    { text: "BusinessLine", icon: <SettingsIcon />, roles: ['admin'] },
  ];

  const contentMap = {
    E98: <Home />,
    Projects: <CreateProject />,
    Users: <Users />,
    Summary: <Summary />,
    Employee: <Employee />,
    Forecast: <Forcast />,
    ForecastSummary: <ForecastEmpSummary />,
    Chargibility: <Chargibility />,
    BusinessLine: <BusinessLine />,
  };
  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": (theme) => ({
            width: drawerWidth,
            boxSizing: "border-box",
            backgroundColor: theme.palette.background.paper,
            color: theme.palette.text.primary,
            borderRight: `1px solid ${theme.palette.divider}`,
            boxShadow: "2px 0 5px rgba(0, 0, 0, 0.05)",
          }),
        }}
      >
        {/* <Box sx={{ px: 2, py: 2 }}>
          <Typography variant="h6" fontWeight="bold" color="primary">
            Navigation
          </Typography>
        </Box> */}

        <Box sx={{ p: 2, textAlign: 'center' }}>
          <Avatar sx={{ width: 56, height: 56, mx: 'auto', mb: 1 }} />
          <Typography variant="subtitle1">{user?.username}</Typography>
          <Typography variant="caption" color="text.secondary">
            {user?.role}
          </Typography>
        </Box>

        <Divider />

        <List>
          <ListItemButton disableRipple>
            <DarkModeToggle />
          </ListItemButton>

          {menuItems.filter(item => item.roles.includes(user?.role)).map((item) => (
            <ListItemButton
              key={item.text}
              selected={selectedItem === item.text}
              onClick={() => setSelectedItem(item.text)}
              sx={{
                mx: 1,
                my: 0.5,
                borderRadius: 2,
                "&.Mui-selected": (theme) => ({
                  backgroundColor: theme.palette.action.selected,
                  borderLeft: `4px solid ${theme.palette.primary.main}`,
                  paddingLeft: "20px",
                }),

                "&:hover": {
                  // backgroundColor: "#f5f5f5",
                },
              }}
            >
              <ListItemIcon
                sx={{
                  color: selectedItem === item.text ? "#1976d2" : "inherit",
                  minWidth: "36px",
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={
                  <Typography
                    variant="body1"
                    fontWeight={selectedItem === item.text ? "bold" : "medium"}
                  >
                    {item.text}
                  </Typography>
                }
              />
            </ListItemButton>
          ))}
        </List>
        <Box sx={{ p: 2, mt: 'auto' }}>
          <Button
            fullWidth
            variant="outlined"
            startIcon={<LogoutIcon />}
            onClick={handleLogout}
          >
            Logout
          </Button>
        </Box>
      </Drawer>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          bgcolor: "background.default",
          minHeight: "100vh",
          p: 3,
        }}
      >
        {contentMap[selectedItem] || <Typography>Page not found</Typography>}
      </Box>
    </Box>
  );
};

export default SidebarNavigation;
