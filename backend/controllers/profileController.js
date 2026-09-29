import EmployeeProfile from '../models/EmployeeProfile.js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
dotenv.config();

// Helper to extract JSON from AI response
const extractJSON = (text) => {
  try {
    const objStart = text.indexOf('{');
    const objEnd = text.lastIndexOf('}');
    if (objStart !== -1 && objEnd !== -1) {
      const objContent = text.substring(objStart, objEnd + 1);
      return JSON.parse(objContent);
    }
    return JSON.parse(text);
  } catch (error) {
    console.error("Failed to parse JSON from AI response:", text);
    throw new Error("AI returned invalid JSON format.");
  }
};

// Create Profile
export const createProfile = async (req, res) => {
  try {
    const { email, name, phone, location, qualification, skills } = req.body;

    let profileData = {
      email,
      name,
      phone,
      location,
      qualification,
      skills: Array.isArray(skills) ? skills : (skills ? skills.split(',').map(s => s.trim()) : [])
    };

    if (req.files) {
      if (req.files.profileImage && req.files.profileImage.length > 0) {
        profileData.profileImage = req.files.profileImage[0].path.replace(/\\/g, '/');
      }
      if (req.files.resume && req.files.resume.length > 0) {
        profileData.resume = req.files.resume[0].path.replace(/\\/g, '/');
      }
    }

    const newProfile = new EmployeeProfile(profileData);
    await newProfile.save();

    res.status(201).json({ message: 'Profile created successfully', profile: newProfile });
  } catch (error) {
    if (error.code === 11000) {
      if (error.keyPattern && error.keyPattern.phone) return res.status(400).json({ message: 'Phone number must be unique' });
      if (error.keyPattern && error.keyPattern.email) return res.status(400).json({ message: 'Email must be unique' });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update Profile
export const updateProfile = async (req, res) => {
  try {
    const { email, name, phone, location, qualification, skills } = req.body;

    let profileData = {
      email,
      name,
      phone,
      location,
      qualification,
      skills: Array.isArray(skills) ? skills : (skills ? skills.split(',').map(s => s.trim()) : [])
    };

    if (req.files) {
      if (req.files.profileImage && req.files.profileImage.length > 0) {
        profileData.profileImage = req.files.profileImage[0].path.replace(/\\/g, '/');
      }
      if (req.files.resume && req.files.resume.length > 0) {
        profileData.resume = req.files.resume[0].path.replace(/\\/g, '/');
      }
    }

    const updatedProfile = await EmployeeProfile.findByIdAndUpdate(
      req.params.id,
      profileData,
      { new: true, runValidators: true }
    );

    if (!updatedProfile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    res.status(200).json({ message: 'Profile updated successfully', profile: updatedProfile });
  } catch (error) {
    if (error.code === 11000) {
      if (error.keyPattern && error.keyPattern.phone) return res.status(400).json({ message: 'Phone number must be unique' });
      if (error.keyPattern && error.keyPattern.email) return res.status(400).json({ message: 'Email must be unique' });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all Profiles
export const getProfiles = async (req, res) => {
  try {
    const profiles = await EmployeeProfile.find();
    res.status(200).json(profiles);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get Profile by ID
export const getProfileById = async (req, res) => {
  try {
    const profile = await EmployeeProfile.findById(req.params.id);
    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }
    res.status(200).json(profile);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get Profile by Email
export const getProfileByEmail = async (req, res) => {
  try {
    const profile = await EmployeeProfile.findOne({ email: req.params.email });
    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }
    res.status(200).json(profile);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete Profile
export const deleteProfile = async (req, res) => {
  try {
    const deletedProfile = await EmployeeProfile.findByIdAndDelete(req.params.id);
    if (!deletedProfile) {
      return res.status(404).json({ message: 'Profile not found' });
    }
    res.status(200).json({ message: 'Profile deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Generate Resume with AI
export const generateResumeWithAI = async (req, res) => {
  try {
    const { name, email, phone, location, qualification, skills } = req.body;

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ message: 'GEMINI_API_KEY is not configured in the backend.' });
    }

    // const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    // const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash"
    });

    // Fetch existing profile to get their uploaded resume
    const employeeProfile = await EmployeeProfile.findOne({ email });
    const existingResume = employeeProfile?.resume;

    // Ensure skills is an array for the prompt
    let skillsList = Array.isArray(skills) ? skills.join(', ') : (skills || '');

    const prompt = `You are an expert resume writer. Given the following details of an employee:
Name: ${name || 'N/A'}
Email: ${email || 'N/A'}
Phone: ${phone || 'N/A'}
Location: ${location || 'N/A'}
Qualification: ${qualification || 'N/A'}
Skills: ${skillsList}

If a document is attached, it is the employee's existing resume. Carefully read it and extract their real projects, certifications, robust skills, and past experience.

Combine their form details and their attached resume (if provided) to generate a highly professional JSON response with TWO keys:
1. "summary": A highly impactful 3-4 sentence professional summary based on their skills, qualification, and attached resume history.
2. "experience": An array of 3 to 5 bullet points (strings), describing their actual projects, certificates, or professional experience extracted from the uploaded document, or generalized ones if no document/data is available. Make it read beautifully for recruiters.
Return ONLY valid JSON.`;

    let promptParts = [prompt];

    if (existingResume && existingResume.endsWith('.pdf')) {
      const fullPath = path.join(process.cwd(), existingResume);
      if (fs.existsSync(fullPath)) {
        promptParts.push({
          inlineData: {
            data: Buffer.from(fs.readFileSync(fullPath)).toString("base64"),
            mimeType: "application/pdf"
          }
        });
      }
    }

    const result = await model.generateContent(promptParts);
    let aiResponseText = result.response.text();
    console.log("AI Resume Response received:", aiResponseText);

    let aiData;
    try {
      aiData = extractJSON(aiResponseText);
    } catch (e) {
      console.error("AI Resume JSON parse error:", e, "Response was:", aiResponseText);
      return res.status(500).json({ message: 'AI failed to format resume data. Please try again.' });
    }

    // Create a new PDF document using PDFKit
    const doc = new PDFDocument({ margin: 50 });

    // Use uploads directory
    const uploadsDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir);
    }

    // Name specifically as AI generated with employee name
    const sanitizedName = (name || 'Employee').replace(/[^a-zA-Z0-9]/g, '_');
    const filename = `${sanitizedName}_AI_Resume_${Date.now()}.pdf`;
    const filePath = path.join(uploadsDir, filename);
    const fileStream = fs.createWriteStream(filePath);

    doc.pipe(fileStream);

    // Header
    doc.fontSize(24).font('Helvetica-Bold').text((name || 'Your Name').toUpperCase(), { align: 'center' });
    doc.moveDown(0.2);
    doc.fontSize(10).font('Helvetica').text(`${email || 'N/A'} | ${phone || 'N/A'} | ${location || 'N/A'}`, { align: 'center' });

    // Spacer
    doc.moveDown(2);

    // Summary line
    doc.fontSize(14).font('Helvetica-Bold').fillColor('#333333').text('PROFESSIONAL SUMMARY');
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown(0.5);
    doc.fontSize(11).font('Helvetica').fillColor('black').text(aiData.summary || 'A professional summary goes here.', { align: 'justify' });

    // Spacer
    doc.moveDown(1.5);

    // Skills
    doc.fontSize(14).font('Helvetica-Bold').fillColor('#333333').text('SKILLS');
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown(0.5);
    doc.fontSize(11).font('Helvetica').fillColor('black').text(skillsList, { align: 'left' });

    // Spacer
    doc.moveDown(1.5);

    // Experience / Projects
    doc.fontSize(14).font('Helvetica-Bold').fillColor('#333333').text('KEY PROJECTS / EXPERIENCE');
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown(0.5);

    if (aiData.experience && Array.isArray(aiData.experience)) {
      aiData.experience.forEach(exp => {
        doc.fontSize(11).font('Helvetica').text(`• ${exp}`, { align: 'justify' });
        doc.moveDown(0.5);
      });
    }

    // Spacer
    doc.moveDown(1);

    // Education
    doc.fontSize(14).font('Helvetica-Bold').fillColor('#333333').text('EDUCATION');
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown(0.5);
    doc.fontSize(11).font('Helvetica').fillColor('black').text(qualification || 'N/A', { align: 'left' });

    doc.end();

    fileStream.on('finish', async () => {
      // Path format corresponding to Multer upload storage format
      const dbPath = `uploads/${filename}`;

      // Deliberately NOT overwriting the existing employee profile resume DB record here.
      // We will only return the file URL so the frontend can securely open/download it.
      return res.status(200).json({
        message: 'Resume generated successfully',
        fileUrl: dbPath
      });
    });

    fileStream.on('error', (err) => {
      console.error(err);
      res.status(500).json({ message: 'Error writing PDF file' });
    });

  } catch (error) {
    console.error("AI Resume Error Details:", error);
    res.status(500).json({ message: 'Server error generating resume', error: error.message });
  }
};
