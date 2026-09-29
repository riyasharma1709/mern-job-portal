import express from "express";
import {
  createJob,
  getJobs,
  getJobById,
  updateJob,
  deleteJob,
  getEmployerJobs,
  getSuggestedJobs
} from "../controllers/postJobController.js";

import upload from "../middleware/upload.js"; // multer
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();


// CREATE JOB 
router.post(
  "/",
  protect,
  upload.fields([
    { name: "photos", maxCount: 5 },
    { name: "video", maxCount: 1 }
  ]),
  createJob
);

// GET EMPLOYER JOBS
router.get("/employer", protect, getEmployerJobs);


// GET ALL JOBS
router.get("/", getJobs);

// GET SUGGESTED JOBS (AI)
router.get("/suggested", protect, getSuggestedJobs);


// GET SINGLE JOB
router.get("/:id", getJobById);


// UPDATE JOB (with optional files)
router.put(
  "/:id",
  protect,
  upload.fields([
    { name: "photos", maxCount: 5 },
    { name: "video", maxCount: 1 }
  ]),
  updateJob
);


// DELETE JOB
router.delete("/:id", protect, deleteJob);


export default router;