import Employee from '../models/Employee.js';
import PostJob from '../models/PostJob.js';
import bcrypt from 'bcryptjs';
import nodemailer from 'nodemailer';
import jwt from 'jsonwebtoken';
import twilio from 'twilio';
import dotenv from 'dotenv';
dotenv.config();

// Twilio initialization
const accountSid = (process.env.TWILIO_ACCOUNT_SID || '').trim();
const authToken = (process.env.TWILIO_AUTH_TOKEN || '').trim();

if (!accountSid || !authToken) {
  console.warn("TWILIO WARNING: AccountSid or AuthToken is missing from .env");
}

let twilioClient;
try {
  if (accountSid && authToken) {
    // Explicitly passing SID/Token to prevent "username is required"
    twilioClient = new twilio(accountSid, authToken);
  }
} catch (error) {
  console.error("Twilio initialization error:", error.message);
}

const otpStore = new Map();


// Configure nodemailer transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'riya.117092004@gmail.com',
    pass: 'vkhj ehse qyaz mqkh'
  }
});

//password-vkhj ehse qyaz mqkh
//password=vkhj ehse qyaz mqkh
export const sendOtp = async (req, res) => {
  try {
    const { email, phone } = req.body;

    // Check if employee exists by email or phone
    const existingEmployee = await Employee.findOne({ $or: [{ email }, { phone }] });
    if (existingEmployee) {
      if (existingEmployee.email === email) {
        return res.status(400).json({ message: 'Employee with this email already exists' });
      }
      if (existingEmployee.phone === phone) {
        return res.status(400).json({ message: 'Employee with this phone number already exists' });
      }
    }

    // Generate 6 digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Store OTP temporarily
    otpStore.set(email, { otp, expiresAt: Date.now() + 10 * 60 * 1000 }); // 10 minutes expiry

    // Send email
    const mailOptions = {
      from: 'riya.117092004@gmail.com',
      to: email,
      subject: 'Registration OTP for Job Portal',
      text: `Your OTP for Job Portal registration is: ${otp}. It is valid for 10 minutes.`
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: 'OTP sent successfully to email' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to send OTP', error: error.message });
  }
};

// Create Employee
export const createEmployee = async (req, res) => {
  try {
    const { name, email, phone, password, otp } = req.body;

    if (!otp) {
      return res.status(400).json({ message: 'OTP is required' });
    }

    const storedData = otpStore.get(email);
    if (!storedData) {
      return res.status(400).json({ message: 'No OTP generated for this email or OTP expired' });
    }

    if (Date.now() > storedData.expiresAt) {
      otpStore.delete(email);
      return res.status(400).json({ message: 'OTP has expired. Please request a new one' });
    }

    if (storedData.otp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    // Check if employee exists by email or phone
    const existingEmployee = await Employee.findOne({ $or: [{ email }, { phone }] });
    if (existingEmployee) {
      if (existingEmployee.email === email) {
        return res.status(400).json({ message: 'Employee with this email already exists' });
      }
      if (existingEmployee.phone === phone) {
        return res.status(400).json({ message: 'Employee with this phone number already exists' });
      }
    }

    const newEmployee = new Employee({ name, email, phone, password });
    await newEmployee.save();

    // Generate JWT token
    const token = jwt.sign(
      { id: newEmployee._id, role: 'employee' },
      process.env.JWT_SECRET || 'secretkey',
      { expiresIn: '30d' }
    );

    // Clear OTP after successful registration
    otpStore.delete(email);

    // Send Welcome Message via SMS
    try {
      if (twilioClient) {
        const formattedPhone = phone.startsWith('+') ? phone : `+91${phone}`;

        await twilioClient.messages.create({
          body: 'Thank you for registering with CareerQuest!',
          from: (process.env.TWILIO_PHONE_NUMBER || '').trim(),
          to: formattedPhone
        });
        console.log(`Welcome SMS sent to ${formattedPhone}`);
      } else {
        console.warn('Twilio client not initialized. Check your .env file.');
      }
    } catch (smsError) {
      console.error('Failed to send welcome SMS:', smsError.message);
      // We don't return error here because the employee is already created
    }

    res.status(201).json({ message: 'Employee registered successfully', employee: newEmployee, token });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Email and Phone must be unique' });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all Employees
export const getEmployees = async (req, res) => {
  try {
    const employees = await Employee.find().select('-password');
    res.status(200).json(employees);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Login Employee
export const loginEmployee = async (req, res) => {
  try {
    const { email, password } = req.body;

    const employee = await Employee.findOne({ email });
    if (!employee || !(await employee.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { id: employee._id, role: 'employee' },
      process.env.JWT_SECRET || 'secretkey',
      { expiresIn: '30d' }
    );

    res.status(200).json({ message: 'Login successful', employee, token });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get Me (current logged in Employee)
export const getMe = async (req, res) => {
  try {
    const employee = await Employee.findById(req.user.id).select('-password');
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    res.status(200).json(employee);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get single Employee by ID
export const getEmployeeById = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id).select('-password');
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    res.status(200).json(employee);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update Employee
export const updateEmployee = async (req, res) => {
  try {
    if (req.body.password) {
      const salt = await bcrypt.genSalt(10);
      req.body.password = await bcrypt.hash(req.body.password, salt);
    }
    const updatedEmployee = await Employee.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedEmployee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    res.status(200).json({ message: 'Employee updated successfully', employee: updatedEmployee });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Email and Phone must be unique' });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete Employee
export const deleteEmployee = async (req, res) => {
  try {
    const deletedEmployee = await Employee.findByIdAndDelete(req.params.id);
    if (!deletedEmployee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    res.status(200).json({ message: 'Employee deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Toggle Save Job
export const toggleSaveJob = async (req, res) => {
  try {
    const employeeId = req.user.id;
    const { jobId } = req.params;

    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    if (!employee.savedJobs) {
      employee.savedJobs = [];
    }

    const jobIndex = employee.savedJobs.findIndex(id => id.toString() === jobId);
    let message = '';

    if (jobIndex === -1) {
      // Add job
      employee.savedJobs.push(jobId);
      message = 'Job saved successfully';
    } else {
      // Remove job
      employee.savedJobs.splice(jobIndex, 1);
      message = 'Job removed from saved list';
    }

    await employee.save();

    // Return updated saved jobs array
    res.status(200).json({ message, savedJobs: employee.savedJobs });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get Saved Jobs
export const getSavedJobs = async (req, res) => {
  try {
    const employeeId = req.user.id;

    const employee = await Employee.findById(employeeId);

    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    if (!employee.savedJobs || employee.savedJobs.length === 0) {
      return res.status(200).json([]);
    }

    // Manual lookup since PostJob uses a different mongoose connection than Employee
    const savedJobs = await PostJob.find({ _id: { $in: employee.savedJobs } });

    res.status(200).json(savedJobs);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
