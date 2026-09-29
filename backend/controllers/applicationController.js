import Application from '../models/Application.js';
import PostJob from '../models/PostJob.js';
import EmployeeProfile from '../models/EmployeeProfile.js';
import Employee from '../models/Employee.js';

// Apply to a job (Employee)
export const applyToJob = async (req, res) => {
  try {
    const { jobId, employerId } = req.body;
    const employeeId = req.user.id;

    if (!jobId || !employerId) {
      return res.status(400).json({ message: 'Job ID and Employer ID are required to apply.' });
    }

    // Check if valid ObjectIds (simple check)
    if (jobId.length < 24 || employerId.length < 24) {
       return res.status(400).json({ message: 'Invalid Job or Employer data.' });
    }

    // Check if already applied
    const existingApplication = await Application.findOne({ jobId, employeeId });
    if (existingApplication) {
      return res.status(400).json({ message: 'You have already applied to this job.' });
    }

    const application = new Application({
      jobId,
      employerId,
      employeeId
    });

    await application.save();
    res.status(201).json({ message: 'Applied successfully', application });
  } catch (error) {
    console.error("Apply to job error:", error);
    res.status(500).json({ message: 'Server error during application', error: error.message });
  }
};

// Get employee's applications (Employee)
export const getEmployeeApplications = async (req, res) => {
  try {
    const employeeId = req.user.id;
    const applications = await Application.find({ employeeId })
      .populate('jobId')
      .populate('employerId', 'companyName firstName lastName email')
      .sort({ createdAt: -1 });
    
    res.status(200).json(applications);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get employer's applicants (Employer)
export const getEmployerApplications = async (req, res) => {
  try {
    const employerId = req.user.id;
    
    // Find all applications for this employer
    const applications = await Application.find({ employerId })
      .populate('jobId')
      .sort({ createdAt: -1 })
      .lean(); // Use lean to easily modify the objects

    // We also want to fetch the employee profiles for their resume info
    // EmployeeProfile uses 'email' essentially to link to Employee or we can query by email.
    for (let app of applications) {
      if (app.employeeId) {
        const employee = await Employee.findById(app.employeeId).select('name email phone').lean();
        app.employeeId = employee || app.employeeId;
        
        if (employee && employee.email) {
          const profile = await EmployeeProfile.findOne({ email: employee.email });
          app.employeeProfile = profile;
        }
      }
    }

    res.status(200).json(applications);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update an application status (Employee/Employer)
export const updateApplicationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const application = await Application.findById(id);

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    application.status = status;
    await application.save();

    res.status(200).json({ message: 'Status updated successfully', application });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
