import mongoose from 'mongoose';
import employeeConnection from '../config/employeeDb.js';

const employeeProfileSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
    unique: true,
  },
  location: {
    type: String,
    required: true,
  },
  qualification: {
    type: String,
    required: true,
  },
  skills: {
    type: [String],
    required: true,
  },
  profileImage: {
    type: String,
  },
  resume: {
    type: String,
  }
}, { timestamps: true });

const EmployeeProfile = employeeConnection.model('EmployeeProfile', employeeProfileSchema);

export default EmployeeProfile;
