import mongoose from "mongoose";

const applicationSchema = new mongoose.Schema({
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PostJob',
    required: true
  },
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true
  },
  employerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employer',
    required: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Reviewed', 'Accepted', 'Rejected', 'Interviewing', 'Hired', 'Offer Received', 'Not Selected by Employer'],
    default: 'Pending'
  }
}, { timestamps: true });

const Application = mongoose.model('Application', applicationSchema);

export default Application;
