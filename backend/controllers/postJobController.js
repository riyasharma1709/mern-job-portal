import PostJob from "../models/PostJob.js";
import EmployeeProfile from "../models/EmployeeProfile.js";
import Employee from "../models/Employee.js"; // Added Employee model import
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config();

// Helper to extract JSON from AI response
const extractJSON = (text) => {
  try {
    // 1. Clean markdown code blocks if present
    let cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();

    // 2. Attempt to find the first '{' or '[' and the last '}' or ']'
    const jsonStart = cleanedText.indexOf('[');
    const jsonEnd = cleanedText.lastIndexOf(']');

    if (jsonStart !== -1 && jsonEnd !== -1) {
      const jsonContent = cleanedText.substring(jsonStart, jsonEnd + 1);
      return JSON.parse(jsonContent);
    }

    // Fallback for objects
    const objStart = cleanedText.indexOf('{');
    const objEnd = cleanedText.lastIndexOf('}');
    if (objStart !== -1 && objEnd !== -1) {
      const objContent = cleanedText.substring(objStart, objEnd + 1);
      return JSON.parse(objContent);
    }

    return JSON.parse(cleanedText);
  } catch (error) {
    console.error("Failed to parse JSON from AI response. Response text was:", text);
    throw new Error("AI returned invalid data format. Please try again.");
  }
};


// CREATE JOB
export const createJob = async (req, res) => {
  try {
    console.log("BODY:", req.body);
    console.log("FILES:", req.files);

    const { companyName, title, location, salary, skills, education, description } = req.body;

    //correct for upload.fields()
    const photos = req.files["photos"]?.map(file => file.path) || [];
    const video = req.files["video"]?.[0]?.path || "";

    // The protect middleware sets req.user
    const employerId = req.user.id;

    const job = new PostJob({
      employerId,
      companyName,
      title,
      location,
      salary,
      skills,
      education,
      description,
      photos,
      video
    });

    await job.save();

    res.status(201).json({
      message: "Job created successfully",
      job
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET JOBS FOR SPECIFIC EMPLOYER
export const getEmployerJobs = async (req, res) => {
  try {
    const jobs = await PostJob.find({ employerId: req.user.id }).sort({ createdAt: -1 });
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// GET ALL JOBS
export const getJobs = async (req, res) => {
  try {
    const jobs = await PostJob.find().sort({ createdAt: -1 });
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


//GET SINGLE JOB
export const getJobById = async (req, res) => {
  try {
    const job = await PostJob.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    res.json(job);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


//UPDATE JOB
export const updateJob = async (req, res) => {
  try {
    const { companyName, title, location, salary, skills, education, description } = req.body;

    let updateData = {
      companyName,
      title,
      location,
      salary,
      skills,
      education,
      description
    };

    // update photos if new uploaded
    if (req.files["photos"]) {
      updateData.photos = req.files["photos"].map(file => file.path);
    }

    // update video if new uploaded
    if (req.files["video"]) {
      updateData.video = req.files["video"][0].path;
    }

    const job = await PostJob.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    res.json({
      message: "Job updated successfully",
      job
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


//  DELETE JOB
export const deleteJob = async (req, res) => {
  try {
    await PostJob.findByIdAndDelete(req.params.id);

    res.json({ message: "Job deleted successfully" });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// AI JOB SUGGESTIONS
export const getSuggestedJobs = async (req, res) => {
  try {
    const userId = req.user.id;

    // 1. Get the User to find their email (since email isn't in the token)
    const user = await Employee.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // 2. Get Employee Profile using the found email
    const employee = await EmployeeProfile.findOne({ email: user.email });

    if (!employee) {
      return res.status(404).json({ message: "Profile not found. Please complete your profile first." });
    }

    // 2. Get All Jobs
    const allJobs = await PostJob.find().lean();

    if (allJobs.length === 0) {
      return res.status(200).json([]);
    }

    // 3. Use AI to match
    // const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    // const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash"
    });

    const prompt = `
      You are an expert recruitment assistant for the CareerQuest Job Portal.
      Your task is to match the following Employee Profile with the most suitable Jobs from the provided list.
      
      Employee Details:
      - Skills: ${employee.skills.join(", ")}
      - Qualification: ${employee.qualification}
      
      Jobs List (JSON format):
      ${JSON.stringify(allJobs.map(j => ({
      jobId: j._id,
      title: j.title,
      company: j.companyName,
      skillsRequired: j.skills,
      description: j.description.substring(0, 200) + (j.description.length > 200 ? "..." : "")
    })))}
      
      Instructions:
      1. Analyze the employee's skills and qualification against each job's requirements.
      2. Select up to 5 jobs that are the best matches.
      3. For each match, provide a concise, professional 1-sentence "reason" emphasizing the specific skill match.
      4. Return ONLY a valid JSON array of objects. Do not include any conversational text.
      
      Required JSON Schema:
      [
        {
          "jobId": "the_exact_jobId_from_the_list",
          "reason": "Professional explanation of why they matched."
        }
      ]
    `;

    console.log("AI Prompt:", prompt);
    const result = await model.generateContent(prompt);
    let aiResponseText = result.response.text();
    console.log("AI Response received:", aiResponseText);

    let suggestedMatches;
    try {
      suggestedMatches = extractJSON(aiResponseText);
      if (!Array.isArray(suggestedMatches)) {
        suggestedMatches = [suggestedMatches]; // Wrap if it's a single object
      }
    } catch (parseError) {
      console.error("AI JSON Parse Error. Response was:", aiResponseText);
      throw new Error("AI failed to format suggestions correctly. Please try again.");
    }

    // 4. Enrich the matches with full job details
    const suggestedJobs = suggestedMatches.map(match => {
      const jobDetails = allJobs.find(j => j._id.toString() === match.jobId);
      return jobDetails ? { ...jobDetails, matchReason: match.reason } : null;
    }).filter(j => j !== null);

    res.status(200).json(suggestedJobs);

  } catch (error) {
    console.error("AI Suggestions Error Details:", error);
    res.status(500).json({ message: "AI failed to generate suggestions", error: error.message });
  }
};