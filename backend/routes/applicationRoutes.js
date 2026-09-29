import express from 'express';
import {
  applyToJob,
  getEmployeeApplications,
  getEmployerApplications,
  updateApplicationStatus
} from '../controllers/applicationController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, applyToJob);
router.get('/employee', protect, getEmployeeApplications);
router.get('/employer', protect, getEmployerApplications);
router.put('/employee/:id/status', protect, updateApplicationStatus);

export default router;
