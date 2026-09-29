import express from 'express';
import {
    createEmployer,
    getEmployers,
    getEmployerById,
    updateEmployer,
    deleteEmployer,
    loginEmployer,
    getMe
} from '../controllers/employerController.js';

import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', createEmployer);
router.post('/login', loginEmployer);
router.get('/', getEmployers);
router.get('/me', protect, getMe);
router.get('/:id', protect, getEmployerById);
router.put('/:id', protect, updateEmployer);
router.delete('/:id', deleteEmployer);

export default router;
