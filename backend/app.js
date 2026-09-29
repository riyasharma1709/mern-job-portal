import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();

import connectDB from './config/db.js';
import employerRoutes from './routes/employerRoutes.js';
import employeeRoutes from './routes/employeeRoutes.js';
import postJobRoutes from './routes/postJobRoutes.js';
import profileRoutes from './routes/profileRoutes.js';
import applicationRoutes from './routes/applicationRoutes.js';
import employerProfileRoutes from './routes/employerProfileRoutes.js';

// Initialize express app
const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static("uploads"));
// Routes
app.use('/api/employers', employerRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/jobs', postJobRoutes);
app.use('/api/profiles', profileRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/employer-profile', employerProfileRoutes);

// root route
app.get('/', (req, res) => {
  res.send('Employer API is running...');
});


const PORT = process.env.PORT || 5000;


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
