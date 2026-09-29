import express from 'express';
import multer from 'multer';
import { 
  createProfile, 
  updateProfile, 
  getProfiles, 
  getProfileById, 
  getProfileByEmail, 
  deleteProfile,
  generateResumeWithAI
} from '../controllers/profileController.js';
import path from 'path';

const router = express.Router();

// Multer storage config
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, 'uploads/');
  },
  filename(req, file, cb) {
    cb(null, `profile-${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
  }
});

const upload = multer({ storage });
const cpUpload = upload.fields([{ name: 'profileImage', maxCount: 1 }, { name: 'resume', maxCount: 1 }]);

// Routes
router.post('/generate-resume', generateResumeWithAI);
router.post('/', cpUpload, createProfile);
router.get('/', getProfiles);
router.get('/:id', getProfileById);
router.get('/email/:email', getProfileByEmail);
router.put('/:id', cpUpload, updateProfile);
router.delete('/:id', deleteProfile);

export default router;
