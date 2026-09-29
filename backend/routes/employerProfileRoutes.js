import express from 'express';
import multer from 'multer';
import { upsertEmployerProfile, getEmployerProfile } from '../controllers/employerProfileController.js';
import { protect } from '../middleware/authMiddleware.js';
import path from 'path';

const router = express.Router();

// Multer storage config
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, 'uploads/');
  },
  filename(req, file, cb) {
    cb(null, `employerProfile-${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
  }
});

const upload = multer({ storage });
const cpUpload = upload.fields([
  { name: 'logo', maxCount: 1 }, 
  { name: 'photos', maxCount: 3 }, 
  { name: 'video', maxCount: 1 }
]);

// Routes
// We pass cpUpload before the controller function to handle file parsing
router.post('/', protect, cpUpload, upsertEmployerProfile);
router.get('/employer/:employerId', getEmployerProfile);

export default router;
