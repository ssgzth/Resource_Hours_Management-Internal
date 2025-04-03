import React, { useContext } from "react";
import { ThemeContext } from "./ThemeProviderWrapper";
import { IconButton } from "@mui/material";
import { DarkMode, LightMode } from "@mui/icons-material";

const DarkModeToggle = () => {
  const { darkMode, toggleTheme } = useContext(ThemeContext);

  return (
    <IconButton onClick={toggleTheme} color="inherit">
      {darkMode ? <LightMode /> : <DarkMode />}
    </IconButton>
  );
};

export default DarkModeToggle;
