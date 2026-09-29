import express from 'express';
import {
    sendOtp,
    createEmployee,
    loginEmployee,
    getEmployees,
    getEmployeeById,
    updateEmployee,
    deleteEmployee,
    getMe,
    toggleSaveJob,
    getSavedJobs
} from '../controllers/employeeController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/send-otp', sendOtp);
router.post('/register', createEmployee);
router.post('/login', loginEmployee);
router.get('/', getEmployees);
router.get('/me', protect, getMe);
router.get('/:id', getEmployeeById);
router.put('/:id', protect, updateEmployee);
router.delete('/:id', protect, deleteEmployee);

// Saved Jobs routes
router.post('/save-job/:jobId', protect, toggleSaveJob);
router.get('/saved-jobs/me', protect, getSavedJobs);

export default router;
