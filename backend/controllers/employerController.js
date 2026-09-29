import Employer from '../models/Employer.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Create Employer
export const createEmployer = async (req, res) => {
  try {
    const { firstName, lastName, companyName, email, password } = req.body;

    // Check if employer exists
    const existingEmployer = await Employer.findOne({ email });
    if (existingEmployer) {
      return res.status(400).json({ message: 'Employer with this email already exists' });
    }

    const newEmployer = new Employer({ firstName, lastName, companyName, email, password });
    await newEmployer.save();

    res.status(201).json({ message: 'Employer registered successfully', employer: newEmployer });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Email must be unique' });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Login Employer
export const loginEmployer = async (req, res) => {
  try {
    const { email, password } = req.body;

    const employer = await Employer.findOne({ email });
    if (!employer || !(await employer.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { id: employer._id, role: 'employer' },
      process.env.JWT_SECRET || 'secretkey',
      { expiresIn: '30d' }
    );

    res.status(200).json({ message: 'Login successful', employer, token });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all Employers
export const getEmployers = async (req, res) => {
  try {
    const employers = await Employer.find().select('-password');
    res.status(200).json(employers);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get Me (current logged in Employer)
export const getMe = async (req, res) => {
  try {
    const employer = await Employer.findById(req.user.id).select('-password');
    if (!employer) {
      return res.status(404).json({ message: 'Employer not found' });
    }
    res.status(200).json(employer);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get single Employer by ID
export const getEmployerById = async (req, res) => {
  try {
    const employer = await Employer.findById(req.params.id).select('-password');
    if (!employer) {
      return res.status(404).json({ message: 'Employer not found' });
    }
    res.status(200).json(employer);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update Employer
export const updateEmployer = async (req, res) => {
  try {
    if (req.body.password) {
      const salt = await bcrypt.genSalt(10);
      req.body.password = await bcrypt.hash(req.body.password, salt);
    }
    const updatedEmployer = await Employer.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedEmployer) {
      return res.status(404).json({ message: 'Employer not found' });
    }
    res.status(200).json({ message: 'Employer updated successfully', employer: updatedEmployer });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Email must be unique' });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete Employer
export const deleteEmployer = async (req, res) => {
  try {
    const deletedEmployer = await Employer.findByIdAndDelete(req.params.id);
    if (!deletedEmployer) {
      return res.status(404).json({ message: 'Employer not found' });
    }
    res.status(200).json({ message: 'Employer deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
