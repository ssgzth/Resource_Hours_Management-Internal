// import express from "express";
// import mongoose from "mongoose";
// import cors from "cors";
// import dotenv from "dotenv";
// import businessRouter from "./routes/businessLinesRoutes.js";
// import employeeRoutes from "./routes/EmployeeRoutes.js";
// import projectRoutes from "./routes/projectRoutes.js";
// import workHoursRoutes from "./routes/workHoursRoutes.js";
// import "./config/scheduler.js";
// import "./config/cronjob.js";

// dotenv.config();

// const app = express();
// const PORT = process.env.PORT || 5000;

// // Middleware
// app.use(cors());
// app.use(express.json());

// // MongoDB Connection
// mongoose
//   .connect(process.env.MONGO_URI)
//   .then(() => console.log("MongoDB connected"))
//   .catch((err) => console.log("DB Connection Error:", err));

// // Routes

// app.use("/api/business-lines", businessRouter);
// app.use("/api/employees", employeeRoutes);
// app.use("/api/projects", projectRoutes);
// app.use("/api/workhours", workHoursRoutes);

// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));





import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import businessRouter from "./routes/businessLinesRoutes.js";
import employeeRoutes from "./routes/employeeRoutes.js";
import projectRoutes from "./routes/projectRoutes.js";
import workHoursRoutes from "./routes/workHoursRoutes.js";
import "./config/scheduler.js";
import "./config/cronjob.js";

dotenv.config();
const PORT = process.env.PORT || 5000;


// Middleware
app.use(cors());
app.use(express.json());
const app = express();
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log("DB Connection Error:", err));

// User Model
const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 20
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    enum: ['admin', 'manager', 'user'],
    default: 'user'
  }
});

const User = mongoose.model('User', UserSchema);

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Auth Middleware
const authenticate = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ message: 'No token, authorization denied' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

const authorize = (roles = []) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden - Insufficient permissions' });
    }
    next();
  };
};

// Auth Routes
app.post('/api/register', async (req, res) => {
  try {
    const { username, password, role = 'user' } = req.body;
    
    // Validation
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }
    
    // Check if user exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: 'Username already exists' });
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Create new user
    const user = new User({ username, password: hashedPassword, role });
    await user.save();
    
    // Create token
    const token = jwt.sign({ id: user._id, username: user.username, role: user.role }, JWT_SECRET, {
      expiresIn: '1h'
    });
    
    res.status(201).json({ 
      message: 'User registered successfully',
      token,
      user: { username: user.username, role: user.role }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Validation
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }
    
    // Find user
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    // Create token
    const token = jwt.sign({ id: user._id, username: user.username, role: user.role }, JWT_SECRET, {
      expiresIn: '1h'
    });
    
    res.json({ 
      message: 'Login successful',
      token,
      user: { username: user.username, role: user.role }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// // Protected route example
// app.get('/api/profile', authenticate, (req, res) => {
//   res.json({ user: req.user });
// });

// Apply authentication to existing routes
app.use("/api/business-lines", authenticate, businessRouter);
app.use("/api/employees", authenticate, employeeRoutes);
app.use("/api/projects", authenticate, projectRoutes);
app.use("/api/workhours", authenticate, workHoursRoutes);

// // Admin-only route example
// app.get('/api/admin-only', authenticate, authorize(['admin']), (req, res) => {
//   res.json({ message: 'Admin access granted' });
// });

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
