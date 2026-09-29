import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import employeeConnection from '../config/employeeDb.js';

const employeeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  phone: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  savedJobs: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PostJob'
  }]
}, { timestamps: true });

// Hash password before saving
employeeSchema.pre('save', async function () {
  if (!this.isModified('password')) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password (for login)
employeeSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const Employee = employeeConnection.model('Employee', employeeSchema);

export default Employee;
