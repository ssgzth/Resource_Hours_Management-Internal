// import { Button, Typography } from "@mui/material";
// import SidebarNavigation from "./components/SideBarNavigation";
// import ThemeProviderWrapper from "./components/ThemeProviderWrapper";

// function App() {
//   return (
//     <div style={{}}>
//       <ThemeProviderWrapper>
//         <SidebarNavigation />
//       </ThemeProviderWrapper>
//     </div>
//   );
// }

// export default App;

import { useState, useEffect } from "react";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import ThemeProviderWrapper from "./components/ThemeProviderWrapper";
import Login from "./components/Login";
import SidebarNavigation from "./components/SideBarNavigation";
import axios from "axios";

function App() {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check auth status on app load
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get('http://localhost:5000/api/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUser(response.data.user);
        setIsAuthenticated(true);
      } catch (error) {
        localStorage.removeItem('token');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const handleLogin = (userData, token) => {
    localStorage.setItem('token', token);
    setUser(userData);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setIsAuthenticated(false);
  };

  if (loading) {
    return (
      <ThemeProviderWrapper>
        <CssBaseline />
        <div>Loading...</div>
      </ThemeProviderWrapper>
    );
  }

  return (
    <ThemeProviderWrapper>
      <CssBaseline />
      {isAuthenticated ? (
        <SidebarNavigation user={user} handleLogout={handleLogout} />
      ) : (
        <Login onLogin={handleLogin} />
      )}
    </ThemeProviderWrapper>
  );
}

export default App;