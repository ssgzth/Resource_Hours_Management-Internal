// // import { useState } from "react";
// // import { 
// //   Box, 
// //   Typography, 
// //   TextField, 
// //   Button, 
// //   Link, 
// //   Paper, 
// //   Container,
// //   CircularProgress
// // } from "@mui/material";
// // import axios from "axios";

// // const Login = ({ onLogin }) => {
// //   const [isLogin, setIsLogin] = useState(true);
// //   const [formData, setFormData] = useState({
// //     username: '',
// //     password: '',
// //     role: 'user'
// //   });
// //   const [message, setMessage] = useState('');
// //   const [loading, setLoading] = useState(false);

// //   const handleChange = (e) => {
// //     setFormData({
// //       ...formData,
// //       [e.target.name]: e.target.value
// //     });
// //   };

// //   const handleSubmit = async (e) => {
// //     e.preventDefault();
// //     setMessage('');
// //     setLoading(true);
    
// //     try {
// //       const endpoint = isLogin ? '/api/login' : '/api/register';
// //       const response = await axios.post(`http://localhost:5000${endpoint}`, formData);
      
// //       setMessage(response.data.message);
// //       onLogin(response.data.user, response.data.token);
// //     } catch (error) {
// //       setMessage(error.response?.data?.message || 'An error occurred');
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   return (
// //     <Container  maxWidth="sm" sx={{ mt: 8 }}>
// //       <Paper elevation={3} sx={{ p: 4 }}>
// //         <Typography variant="h4" gutterBottom align="center">
// //           {isLogin ? 'Login' : 'Register'}
// //         </Typography>
// //         <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
// //           <TextField
// //             fullWidth
// //             margin="normal"
// //             label="Username"
// //             name="username"
// //             value={formData.username}
// //             onChange={handleChange}
// //             required
// //           />
// //           <TextField
// //             fullWidth
// //             margin="normal"
// //             label="Password"
// //             type="password"
// //             name="password"
// //             value={formData.password}
// //             onChange={handleChange}
// //             required
// //           />
// //           {!isLogin && (
// //             <TextField
// //               fullWidth
// //               margin="normal"
// //               select
// //               label="Role"
// //               name="role"
// //               value={formData.role}
// //               onChange={handleChange}
// //               SelectProps={{
// //                 native: true,
// //               }}
// //             >
// //               <option value="user">User</option>
// //               <option value="manager">Manager</option>
// //               <option value="admin">Admin</option>
// //             </TextField>
// //           )}
// //           <Button
// //             fullWidth
// //             variant="contained"
// //             type="submit"
// //             disabled={loading}
// //             sx={{ mt: 3, mb: 2 }}
// //           >
// //             {loading ? <CircularProgress size={24} /> : isLogin ? 'Login' : 'Register'}
// //           </Button>
// //           <Typography align="center">
// //             {isLogin ? "Don't have an account? " : "Already have an account? "}
// //             <Link 
// //               component="button" 
// //               onClick={() => setIsLogin(!isLogin)}
// //               underline="hover"
// //             >
// //               {isLogin ? 'Register' : 'Login'}
// //             </Link>
// //           </Typography>
// //           {message && (
// //             <Typography 
// //               color={message.includes('success') ? 'success.main' : 'error.main'}
// //               align="center"
// //               sx={{ mt: 2 }}
// //             >
// //               {message}
// //             </Typography>
// //           )}
// //         </Box>
// //       </Paper>
// //     </Container>
// //   );
// // };

// // export default Login;



// import { useState } from "react";
// import { 
//   Box, 
//   Typography, 
//   TextField, 
//   Button,
//   Paper, 
//   Container,
//   CircularProgress,
//   Stack,
//   Divider
// } from "@mui/material";
// import axios from "axios";

// const Login = ({ onLogin }) => {
//   const [formData, setFormData] = useState({
//     username: '',
//     password: ''
//   });
//   const [message, setMessage] = useState('');
//   const [loading, setLoading] = useState(false);

//   const handleChange = (e) => {
//     setFormData({
//       ...formData,
//       [e.target.name]: e.target.value
//     });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setMessage('');
//     setLoading(true);
    
//     try {
//       const response = await axios.post(`http://localhost:5000/api/login`, formData);
//       setMessage(response.data.message);
//       onLogin(response.data.user, response.data.token);
//     } catch (error) {
//       setMessage(error.response?.data?.message || 'An error occurred');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleGuestLogin = () => {
//     // Set guest user data directly
//     onLogin({ username: 'guest', password:'test@123', role: 'user' });
//   };

//   return (
//     <Container 
//       maxWidth="sm" 
//       sx={{ 
//         display: 'flex',
        
//         justifyContent: 'center',
//         minHeight: '40vh',
//         minWidth:'100vw',
//         py: 4
//       }}
//     >
//       <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
//         <Typography variant="h4" gutterBottom align="center">
//           Login
//         </Typography>
        
//         <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
//           <TextField
//             fullWidth
//             margin="normal"
//             label="Username"
//             name="username"
//             value={formData.username}
//             onChange={handleChange}
//             required
//           />
//           <TextField
//             fullWidth
//             margin="normal"
//             label="Password"
//             type="password"
//             name="password"
//             value={formData.password}
//             onChange={handleChange}
//             required
//           />
          
//           <Button
//             fullWidth
//             variant="contained"
//             type="submit"
//             disabled={loading}
//             sx={{ mt: 3, mb: 2 }}
//           >
//             {loading ? <CircularProgress size={24} /> : 'Login (Manager/Admin)'}
//           </Button>
          
//           {message && (
//             <Typography 
//               color={message.includes('success') ? 'success.main' : 'error.main'}
//               align="center"
//               sx={{ mt: 2 }}
//             >
//               {message}
//             </Typography>
//           )}
//         </Box>

//         <Divider sx={{ my: 3 }}>OR</Divider>

//         <Stack spacing={2}>
//           <Button
//             fullWidth
//             variant="outlined"
//             onClick={handleGuestLogin}
//             sx={{ py: 1.5 }}
//           >
//             Continue as Guest
//           </Button>
//         </Stack>
//       </Paper>
//     </Container>
//   );
// };

// export default Login;

import { useState } from "react";
import { 
  Box, 
  Typography, 
  TextField, 
  Button,
  Paper, 
  Container,
  CircularProgress,
  Stack,
  Divider
} from "@mui/material";
import axios from "axios";

const Login = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [guestLoading, setGuestLoading] = useState(false);

  // Hardcoded guest credentials (matches your database)
  const GUEST_CREDENTIALS = {
    username: 'guest',
    password: 'test@123' // Should match the hashed password in your DB
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setLoading(true);
    
    try {
      const response = await axios.post(`http://localhost:5000/api/login`, formData);
      onLogin(response.data.user, response.data.token);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = async () => {
    setMessage('');
    setGuestLoading(true);
    
    try {
      // Authenticate with the guest credentials from your database
      const response = await axios.post(`http://localhost:5000/api/login`, {
        username: GUEST_CREDENTIALS.username,
        password: GUEST_CREDENTIALS.password
      });
      
      // Ensure the role is set to 'guest' in the frontend
      const guestUser = {
        ...response.data.user,
        role: 'user' // Override role if needed
      };
      
      onLogin(guestUser, response.data.token);
    } catch (error) {
      setMessage('Guest login failed. Please try again.');
      console.error('Guest login error:', error);
    } finally {
      setGuestLoading(false);
    }
  };

  return (
    <Container 
      maxWidth="sm" 
      sx={{ 
        display: 'flex',        
        justifyContent: 'center',
        minHeight: '40vh',
        minWidth:'100vw',
        py: 4
      }}
    >
      <Paper elevation={3} sx={{ 
        p: 4, 
        width: '100%',
        maxWidth: 400,
        borderRadius: 2
      }}>
        <Typography variant="h4" gutterBottom align="center" sx={{ mb: 3 }}>
          Login
        </Typography>
        
        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            fullWidth
            margin="normal"
            label="Username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
          />
          <TextField
            fullWidth
            margin="normal"
            label="Password"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            sx={{ mb: 2 }}
          />
          
          <Button
            fullWidth
            variant="contained"
            type="submit"
            disabled={loading}
            sx={{ height: 48 }}
          >
            {loading ? <CircularProgress size={24} /> : 'Login (Admin/Manager)'}
          </Button>
          
          {message && (
            <Typography 
              color="error.main"
              align="center"
              sx={{ mt: 2 }}
            >
              {message}
            </Typography>
          )}
        </Box>

        <Divider sx={{ my: 3 }}>OR</Divider>

        <Button
          fullWidth
          variant="outlined"
          onClick={handleGuestLogin}
          disabled={guestLoading}
          sx={{ height: 48 }}
        >
          {guestLoading ? <CircularProgress size={24} /> : 'Continue as Guest'}
        </Button>
      </Paper>
    </Container>
  );
};

export default Login;